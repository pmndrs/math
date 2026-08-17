import * as g from 'gpucat';
import { d } from 'gpucat';
import { type Quat, quat } from 'math';
import { mulberry32, random } from 'math/random';
import { createPanel } from './common/dash';
import { rainbowRGB, time } from './common/rainbow';
import { createRenderer } from './common/renderer';

// A grid of arrows, each smoothly slerping (quat.slerp) between orientations
// drawn from math's random.quat — a *uniform* random rotation (Shoemake's
// method), so every direction is equally likely and the field stays evenly
// stirred. Flip "naive euler" to instead draw three random Euler angles: that
// looks reasonable at a glance but is biased toward the poles, and over time the
// arrows visibly bunch up pointing the same ways. Reshuffle for a new seed.
// The arrow geometry is built by hand below (a cylinder shaft + a faceted cone).

const TAU = Math.PI * 2;
const GRID = 7;
const SPACING = 1.05;

/* hand-built arrow geometry, pointing along +Y, centred on the origin */

function buildArrowGeometry(): { positions: Float32Array; normals: Float32Array; indices: Uint32Array } {
    const R = 18; // radial segments
    const shaftBottom = -0.42;
    const shaftTop = 0.06;
    const shaftR = 0.045;
    const headBase = 0.06;
    const headTip = 0.42;
    const headR = 0.13;

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    let vi = 0;
    const push = (px: number, py: number, pz: number, nx: number, ny: number, nz: number): number => {
        positions.push(px, py, pz);
        normals.push(nx, ny, nz);
        return vi++;
    };

    // shaft side — smooth radial normals
    const shaftBot: number[] = [];
    const shaftTopR: number[] = [];
    for (let i = 0; i < R; i++) {
        const a = (i / R) * TAU;
        const cx = Math.cos(a);
        const sz = Math.sin(a);
        shaftBot.push(push(cx * shaftR, shaftBottom, sz * shaftR, cx, 0, sz));
        shaftTopR.push(push(cx * shaftR, shaftTop, sz * shaftR, cx, 0, sz));
    }
    for (let i = 0; i < R; i++) {
        const j = (i + 1) % R;
        indices.push(shaftBot[i], shaftTopR[i], shaftTopR[j], shaftBot[i], shaftTopR[j], shaftBot[j]);
    }

    // shaft bottom cap
    const sbCenter = push(0, shaftBottom, 0, 0, -1, 0);
    const sbRing: number[] = [];
    for (let i = 0; i < R; i++) {
        const a = (i / R) * TAU;
        sbRing.push(push(Math.cos(a) * shaftR, shaftBottom, Math.sin(a) * shaftR, 0, -1, 0));
    }
    for (let i = 0; i < R; i++) indices.push(sbCenter, sbRing[(i + 1) % R], sbRing[i]);

    // cone base disc (the overhang under the arrowhead), facing down
    const cbCenter = push(0, headBase, 0, 0, -1, 0);
    const cbRing: number[] = [];
    for (let i = 0; i < R; i++) {
        const a = (i / R) * TAU;
        cbRing.push(push(Math.cos(a) * headR, headBase, Math.sin(a) * headR, 0, -1, 0));
    }
    for (let i = 0; i < R; i++) indices.push(cbCenter, cbRing[i], cbRing[(i + 1) % R]);

    // cone side — faceted, one flat normal per segment
    const h = headTip - headBase;
    for (let i = 0; i < R; i++) {
        const a0 = (i / R) * TAU;
        const a1 = ((i + 1) / R) * TAU;
        const am = ((i + 0.5) / R) * TAU;
        let nx = Math.cos(am) * h;
        const ny = headR;
        let nz = Math.sin(am) * h;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        nz /= nl;
        const b0 = push(Math.cos(a0) * headR, headBase, Math.sin(a0) * headR, nx, ny / nl, nz);
        const b1 = push(Math.cos(a1) * headR, headBase, Math.sin(a1) * headR, nx, ny / nl, nz);
        const tip = push(0, headTip, 0, nx, ny / nl, nz);
        indices.push(b0, b1, tip);
    }

    return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices) };
}

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[0] = 0;
camera.position[1] = 4.4;
camera.position[2] = 8;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* one shared arrow geometry + rainbow-lit material, reused by every instance */

