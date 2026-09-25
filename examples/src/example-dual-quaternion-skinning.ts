import * as g from 'gpucat';
import { d } from 'gpucat';
import { mat4, quat, quat2, type Vec3, vec3 } from 'math';
import { createPanel } from './common/dash';
import { createInfo } from './common/info';
import { ink, light, pixels } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, palette, spectrum } from './common/theme';

// The candy wrapper, side by side. Two identical tubes are bound to the same
// two bones and twisted by the same angle, and the only difference is how the
// two bone transforms are blended per vertex.
//
// On the left the bones are mat4s, blended by weighted sum - linear blend
// skinning, which is what most skinned meshes still use. Averaging two rotation
// matrices does not give a rotation: halfway through a half turn the sum is a
// matrix that flattens x and z to nothing, so the tube pinches to a thread.
//
// On the right the same bones are quat2s - dual quaternions, which carry a
// rotation and a translation as one number that can be blended. quat2.lerp then
// quat2.normalize is the whole of dual quaternion linear blending, and because
// normalising lands back on a rigid transform the tube keeps its volume all the
// way round.
//
// quat2.lerp takes the straight line between two dual quaternions, so a pair
// pointing opposite ways would blend through the long way. quat2.dot catches
// that and the sign is flipped first, which is why the twist stays smooth past
// half a turn.

const RINGS = 52; // vertex rows along the tube
const SEGMENTS = 28; // around it
const RADIUS = 0.34;
const HEIGHT = 2.6;
const SPLIT = 1.05; // how far each tube sits from the middle

type Settings = { twist: number; auto: boolean; rate: number; falloff: number };

const settings: Settings = { twist: 180, auto: true, rate: 0.7, falloff: 0.5 };

/* the tube */

/** A tube along y, with enough rows that the weights vary smoothly down it. */
function createTube() {
    const positions: number[] = [];
    const indices: number[] = [];

    for (let r = 0; r < RINGS; r++) {
        const y = -HEIGHT / 2 + (r / (RINGS - 1)) * HEIGHT;
        for (let s = 0; s < SEGMENTS; s++) {
            const angle = (s / SEGMENTS) * Math.PI * 2;
            const nx = Math.cos(angle);
            const nz = Math.sin(angle);
            positions.push(nx * RADIUS, y, nz * RADIUS);
        }
    }

    for (let r = 0; r < RINGS - 1; r++) {
        for (let s = 0; s < SEGMENTS; s++) {
            const a = r * SEGMENTS + s;
            const b = r * SEGMENTS + ((s + 1) % SEGMENTS);
            const c = (r + 1) * SEGMENTS + s;
            const e = (r + 1) * SEGMENTS + ((s + 1) % SEGMENTS);
            indices.push(a, c, b, b, c, e);
        }
    }

    return {
        positions: new Float32Array(positions),
        indices: new Uint32Array(indices),
    };
}

const rest = createTube();
const VERTICES = rest.positions.length / 3;

/**
 * How much of the second bone each vertex answers to, easing across the middle
 * of the tube. A hard cut would hide the artifact - it only shows where a
 * vertex is genuinely caught between two transforms.
 */
const weights = new Float32Array(VERTICES);
function weigh(falloff: number): void {
    const lower = 0.5 - falloff / 2;
    const span = Math.max(falloff, 1e-4);
    for (let i = 0; i < VERTICES; i++) {
        const along = (rest.positions[i * 3 + 1] + HEIGHT / 2) / HEIGHT;
        const t = Math.min(1, Math.max(0, (along - lower) / span));
        weights[i] = t * t * (3 - 2 * t); // smoothstep
    }
}
weigh(settings.falloff);

/* the two bones */

// both bones share an origin and carry no translation, so what separates the
// two tubes is purely how a rotation is blended
const AXIS: Vec3 = [0, 1, 0];
const ORIGIN: Vec3 = [0, 0, 0];

const boneRotation = quat.create();

const matrixBone = mat4.create();
const matrixRest = mat4.identity(mat4.create());
const blendedMatrix = mat4.create();

const dualBone = quat2.create();
const dualRest = quat2.identity(quat2.create());
const flippedBone = quat2.create();
const blendedDual = quat2.create();
const blendedReal = quat.create();

