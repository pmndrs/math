import * as g from 'gpucat';
import { d } from 'gpucat';
import { mat3, quat, vec3, type Vec3 } from 'math';
import { obb3, type OBB3 } from 'math/shapes';
import { createPanel } from './common/dash';
import { createInfo } from './common/info';
import { ink, light, pixels } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, palette, spectrum } from './common/theme';

// A fixed lattice of sample points and an oriented box tumbling through it.
// Each point asks obb3.containsPoint every frame. Green means inside the box,
// grey means outside. The wire outline makes the tested volume explicit.

const N = 14; // points per axis
const EXTENT = 3.0; // half-width of the lattice cube
const MARKER = 0.035;
const COUNT = N * N * N;
const ACCENT = spectrum[5];

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[0] = 6.5;
camera.position[1] = 5;
camera.position[2] = 7.5;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* fixed sample positions and a binary containment result */

const positions: Vec3[] = [];
const instanceMatrices = new Float32Array(COUNT * 16);
let idx = 0;
for (let ix = 0; ix < N; ix++) {
    for (let iy = 0; iy < N; iy++) {
        for (let iz = 0; iz < N; iz++) {
            const x = -EXTENT + (ix / (N - 1)) * 2 * EXTENT;
            const y = -EXTENT + (iy / (N - 1)) * 2 * EXTENT;
            const z = -EXTENT + (iz / (N - 1)) * 2 * EXTENT;
            positions.push([x, y, z]);
            // translation + uniform scale, column-major
            const o = idx * 16;
            instanceMatrices[o + 0] = MARKER;
            instanceMatrices[o + 5] = MARKER;
            instanceMatrices[o + 10] = MARKER;
            instanceMatrices[o + 12] = x;
            instanceMatrices[o + 13] = y;
            instanceMatrices[o + 14] = z;
            instanceMatrices[o + 15] = 1;
            idx++;
        }
    }
}

// Membership changes immediately so the color matches the current box.
const membership = new Float32Array(COUNT);
const membershipBuffer = g.createVertexBuffer(d.f32, membership);

const sphereGeometry = g.createSphereGeometry(1, 8, 6);

const stride = 16 * 4;
const col0 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 0, instanced: true });
const col1 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 16, instanced: true });
const col2 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 32, instanced: true });
const col3 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 48, instanced: true });
const instanceTransform = g.mat4(col0, col1, col2, col3);
const instanceInside = g.attribute(membershipBuffer, { stride: 4, offset: 0, instanced: true });

const showOutside = g.uniform(g.f32(1));
const pos = g.attribute('position', d.vec3f);
// The opaque context draws first. Contained points then overlay it at full opacity.
function addPoints(inside: boolean): void {
    const visible = inside ? instanceInside : g.f32(1).sub(instanceInside).mul(showOutside);
    const world = g.mul(instanceTransform, g.vec4(pos.mul(visible), g.f32(1)));
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
    const material = new g.Material({
        vertex: clip,
        fragment: g.vec4(ink(inside ? ACCENT : palette.dim), g.f32(1)),
        transparent: inside,
        depthTest: !inside,
        depthWrite: !inside,
    });
    const points = new g.Mesh(sphereGeometry, material);
    points.count = COUNT;
    scene.add(points);
}
addPoints(false);
addPoints(true);
scene.updateWorldMatrix();

/* the oriented box and its twelve edges */

const obb: OBB3 = obb3.create();
obb.halfExtents = [2.1, 0.8, 1.3]; // a distinct, non-cube box so the rotation reads clearly
const spin = quat.create();
const SPIN_AXIS = vec3.normalize(vec3.create(), [0.32, 0.9, 0.28]);

const boxCorners = new Float32Array(8 * 3);
const boxSegments = new Float32Array(12 * 2 * 3);
const boxGeometry = new g.LineSegmentsGeometry(boxSegments, 24);
const boxOutline = new g.LineSegments(
    boxGeometry,
    new g.LineMaterial({ color: g.vec4(light, g.f32(1)), lineWidth: pixels(1.5) }),
);
scene.add(boxOutline);

const _updateBox_corner = vec3.create();

function updateBoxOutline(): void {
    for (let i = 0; i < 8; i++) {
        vec3.set(
            _updateBox_corner,
            (i & 1 ? 1 : -1) * obb.halfExtents[0],
            (i & 2 ? 1 : -1) * obb.halfExtents[1],
            (i & 4 ? 1 : -1) * obb.halfExtents[2],
        );
        vec3.transformMat3(_updateBox_corner, _updateBox_corner, obb.rotation);
        vec3.add(_updateBox_corner, _updateBox_corner, obb.center);
        vec3.toBuffer(boxCorners, _updateBox_corner, i * 3);
    }
    let offset = 0;
    for (let i = 0; i < 8; i++) {
        for (let bit = 1; bit <= 4; bit *= 2) {
            if (i & bit) continue;
            const j = i | bit;
            for (let k = 0; k < 3; k++) boxSegments[offset++] = boxCorners[i * 3 + k];
            for (let k = 0; k < 3; k++) boxSegments[offset++] = boxCorners[j * 3 + k];
        }
    }
    boxGeometry.update(boxSegments);
}

const settings = { speed: 0.6, outside: true };

/* ui */

const panel = createPanel('contains point', ACCENT);
panel.add(settings, 'speed', { min: 0, max: 3, step: 0.01, label: 'Speed' });
panel.add(settings, 'outside', { label: 'Outside points' }).onChange(() => {
    showOutside.value = settings.outside ? 1 : 0;
});
const readout = createInfo();
readout.innerHTML =
    '<strong>Which points are inside the box?</strong>' +
    `<br><span style="color:${ACCENT}">●</span> Inside &nbsp; <span style="color:${palette.muted}">●</span> Outside &nbsp; ━ Box boundary` +
    '<br><span class="mc-dim">Drag to orbit · set speed to 0 to inspect</span>';
let insideCount = 0;
panel.monitor(() => insideCount, { label: 'inside', format: (value) => `${value} / ${COUNT}` });

/* render loop */

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let clock = 0;
let lastT = performance.now();

function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    clock += dt * settings.speed;

    // drift the box through the lattice while tumbling it about a tilted axis
    vec3.set(obb.center, Math.cos(clock * 0.43) * 1.6, Math.sin(clock * 0.6) * 1.2, Math.sin(clock * 0.31) * 1.6);
    quat.setAxisAngle(spin, SPIN_AXIS, clock * 0.9);
    mat3.fromQuat(obb.rotation, spin);
    updateBoxOutline();

    // every lattice point asks the box whether it's inside
    insideCount = 0;
    for (let i = 0; i < COUNT; i++) {
        const inside = obb3.containsPoint(obb, positions[i]);
        if (inside) insideCount++;
        membership[i] = inside ? 1 : 0;
    }
    membershipBuffer.needsUpdate = true;

    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
