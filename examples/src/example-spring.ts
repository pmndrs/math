import * as g from 'gpucat';
import { d } from 'gpucat';
import type { Vec2 } from 'math';
import { type Spring, spring2 } from 'math/time';
import { createInfo } from './common/info';
import { ink, light, pixels } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, palette, spectrum } from './common/theme';

// A springy tail that chases the pointer. The head springs toward the cursor and
// each following bead springs toward the one ahead (math's spring2, under-
// damped so it overshoots and settles). Move the pointer (or drag on touch) to
// whip it around. Beads are instanced spheres, tapering along a fine line, with
// the head in the accent.

const N = 18;
const SMOOTH_HEAD = 0.08; // approx seconds to catch up
const SMOOTH_LINK = 0.05;
const DAMPING = 0.45; // < 1 => bouncy
const R_HEAD = 0.14;
const R_TAIL = 0.025;
const ACCENT = spectrum[4];

const chain: Spring<Vec2>[] = [];
for (let i = 0; i < N; i++) chain.push(spring2.create([0, 0]));
const target: Vec2 = [0, 0];
const radius = (i: number) => R_HEAD + (R_TAIL - R_HEAD) * (i / (N - 1));

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.style.touchAction = 'none';

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[2] = 5;
scene.add(camera);

const FOV = Math.PI / 4;
function unproject(clientX: number, clientY: number): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    const halfH = camera.position[2] * Math.tan(FOV / 2);
    const halfW = halfH * (rect.width / rect.height);
    return [ndcX * halfW, ndcY * halfH];
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* pointer */

let pointerDown = false;
let everMoved = false; // until the pointer takes over, the head orbits on its own
function moveTo(clientX: number, clientY: number) {
    everMoved = true;
    const [x, y] = unproject(clientX, clientY);
    target[0] = x;
    target[1] = y;
}
canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' && !pointerDown) return;
    moveTo(e.clientX, e.clientY);
});
canvas.addEventListener('pointerdown', (e) => {
    pointerDown = true;
    moveTo(e.clientX, e.clientY);
});
const release = () => {
    pointerDown = false;
};
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

/* beads */

// instanced spheres: per-bead vec4 = (x, y, z, radius), rewritten each frame
const beadData = new Float32Array(N * 4);
const beadBuffer = new g.GpuBuffer(d.array(d.vec4f), { data: beadData, usage: 'storage' });
const inst = g.index(g.storage(beadBuffer), g.instanceIndex);

const sphere = g.createSphereGeometry(1, 16, 12);
const pos = g.attribute('position', d.vec3f);
const nrm = g.attribute('normal', d.vec3f);
const world = g.add(g.mul(pos, inst.w), inst.xyz); // scale by radius, translate to bead
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.vec4(world, g.f32(1))));
const vNormal = g.varying(g.normalize(nrm), 'v_n');
// only the head is as large as R_HEAD, so its radius picks it out for the accent
const vHead = g.varying(g.step(g.f32(R_HEAD - 1e-4), inst.w), 'v_head');
const material = new g.Material({
    vertex: clip,
    fragment: g.vec4(
        g.mix(ink(palette.base), g.mix(light, ink(ACCENT), vHead), g.smoothstep(g.f32(0.35), g.f32(0.5), vNormal.z)),
        g.f32(1),
    ),
});
const beads = new g.Mesh(sphere, material);
beads.count = N;
scene.add(beads);

// the chain itself, a fine line through every bead
const chainPoints = new Float32Array(N * 3);
const chainGeometry = new g.LineGeometry(chainPoints, false, N);
scene.add(new g.Line(chainGeometry, new g.LineMaterial({ color: g.vec4(light, g.f32(1)), lineWidth: pixels(1) })));

/* hint */

const hint = createInfo();
hint.textContent = 'move the pointer to lead the tail';

/* render */

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let last = -1;

function frame(tms: number) {
    const t = tms / 1000;
    if (last < 0) last = t;
    const dt = Math.min(t - last, 0.05);
    last = t;

    // idle: sweep the head target on a lissajous until the pointer takes over
    if (!everMoved) {
        target[0] = Math.cos(t * 0.9) * 1.5;
        target[1] = Math.sin(t * 1.3) * 1.1;
    }

    // head chases the target; every other bead chases the one ahead
    spring2.update(chain[0], target, SMOOTH_HEAD, DAMPING, dt);
    for (let i = 1; i < N; i++) {
        spring2.update(chain[i], chain[i - 1].value, SMOOTH_LINK, DAMPING, dt);
    }
    for (let i = 0; i < N; i++) {
        beadData[i * 4] = chain[i].value[0];
        beadData[i * 4 + 1] = chain[i].value[1];
        beadData[i * 4 + 2] = 0;
        beadData[i * 4 + 3] = radius(i);
        chainPoints[i * 3] = chain[i].value[0];
        chainPoints[i * 3 + 1] = chain[i].value[1];
    }
    beadBuffer.needsUpdate = true;
    chainGeometry.update(chainPoints, false);

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