/** Rebuilds both representations of the twisted bone for this frame. */
function setBone(angle: number): void {
    quat.setAxisAngle(boneRotation, AXIS, angle);
    mat4.fromRotationTranslation(matrixBone, boneRotation, ORIGIN);
    quat2.fromRotationTranslation(dualBone, boneRotation, ORIGIN);
}

const _skin_position = vec3.create();
const _skin_rotated = vec3.create();

/** Linear blend skinning: average the matrices, then transform. */
function skinWithMatrices(positions: Float32Array): void {
    for (let i = 0; i < VERTICES; i++) {
        const w = weights[i];
        // a weighted sum of two rotation matrices, which is not itself a
        // rotation - at w = 0.5 of a half turn it scales x and z to zero
        mat4.multiplyScalar(blendedMatrix, matrixRest, 1 - w);
        mat4.multiplyScalarAndAdd(blendedMatrix, blendedMatrix, matrixBone, w);

        vec3.set(_skin_position, rest.positions[i * 3], rest.positions[i * 3 + 1], rest.positions[i * 3 + 2]);
        vec3.transformMat4(_skin_position, _skin_position, blendedMatrix);
        vec3.toBuffer(positions, _skin_position, i * 3);
    }
}

/** Dual quaternion linear blending: lerp the dual quats, normalise, then transform. */
function skinWithDualQuaternions(positions: Float32Array): void {
    // a dual quaternion and its negation are the same transform, so blending
    // toward the wrong sign takes the long way round. One dot decides it, and
    // the fix is to negate the operand - negating the weight instead is a
    // different expression entirely, and jumps the moment the sign changes
    const target = quat2.dot(dualRest, dualBone) < 0 ? quat2.scale(flippedBone, dualBone, -1) : dualBone;

    for (let i = 0; i < VERTICES; i++) {
        const w = weights[i];
        quat2.lerp(blendedDual, dualRest, target, w);
        // lerp lands off the unit hypersphere, most at w = 0.5. Normalising is
        // what pulls it back onto a rigid transform, and is why nothing squashes
        quat2.normalize(blendedDual, blendedDual);

        quat2.getReal(blendedReal, blendedDual);
        quat2.getTranslation(_skin_position, blendedDual);

        vec3.set(_skin_rotated, rest.positions[i * 3], rest.positions[i * 3 + 1], rest.positions[i * 3 + 2]);
        vec3.transformQuat(_skin_rotated, _skin_rotated, blendedReal);
        vec3.add(_skin_position, _skin_rotated, _skin_position);

        vec3.toBuffer(positions, _skin_position, i * 3);
    }
}

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.style.touchAction = 'none';

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[1] = 0.6;
camera.position[2] = 4.4;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* the two tubes */

// Sample the surface grid without drawing the triangulation diagonals.
const edgeIndices: number[] = [];
for (let r = 0; r < RINGS; r++) {
    for (let s = 0; s < SEGMENTS; s++) {
        if (r % 6 === 0 || r === RINGS - 1) {
            edgeIndices.push(r * SEGMENTS + s, r * SEGMENTS + ((s + 1) % SEGMENTS));
        }
        if (r < RINGS - 1 && s % 2 === 0) {
            edgeIndices.push(r * SEGMENTS + s, (r + 1) * SEGMENTS + s);
        }
    }
}

function createTubeMesh(x: number) {
    const positions = new Float32Array(rest.positions);
    const positionBuffer = g.createVertexBuffer(d.vec3f, positions);
    const geometry = new g.Geometry();
    geometry.setBuffer('position', positionBuffer);
    geometry.setIndex(g.createIndexBuffer(rest.indices));

    const localPosition = g.attribute('position', d.vec3f);
    const world = g.mul(g.modelWorldMatrix, g.vec4(localPosition, g.f32(1)));
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
    // The unlit surface hides rear lines, keeping the visible grid uncluttered.
    const mesh = new g.Mesh(
        geometry,
        new g.Material({
            vertex: clip,
            fragment: g.vec4(ink(palette.base), g.f32(1)),
            cullMode: 'none',
            depthBias: 1,
            depthBiasSlopeScale: 1,
        }),
    );
    mesh.position[0] = x;
    scene.add(mesh);

    const linePositions = new Float32Array(edgeIndices.length * 3);
    const lineGeometry = new g.LineSegmentsGeometry(linePositions, edgeIndices.length);
    const lines = new g.LineSegments(
        lineGeometry,
        new g.LineMaterial({ color: g.vec4(light, g.f32(1)), lineWidth: pixels(1.25) }),
    );
    lines.position[0] = x;
    scene.add(lines);

    return { positions, positionBuffer, linePositions, lineGeometry };
}

