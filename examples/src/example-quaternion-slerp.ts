import * as g from 'gpucat';
import { d } from 'gpucat';
import { type Euler, euler, type Quat, quat } from 'math';
import { mulberry32 } from 'math/random';

// One orientation, two ways to interpolate it between random keyframes. The solid
// colour-cube uses math's quat.slerp (constant-speed shortest arc). The
// translucent white ghost around it lerps euler angles instead
// (euler.fromQuat -> lerp -> quat.fromEuler) — the naive approach. They coincide
// at every keyframe, but between them the ghost twists off-axis: that gap is the
// error, and the readout reports it as the angle between the two orientations.

const KEYFRAMES = 5;
const SEG_DURATION = 2.2; // seconds per keyframe transition

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

/* ------------------------------------------------------------------ renderer */

const renderer = new g.WebGPURenderer({ antialias: true });
await renderer.init();

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

renderer.setInspector(new g.Inspector());

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* ------------------------------------------------------------------ boxes */

// solid colour-cube (slerp): local position -> rgb, lit for depth
const boxGeometry = g.createBoxGeometry(1, 1, 1);
const pos = g.attribute('position', d.vec3f);
const nrm = g.attribute('normal', d.vec3f);
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)))));
const vNormal = g.varying(g.normalize(g.mul(g.modelNormalMatrix, nrm)), 'v_n');
const vColor = g.varying(g.add(pos, g.vec3(0.5, 0.5, 0.5)), 'v_c'); // [-0.5,0.5] -> [0,1]
const lightDirection = g.vec3(0.45, 0.8, 0.6).normalize();
const diffuse = g.Var('diffuse', vNormal.dot(lightDirection).max(g.f32(0)));
const light = g.Var('light', g.f32(0.4).add(diffuse.mul(g.f32(0.7))));
const boxMaterial = new g.Material({ vertex: clip, fragment: g.vec4(vColor.mul(light), g.f32(1)) });

const slerpBox = new g.Mesh(boxGeometry, boxMaterial);
scene.add(slerpBox);

// translucent white ghost (euler lerp): a slightly larger shell around the cube
const ghostGeometry = g.createBoxGeometry(1.22, 1.22, 1.22);
const ghostPos = g.attribute('position', d.vec3f);
const ghostClip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.mul(g.modelWorldMatrix, g.vec4(ghostPos, g.f32(1)))));
const ghostMaterial = new g.Material({
    vertex: ghostClip,
    fragment: g.vec4f(0.95, 0.96, 1, 0.22),
    transparent: true,
    cullMode: 'back',
    depthWrite: false,
    blend: {
        color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    },
});
const eulerBox = new g.Mesh(ghostGeometry, ghostMaterial);
scene.add(eulerBox);

/* ------------------------------------------------------------------ readout */

const readout = document.createElement('div');
readout.className = 'mc-info';
readout.style.left = '16px';
readout.style.top = '16px';
document.body.appendChild(readout);

/* ------------------------------------------------------------------ render */

const eA = euler.create();
const eB = euler.create();
const eL: Euler = [0, 0, 0, 'xyz'];

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera);
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
    readout.textContent = `slerp (solid) vs euler-lerp (ghost)\nerror: ${errorDeg.toFixed(1)}°`;
    readout.style.whiteSpace = 'pre';

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
