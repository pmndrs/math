import * as g from 'gpucat';
import { d } from 'gpucat';
import { simplex2d } from 'math/noise';
import { createInfo } from './common/info';
import { grey, ink, isoline, light } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, spectrum } from './common/theme';

// A rolling terrain: a grid mesh whose vertex heights come from math's
// simplex2d noise (two octaves), scrolling over time like a fly-over. Fine
// contours show the slopes, bold contours mark every fourth elevation, and
// an amber contour tracks one fixed height.

const GRID = 96; // vertices per side
const HALF = 3; // world half-extent in x/z
const FREQ = 0.55;
const AMP = 0.85;
const SCROLL = 0.35; // world units/second the terrain drifts in z
const ACCENT = spectrum[2];

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
camera.position[1] = 4.2;
camera.position[2] = 7.1;
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
const geometry = new g.Geometry();
geometry.setBuffer('position', posBuffer);
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
            posArray[idx * 3 + 1] = y;
        }
    }
    posBuffer.needsUpdate = true;
}

// Screen-space line widths keep the contours crisp as the camera moves.
const pos = g.attribute('position', d.vec3f);
const world = g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)));
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
const height = g.varying(world.y, 'v_height');
const vWorld = g.varying(world.xyz, 'v_world');
// A broad neutral fill connects the contours into a readable surface.
const normal = g.normalize(g.cross(g.dpdx(vWorld), g.dpdy(vWorld)));
const facing = normal.dot(g.vec3(0.4, 0.9, 0.3).normalize()).abs();
const surface = grey(g.f32(0.32).add(facing.mul(g.f32(0.2))));
const contour = g.max(isoline(height.div(g.f32(0.15)), 1), isoline(height.div(g.f32(0.6)), 2));
const accent = isoline(height.sub(g.f32(0.45)).div(g.f32(20)), 2);
const color = g.mix(g.mix(surface, light, contour), ink(ACCENT), accent);
const material = new g.Material({ vertex: clip, fragment: g.vec4(color, g.f32(1)), cullMode: 'none' });
scene.add(new g.Mesh(geometry, material));

/* readout */

const readout = createInfo();
readout.innerHTML = `Elevation contours · simplex2d<br>Thin 0.15 · Bold 0.60 · <span style="color:${ACCENT}">━ Height 0.45</span>`;

/* render */

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function frame(tms: number) {
    const t = tms / 1000;
    updateTerrain(t);

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