const matrixTube = createTubeMesh(-SPLIT);
const dualTube = createTubeMesh(SPLIT);

const ringPositions = new Float32Array(SEGMENTS * 12);
const ringGeometry = new g.LineSegmentsGeometry(ringPositions, SEGMENTS * 4);
const ring = new g.LineSegments(
    ringGeometry,
    new g.LineMaterial({ color: g.vec4(ink(spectrum[5]), g.f32(1)), lineWidth: pixels(2) }),
);
scene.add(ring);

function updateTube(tube: ReturnType<typeof createTubeMesh>): void {
    tube.positionBuffer.needsUpdate = true;
    for (let i = 0; i < edgeIndices.length; i++) {
        const source = edgeIndices[i] * 3;
        tube.linePositions[i * 3] = tube.positions[source];
        tube.linePositions[i * 3 + 1] = tube.positions[source + 1];
        tube.linePositions[i * 3 + 2] = tube.positions[source + 2];
    }
    tube.lineGeometry.update(tube.linePositions);
}

const readout = createInfo();
readout.innerHTML =
    'Same twist, two blending methods' +
    '<br>Left · Linear blend / pinches at the middle' +
    '<br>Right · Dual quaternion / preserves volume';

/* panel */

const panel = createPanel('dual quaternion skinning', palette.light);
panel.add(settings, 'twist', { min: -360, max: 360, step: 1, label: 'Twist' });
panel.add(settings, 'auto', { label: 'Animate' });
panel.add(settings, 'rate', { min: 0.05, max: 3, step: 0.05, label: 'Rate' });
panel
    .add(settings, 'falloff', { min: 0.05, max: 1, step: 0.01, label: 'Weight falloff' })
    .onChange(() => weigh(settings.falloff));
panel.monitor(() => 'mat4 blend', { label: 'left' });
panel.monitor(() => 'quat2 blend', { label: 'right' });
panel.monitor(() => VERTICES * 2, { label: 'vertices skinned' });

/* render */

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let clock = 0;
let last = -1;

function frame(tms: number) {
    const t = tms / 1000;
    if (last < 0) last = t;
    const delta = Math.min(t - last, 0.05);
    last = t;

    if (settings.auto) {
        // the twist eases between a half turn each way and never crosses one.
        // A blend along the shortest arc has to change its mind at exactly half
        // a turn - one side of it a half-weighted vertex is carried most of the
        // way round, the other side it is carried the same distance the other
        // way - so a bone that wraps past 180 tears every partly weighted
        // vertex, while the fully weighted ends sit still. Staying inside that
        // is what keeps this loop continuous, and 180 is where the two blends
        // disagree most anyway
        clock += delta * settings.rate;
        settings.twist = Math.sin(clock) * 175;
    }

    setBone((settings.twist * Math.PI) / 180);
    skinWithMatrices(matrixTube.positions);
    skinWithDualQuaternions(dualTube.positions);
    updateTube(matrixTube);
    updateTube(dualTube);
    // Matching rings show how each blend changes the same cross section.
    for (let tube = 0; tube < 2; tube++) {
        const positions = tube === 0 ? matrixTube.positions : dualTube.positions;
        const offset = tube === 0 ? -SPLIT : SPLIT;
        for (let s = 0; s < SEGMENTS; s++) {
            for (let end = 0; end < 2; end++) {
                const source = (24 * SEGMENTS + ((s + end) % SEGMENTS)) * 3;
                const target = (tube * SEGMENTS + s) * 6 + end * 3;
                ringPositions[target] = positions[source] * 1.002 + offset;
                ringPositions[target + 1] = positions[source + 1];
                ringPositions[target + 2] = positions[source + 2] * 1.002;
            }
        }
    }
    ringGeometry.update(ringPositions);

    controls.update();
    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