const arrow = buildArrowGeometry();
const geometry = new g.Geometry();
geometry.setBuffer('position', g.createVertexBuffer(d.vec3f, arrow.positions));
geometry.setBuffer('normal', g.createVertexBuffer(d.vec3f, arrow.normals));
geometry.setIndex(g.createIndexBuffer(arrow.indices));

const pos = g.attribute('position', d.vec3f);
const nrm = g.attribute('normal', d.vec3f);
const world = g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)));
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
const vNormal = g.varying(g.normalize(g.mul(g.modelNormalMatrix, nrm)), 'v_n');
const vWorld = g.varying(world.xyz, 'v_w');
const lightDirection = g.vec3(0.5, 1.0, 0.7).normalize();
const diffuse = g.Var('diffuse', vNormal.dot(lightDirection).max(g.f32(0)));
const light = g.Var('light', g.f32(0.4).add(diffuse.mul(g.f32(0.7))));
const base = g.Var('base', rainbowRGB(vWorld));
const material = new g.Material({ vertex: clip, fragment: g.vec4(base.mul(light), g.f32(1)), cullMode: 'none' });

/* per-arrow slerp state */

type Arrow = { mesh: g.Mesh; from: Quat; to: Quat; t: number; dur: number };
const arrows: Arrow[] = [];

const settings = {
    speed: 1,
    naive: false,
    seed: 7,
};

let rng = mulberry32.create(settings.seed);
const rand = () => mulberry32.sample(rng);

// draw the next target orientation — uniform (random.quat) or the biased naive
// approach (three independent random Euler angles)
function nextOrientation(out: Quat): Quat {
    if (settings.naive) return quat.fromEuler(out, [rand() * TAU, rand() * TAU, rand() * TAU]);
    return random.quat(out, rand);
}

const newDuration = () => 0.9 + rand() * 1.7; // seconds per transition

for (let ix = 0; ix < GRID; ix++) {
    for (let iz = 0; iz < GRID; iz++) {
        const mesh = new g.Mesh(geometry, material);
        mesh.position[0] = (ix - (GRID - 1) / 2) * SPACING;
        mesh.position[1] = 0;
        mesh.position[2] = (iz - (GRID - 1) / 2) * SPACING;
        scene.add(mesh);
        const ar: Arrow = { mesh, from: quat.create(), to: quat.create(), t: 0, dur: 1 };
        arrows.push(ar);
    }
}

// (re)seed every arrow's keyframes from the current seed / sampling mode
function reseed(): void {
    rng = mulberry32.create(settings.seed);
    for (const ar of arrows) {
        nextOrientation(ar.from);
        nextOrientation(ar.to);
        ar.t = rand(); // desynced phase
        ar.dur = newDuration();
        quat.slerp(ar.mesh.quaternion, ar.from, ar.to, ar.t);
    }
}
reseed();
scene.updateWorldMatrix();

/* ui */

const panel = createPanel('random orientations');
panel.add(settings, 'speed', { min: 0, max: 3, step: 0.01, label: 'Speed' });
panel.add(settings, 'naive', { label: 'Naive euler' }).onChange(reseed);
panel.button('↻ Reshuffle', () => {
    settings.seed = (Math.imul(settings.seed, 1664525) + 1013904223) >>> 0;
    reseed();
});
panel.monitor(() => (settings.naive ? 'naive euler (biased)' : 'uniform quat'), { label: 'sampling' });

/* render loop */

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let lastT = performance.now();

function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    time.value = now / 1000;

    for (const ar of arrows) {
        ar.t += (dt * settings.speed) / ar.dur;
        while (ar.t >= 1) {
            ar.t -= 1;
            quat.copy(ar.from, ar.to);
            nextOrientation(ar.to);
            ar.dur = newDuration();
        }
        const e = ar.t * ar.t * (3 - 2 * ar.t); // smoothstep ease
        quat.slerp(ar.mesh.quaternion, ar.from, ar.to, e);
    }

    controls.update();
    scene.updateWorldMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
