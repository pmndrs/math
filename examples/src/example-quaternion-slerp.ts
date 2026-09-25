import * as g from 'gpucat';
import { d } from 'gpucat';
import { type Euler, euler, type Quat, quat } from 'math';
import { mulberry32 } from 'math/random';
import { createInfo } from './common/info';
import { ink, light, pixels } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, spectrum } from './common/theme';

// One orientation, two ways to interpolate it between random keyframes. The
// accent outline uses quat.slerp. The neutral wireframe lerps euler angles
// (euler.fromQuat -> lerp -> quat.fromEuler). They coincide
// at every keyframe, but between them the ghost twists off-axis: that gap is the
// error, and the readout reports it as the angle between the two orientations.

const KEYFRAMES = 5;
const SEG_DURATION = 2.2; // seconds per keyframe transition
const ACCENT = spectrum[4];

// random keyframe orientations (seeded)
const rng = mulberry32.create(3);
const keyframes: Quat[] = [];
for (let i = 0; i < KEYFRAMES; i++) {
    let ax = mulberry32.sample(rng) * 2 - 1;
    let ay = mulberry32.sample(rng) * 2 - 1;
    let az = mulberry32.sample(rng) * 2 - 1;
    const len = Math.hypot(ax, ay, az) || 1;
    ax /= len;
    ay /= len;
    az /= len;
    const angle = mulberry32.sample(rng) * Math.PI * 2;
    const q = quat.create();
    quat.setAxisAngle(q, [ax, ay, az], angle);
    keyframes.push(q);
}

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[2] = 3.6;
camera.updateProjectionMatrix();
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* boxes */

// A flat translucent fill makes the SLERP outline easier to follow.
const boxGeometry = g.createBoxGeometry(1, 1, 1);
const pos = g.attribute('position', d.vec3f);
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)))));
const boxMaterial = new g.Material({
    vertex: clip,
    fragment: g.vec4(ink(ACCENT), g.f32(0.08)),
    transparent: true,
    depthWrite: false,
});

const slerpBox = new g.Mesh(boxGeometry, boxMaterial);
scene.add(slerpBox);

function boxEdges(halfExtent: number) {
    const points: number[] = [];
    for (const a of [-halfExtent, halfExtent]) {
        for (const b of [-halfExtent, halfExtent]) {
            points.push(
                -halfExtent,
                a,
                b,
                halfExtent,
                a,
                b,
                a,
                -halfExtent,
                b,
                a,
                halfExtent,
                b,
                a,
                b,
                -halfExtent,
                a,
                b,
                halfExtent,
            );
        }
    }
    return new g.LineSegmentsGeometry(new Float32Array(points), points.length / 3);
}

const slerpEdges = new g.LineSegments(
    boxEdges(0.5),
    new g.LineMaterial({ color: g.vec4(ink(ACCENT), g.f32(1)), lineWidth: pixels(2) }),
);
scene.add(slerpEdges);

// The Euler outline is slightly larger so both paths remain visible at keyframes.
const eulerBox = new g.LineSegments(
    boxEdges(0.61),
    new g.LineMaterial({ color: g.vec4(light, g.f32(1)), lineWidth: pixels(1.5) }),
);
scene.add(eulerBox);

/* readout */

const readout = createInfo();
readout.innerHTML =
    `<span style="color:${ACCENT}">━</span> Quaternion SLERP` + '<br>━ Euler interpolation' + '<br><span class="mc-dim"></span>';
const errorReadout = readout.lastElementChild as HTMLSpanElement;

/* render */

const eA = euler.create();
const eB = euler.create();
const eL: Euler = [0, 0, 0, 'xyz'];

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function frame(tms: number) {
    const t = tms / 1000;
    const seg = t / SEG_DURATION;
    const k = Math.floor(seg) % KEYFRAMES;
    const kn = (k + 1) % KEYFRAMES;
    const local = seg - Math.floor(seg); // linear 0..1 so speed differences show

    // math: slerp — constant angular velocity along the shortest arc
    quat.slerp(slerpBox.quaternion, keyframes[k], keyframes[kn], local);
    quat.copy(slerpEdges.quaternion, slerpBox.quaternion);

    // naive: interpolate euler angles instead
    euler.fromQuat(eA, keyframes[k], 'xyz');
    euler.fromQuat(eB, keyframes[kn], 'xyz');
    eL[0] = eA[0] + (eB[0] - eA[0]) * local;
    eL[1] = eA[1] + (eB[1] - eA[1]) * local;
    eL[2] = eA[2] + (eB[2] - eA[2]) * local;
    quat.fromEuler(eulerBox.quaternion, eL);

    // angular error between the two orientations (degrees)
    const qa = slerpBox.quaternion;
    const qb = eulerBox.quaternion;
    const dot = Math.min(1, Math.abs(qa[0] * qb[0] + qa[1] * qb[1] + qa[2] * qb[2] + qa[3] * qb[3]));
    const errorDeg = (2 * Math.acos(dot) * 180) / Math.PI;
    errorReadout.textContent = `Orientation difference: ${errorDeg.toFixed(1)}°`;

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
