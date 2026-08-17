import * as g from 'gpucat';
import { d } from 'gpucat';
import { simplex4d } from 'math/noise';
import { createPanel } from './common/dash';
import { rainbowRGB, time } from './common/rainbow';
import { createRenderer } from './common/renderer';

// A grid of tiles whose heights come from math's simplex4d, animated so it loops
// seamlessly. The trick is 4D: the two extra axes trace a circle of radius
// `variation` as the loop phase goes 0 -> 1, so w and z return exactly to their
// start and the whole field repeats with no visible seam. (A 3D field animated
// by just sliding a time offset can never close the loop like this.)

const TAU = Math.PI * 2;
const GRID = 48;
const SPACING = 0.24;
const TILE = 0.2;
const COUNT = GRID * GRID;

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[0] = 2;
camera.position[1] = 5.5;
camera.position[2] = 9.5;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* a grid of tiles on the XZ plane: static transforms + a live per-tile height */

const cols = new Float32Array(COUNT * 2); // (px, pz) per tile, for sampling
const instanceMatrices = new Float32Array(COUNT * 16);
let idx = 0;
for (let ix = 0; ix < GRID; ix++) {
    for (let iz = 0; iz < GRID; iz++) {
        const px = (ix - (GRID - 1) / 2) * SPACING;
        const pz = (iz - (GRID - 1) / 2) * SPACING;
        cols[idx * 2] = px;
        cols[idx * 2 + 1] = pz;
        const o = idx * 16;
        instanceMatrices[o + 0] = TILE;
        instanceMatrices[o + 5] = TILE;
        instanceMatrices[o + 10] = TILE;
        instanceMatrices[o + 12] = px;
        instanceMatrices[o + 13] = 0;
        instanceMatrices[o + 14] = pz;
        instanceMatrices[o + 15] = 1;
        idx++;
    }
}

// per-tile height, restreamed each frame from the looping noise
const heights = new Float32Array(COUNT);
const heightBuffer = g.createVertexBuffer(d.f32, heights);

const tileGeometry = g.createBoxGeometry(1, 1, 1);

const amp = g.uniform(g.f32(1.5), 'amp');

const stride = 16 * 4;
const col0 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 0, instanced: true });
const col1 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 16, instanced: true });
const col2 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 32, instanced: true });
const col3 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 48, instanced: true });
const instanceTransform = g.mat4(col0, col1, col2, col3);
const instanceHeight = g.attribute(heightBuffer, { stride: 4, offset: 0, instanced: true });

const pos = g.attribute('position', d.vec3f);
const nrm = g.attribute('normal', d.vec3f);
// place the tile, then lift it by its noise height along +Y
const world0 = g.mul(instanceTransform, g.vec4(pos, g.f32(1)));
const worldPos = g.Var('world', g.add(world0.xyz, g.vec3(0, 1, 0).mul(instanceHeight.mul(amp))));
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.vec4(worldPos, g.f32(1))));
const vNormal = g.varying(g.normalize(nrm), 'v_n');
const vWorld = g.varying(worldPos, 'v_w');

const lightDirection = g.vec3(0.4, 1.0, 0.6).normalize();
const diffuse = g.Var('diffuse', vNormal.dot(lightDirection).max(g.f32(0)));
const shade = g.Var('shade', g.f32(0.42).add(diffuse.mul(g.f32(0.62))));
const base = g.Var('base', rainbowRGB(vWorld));
const material = new g.Material({ vertex: clip, fragment: g.vec4(base.mul(shade), g.f32(1)) });

const tiles = new g.Mesh(tileGeometry, material);
tiles.count = COUNT;
scene.add(tiles);
scene.updateWorldMatrix();

/* looping noise */

const gen = simplex4d.create(7);
const settings = { loop: 6, height: 1.0, detail: 0.45, variation: 0.8 };
let phase = 0; // loop position in [0, 1)

/* ui */

const panel = createPanel('looping noise');
panel.add(settings, 'loop', { min: 2, max: 20, step: 0.1, label: 'Loop (s)' });
panel.add(settings, 'height', { min: 0, max: 3, step: 0.01, label: 'Height' });
panel.add(settings, 'detail', { min: 0.15, max: 1, step: 0.01, label: 'Detail' });
panel.add(settings, 'variation', { min: 0.2, max: 2, step: 0.01, label: 'Variation' });
panel.monitor(() => phase, { label: 'loop', format: (v) => `${Math.round(v * 100)}%` });

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
    amp.value = settings.height;

    // advance the loop phase and walk the two extra axes around a circle, so the
    // field returns exactly to its start as phase wraps 0 -> 1
    phase = (phase + dt / settings.loop) % 1;
    const r = settings.variation;
    const zt = r * Math.cos(phase * TAU);
    const wt = r * Math.sin(phase * TAU);

    const f = settings.detail;
    for (let i = 0; i < COUNT; i++) {
        heights[i] = simplex4d.sample(gen, cols[i * 2] * f, cols[i * 2 + 1] * f, zt, wt);
    }
    heightBuffer.needsUpdate = true;

    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
