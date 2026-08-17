import * as g from 'gpucat';
import { d } from 'gpucat';
import { color, hsl } from 'math/color';
import { createRenderer } from './common/renderer';

// An HSL colour wheel: hue around the circle, saturation from the grey centre to
// the vivid rim (lightness fixed at 0.5). Every vertex colour is computed with
// math/color (hsl.toColor -> color.toSRGB). Move the pointer to pick a colour;
// the readout shows its HSL / RGB / hex, all via math/color.

const RADIUS = 1.4;
const RINGS = 24;
const SEGMENTS = 120;
const LIGHTNESS = 0.5;

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.style.touchAction = 'none';

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[2] = 4;
camera.updateProjectionMatrix();
scene.add(camera);

const FOV = Math.PI / 4;
function project(wx: number, wy: number): [number, number] {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const halfH = camera.position[2] * Math.tan(FOV / 2);
    const halfW = halfH * (w / h);
    return [((wx / halfW) * 0.5 + 0.5) * w, (0.5 - (wy / halfH) * 0.5) * h];
}
function unproject(clientX: number, clientY: number): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    const halfH = camera.position[2] * Math.tan(FOV / 2);
    const halfW = halfH * (rect.width / rect.height);
    return [ndcX * halfW, ndcY * halfH];
}

/* wheel mesh */

// build a triangulated disk; each vertex is coloured by math/color
const positions: number[] = [];
const colors: number[] = [];
const indices: number[] = [];
const lin = color.create();
const srgb: [number, number, number] = [0, 0, 0];

function pushColor(hue: number, sat: number) {
    hsl.toColor(lin, [hue, sat, LIGHTNESS]);
    color.toSRGB(srgb, lin); // gpucat outputs sRGB directly
    colors.push(srgb[0], srgb[1], srgb[2]);
}

// centre vertex (index 0): saturation 0 -> neutral grey
positions.push(0, 0, 0);
pushColor(0, 0);

for (let r = 1; r <= RINGS; r++) {
    const rad = (r / RINGS) * RADIUS;
    const sat = r / RINGS;
    for (let s = 0; s < SEGMENTS; s++) {
        const ang = (s / SEGMENTS) * Math.PI * 2;
        positions.push(Math.cos(ang) * rad, Math.sin(ang) * rad, 0);
        pushColor(s / SEGMENTS, sat);
    }
}

// inner fan (centre -> ring 1)
for (let s = 0; s < SEGMENTS; s++) {
    indices.push(0, 1 + s, 1 + ((s + 1) % SEGMENTS));
}
// quad strips between successive rings
for (let r = 1; r < RINGS; r++) {
    const base = 1 + (r - 1) * SEGMENTS;
    const next = 1 + r * SEGMENTS;
    for (let s = 0; s < SEGMENTS; s++) {
        const s1 = (s + 1) % SEGMENTS;
        indices.push(base + s, next + s, base + s1);
        indices.push(base + s1, next + s, next + s1);
    }
}

const wheelGeometry = new g.Geometry();
wheelGeometry.setBuffer('position', g.createVertexBuffer(d.vec3f, new Float32Array(positions)));
wheelGeometry.setBuffer('color', g.createVertexBuffer(d.vec3f, new Float32Array(colors)));
wheelGeometry.setIndex(g.createIndexBuffer(new Uint32Array(indices)));

const wPos = g.attribute('position', d.vec3f);
const wCol = g.attribute('color', d.vec3f);
const wClip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.mul(g.modelWorldMatrix, g.vec4(wPos, g.f32(1)))));
const vColor = g.varying(wCol, 'v_color');
const wheelMaterial = new g.Material({ vertex: wClip, fragment: g.vec4(vColor, g.f32(1)), cullMode: 'none' });
scene.add(new g.Mesh(wheelGeometry, wheelMaterial));

/* picker (DOM) */

const marker = document.createElement('div');
marker.style.cssText =
    'position:absolute;width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1.5px rgba(0,0,0,0.55);transform:translate(-50%,-50%);pointer-events:none;z-index:10';
document.body.appendChild(marker);

const panel = document.createElement('div');
// no container — just monospace text + a swatch
panel.style.cssText =
    'position:absolute;left:16px;bottom:16px;display:flex;align-items:center;gap:11px;font-family:var(--mc-mono);font-size:13px;line-height:1.6;color:var(--mc-ink);text-shadow:0 1px 2px rgba(0,0,0,0.6);white-space:nowrap;pointer-events:none;z-index:10';
const swatch = document.createElement('div');
swatch.style.cssText = 'width:34px;height:34px;border-radius:6px;border:1px solid rgba(255,255,255,0.22);flex:none';
const readout = document.createElement('div');
panel.append(swatch, readout);
document.body.appendChild(panel);

const picked = color.create();
function pick(wx: number, wy: number) {
    const angle = Math.atan2(wy, wx);
    const radius = Math.hypot(wx, wy);
    const hue = (angle / (Math.PI * 2) + 1) % 1;
    const sat = Math.min(radius / RADIUS, 1);

    hsl.toColor(picked, [hue, sat, LIGHTNESS]);

    // marker sits on the wheel (clamped to the rim)
    const cr = Math.min(radius, RADIUS);
    const [mx, my] = project(Math.cos(angle) * cr, Math.sin(angle) * cr);
    marker.style.left = `${mx}px`;
    marker.style.top = `${my}px`;

    const hex = `#${color.toHexString(picked)}`; // toHexString returns a bare hex (no '#')
    color.toSRGB(srgb, picked);
    const r = Math.round(srgb[0] * 255);
    const gg = Math.round(srgb[1] * 255);
    const b = Math.round(srgb[2] * 255);
    swatch.style.background = hex;
    readout.innerHTML =
        `hsl(${Math.round(hue * 360)}, ${Math.round(sat * 100)}%, ${Math.round(LIGHTNESS * 100)}%)<br>` +
        `rgb(${r}, ${gg}, ${b})<br>${hex}`;
}

canvas.addEventListener('pointermove', (e) => {
    const [wx, wy] = unproject(e.clientX, e.clientY);
    pick(wx, wy);
});

// a pleasant default pick (a pink on the rim)
const a0 = 0.92 * Math.PI * 2;
pick(Math.cos(a0) * RADIUS * 0.9, Math.sin(a0) * RADIUS * 0.9);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* render */

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function frame() {
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
