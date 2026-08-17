import * as g from 'gpucat';
import { d } from 'gpucat';
import { simplex2d } from 'math/noise';
import { rainbowRGB, time } from './common/rainbow';
import { createRenderer } from './common/renderer';

// A rolling terrain: a grid mesh whose vertex heights come from math's
// simplex2d noise (two octaves), scrolling over time like a fly-over. Normals are
// rebuilt from the height field each frame for shading, and the surface is lit ×
// the flowing brand rainbow (coloured by world position).

const GRID = 96; // vertices per side
const HALF = 3; // world half-extent in x/z
const FREQ = 0.55;
const AMP = 0.85;
const SCROLL = 0.35; // world units/second the terrain drifts in z

const SPACING = (2 * HALF) / (GRID - 1);
const V = GRID * GRID;

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[0] = 0;
camera.position[1] = 2.6;
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

/* terrain mesh */

const posArray = new Float32Array(V * 3);
const normArray = new Float32Array(V * 3);
const heights = new Float32Array(V);

// static x/z grid positions (y is filled every frame)
for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
        const idx = j * GRID + i;
        posArray[idx * 3] = -HALF + i * SPACING;
        posArray[idx * 3 + 2] = -HALF + j * SPACING;
    }
}

const indices: number[] = [];
for (let j = 0; j < GRID - 1; j++) {
    for (let i = 0; i < GRID - 1; i++) {
        const a = j * GRID + i;
        const b = a + 1;
        const c = a + GRID;
        const e = c + 1;
        // alternate the split diagonal per quad so facets don't line up into a grid
        if ((i + j) % 2 === 0) {
            indices.push(a, c, b, b, c, e);
        } else {
            indices.push(a, c, e, a, e, b);
        }
    }
}

const posBuffer = g.createVertexBuffer(d.vec3f, posArray);
const normBuffer = g.createVertexBuffer(d.vec3f, normArray);
const geometry = new g.Geometry();
geometry.setBuffer('position', posBuffer);
geometry.setBuffer('normal', normBuffer);
geometry.setIndex(g.createIndexBuffer(new Uint32Array(indices)));

const noise = simplex2d.create(7);

function updateTerrain(t: number) {
    const scroll = t * SCROLL;
    for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
            const idx = j * GRID + i;
            const x = posArray[idx * 3];
            const z = posArray[idx * 3 + 2] + scroll;
            // math: two octaves of simplex noise
            const n1 = simplex2d.sample(noise, x * FREQ, z * FREQ);
            const n2 = simplex2d.sample(noise, x * FREQ * 2.3, z * FREQ * 2.3);
            const y = (n1 + n2 * 0.4) * AMP;
            heights[idx] = y;
            posArray[idx * 3 + 1] = y;
        }
    }
    // normals from finite differences of the height field
    for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
            const idx = j * GRID + i;
            const hL = heights[j * GRID + Math.max(i - 1, 0)];
            const hR = heights[j * GRID + Math.min(i + 1, GRID - 1)];
            const hD = heights[Math.max(j - 1, 0) * GRID + i];
            const hU = heights[Math.min(j + 1, GRID - 1) * GRID + i];
            const nx = hL - hR;
            const ny = 2 * SPACING;
            const nz = hD - hU;
            const len = Math.hypot(nx, ny, nz) || 1;
            normArray[idx * 3] = nx / len;
            normArray[idx * 3 + 1] = ny / len;
            normArray[idx * 3 + 2] = nz / len;
        }
    }
    posBuffer.needsUpdate = true;
    normBuffer.needsUpdate = true;
}

// shader: lit (directional) × flowing rainbow by world position
const pos = g.attribute('position', d.vec3f);
const nrm = g.attribute('normal', d.vec3f);
const world = g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)));
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
const vNormal = g.varying(g.normalize(g.mul(g.modelNormalMatrix, nrm)), 'v_n');
const vWorld = g.varying(world.xyz, 'v_w');
const lightDirection = g.vec3(0.4, 0.9, 0.3).normalize();
const diffuse = g.Var('diffuse', vNormal.dot(lightDirection).max(g.f32(0)));
const light = g.Var('light', g.f32(0.45).add(diffuse.mul(g.f32(0.55))));
// brightness rises with height: dark valleys -> bright peaks, hue stays rainbow
const HEIGHT_RANGE = AMP * 1.4;
const h01 = g.clamp(vWorld.y.mul(g.f32(0.5 / HEIGHT_RANGE)).add(g.f32(0.5)), g.f32(0), g.f32(1));
const heightLight = g.Var('heightLight', g.f32(0.35).add(h01.mul(g.f32(1.05))));
const lit = g.Var('lit', rainbowRGB(vWorld, 3).mul(light).mul(heightLight));
const material = new g.Material({ vertex: clip, fragment: g.vec4(lit, g.f32(1)), cullMode: 'none' });
scene.add(new g.Mesh(geometry, material));

/* readout */

const readout = document.createElement('div');
readout.className = 'mc-info';
readout.style.left = '16px';
readout.style.bottom = '16px';
readout.textContent = `${GRID} × ${GRID} grid · simplex2d`;
document.body.appendChild(readout);

/* render */

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function frame(tms: number) {
    const t = tms / 1000;
    time.value = t;
    updateTerrain(t);

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
