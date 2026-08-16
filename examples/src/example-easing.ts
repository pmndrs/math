import * as g from 'gpucat';
import { d } from 'gpucat';
import { easing } from 'math/time';
import { rainbowRGB, time } from './common/rainbow';

// An easing gallery: one track per math easing function. All dots start
// together and race across, spreading apart as each follows its own pacing, then
// ease back — the clearest way to feel the difference between the curves. A
// playhead marks the linear time t; each dot leads or lags it by its easing.
//
// The tracks, playhead and labels are crisp DOM (hairline GPU lines fight FXAA);
// only the rainbow dots are drawn, on a transparent canvas layered over the DOM.

const EASINGS: [string, (t: number) => number][] = [
    ['linear', easing.linear],
    ['sineIn', easing.sineIn],
    ['sineOut', easing.sineOut],
    ['sineInOut', easing.sineInOut],
    ['cubicIn', easing.cubicIn],
    ['cubicOut', easing.cubicOut],
    ['cubicInOut', easing.cubicInOut],
    ['quartInOut', easing.quartInOut],
    ['quintInOut', easing.quintInOut],
    ['expoInOut', easing.expoInOut],
    ['circInOut', easing.circInOut],
    ['expoOut', easing.expoOut],
];

const N = EASINGS.length;
const TRACK_LEFT = -1.5;
const TRACK_RIGHT = 1.5;
const TOP = 1.5;
const BOTTOM = -1.5;
const PLAYHEAD_TOP = TOP + 0.28;
const PLAYHEAD_BOTTOM = BOTTOM - 0.28;
const rowY = (i: number) => TOP + (BOTTOM - TOP) * (i / (N - 1));
const PERIOD = 2.2; // seconds for one out-and-back

/* ------------------------------------------------------------------ renderer */

// alpha:true + a zero clear colour => transparent canvas, so the DOM shows through
const renderer = new g.WebGPURenderer({ antialias: true, alpha: true });
await renderer.init();
renderer.clearColor = [0, 0, 0, 0];

const canvas = renderer.domElement as HTMLCanvasElement;
canvas.style.position = 'absolute';
canvas.style.inset = '0';
canvas.style.zIndex = '1';
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[2] = 4.2;
camera.updateProjectionMatrix();
scene.add(camera);

renderer.setInspector(new g.Inspector());

// project a world (x, y) on the z=0 plane to screen pixels (camera looks down -z)
const FOV = Math.PI / 4;
function project(wx: number, wy: number): [number, number] {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const halfH = camera.position[2] * Math.tan(FOV / 2);
    const halfW = halfH * (w / h);
    return [((wx / halfW) * 0.5 + 0.5) * w, (0.5 - (wy / halfH) * 0.5) * h];
}

/* ------------------------------------------------------------------ dots (canvas) */

// racing dots — a single instanced mesh (one instance per easing). Each dot's
// position lives in a storage buffer we rewrite each frame; colour is the
// flowing rainbow sampled at the instance's world position.
const dotGeometry = g.createSphereGeometry(0.05, 16, 12);
// vec4 (not vec3) so the std430 storage stride matches our tightly-packed data
const dotPositions = new Float32Array(N * 4);
const dotPositionBuffer = new g.GpuBuffer(d.array(d.vec4f), { data: dotPositions, usage: 'storage' });
const instancePosition = g.index(g.storage(dotPositionBuffer), g.instanceIndex);

const dotPos = g.attribute('position', d.vec3f);
const dotWorld = g.add(dotPos, instancePosition.xyz);
const dotClip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.vec4(dotWorld, g.f32(1))));
const dotVWorld = g.varying(dotWorld, 'v_dworld');
const dotMaterial = new g.Material({ vertex: dotClip, fragment: g.vec4(rainbowRGB(dotVWorld, 2.5), g.f32(1)) });
const dots = new g.Mesh(dotGeometry, dotMaterial);
dots.count = N;
scene.add(dots);

/* ------------------------------------------------------------------ tracks + labels (DOM) */

// under-canvas layer: one hairline track per row + the sweeping playhead
const overlay = document.createElement('div');
overlay.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden';
document.body.appendChild(overlay);

const trackEls = EASINGS.map(() => {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;height:1px;background:rgba(150,162,184,0.5)';
    overlay.appendChild(el);
    return el;
});

const playheadEl = document.createElement('div');
playheadEl.style.cssText = 'position:absolute;width:2px;border-radius:1px;background:rgba(238,242,252,0.85)';
overlay.appendChild(playheadEl);

// over-canvas layer: easing names, the 0/1 axis ends, and the floating t readout
function mkLabel(text: string, transform: string): HTMLDivElement {
    const el = document.createElement('div');
    el.textContent = text;
    el.className = 'mc-label';
    el.style.transform = transform;
    el.style.color = 'var(--mc-ink)';
    el.style.zIndex = '10';
    document.body.appendChild(el);
    return el;
}
const labels = EASINGS.map(([name]) => mkLabel(name, 'translateY(-50%)'));
for (const el of labels) el.style.left = '24px';
const zeroEl = mkLabel('0', 'translate(-50%, 0)');
const oneEl = mkLabel('1', 'translate(-50%, 0)');
const tReadout = mkLabel('t 0.00', 'translate(-50%, -150%)');
tReadout.style.zIndex = '11';

// place everything that only moves on resize
function layout() {
    for (let i = 0; i < N; i++) {
        const y = rowY(i);
        const [lx, ly] = project(TRACK_LEFT, y);
        const [rx] = project(TRACK_RIGHT, y);
        trackEls[i].style.left = `${lx}px`;
        trackEls[i].style.top = `${ly}px`;
        trackEls[i].style.width = `${rx - lx}px`;
        labels[i].style.top = `${ly}px`;
    }
    const topY = project(0, PLAYHEAD_TOP)[1];
    const botY = project(0, PLAYHEAD_BOTTOM)[1];
    playheadEl.style.top = `${topY}px`;
    playheadEl.style.height = `${botY - topY}px`;

    const [zx, zy] = project(TRACK_LEFT, BOTTOM - 0.35);
    zeroEl.style.left = `${zx}px`;
    zeroEl.style.top = `${zy}px`;
    const [ox, oy] = project(TRACK_RIGHT, BOTTOM - 0.35);
    oneEl.style.left = `${ox}px`;
    oneEl.style.top = `${oy}px`;
}
layout();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    layout();
});

/* ------------------------------------------------------------------ render */

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera, { clearColor: [0, 0, 0, 0] });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function frame(tms: number) {
    const t = tms / 1000;
    time.value = t;

    // shared out-and-back linear time (0 -> 1 -> 0)
    const cyc = (t / PERIOD) % 2;
    const p = cyc < 1 ? cyc : 2 - cyc;

    for (let i = 0; i < N; i++) {
        const eased = EASINGS[i][1](p);
        dotPositions[i * 4] = TRACK_LEFT + (TRACK_RIGHT - TRACK_LEFT) * eased;
        dotPositions[i * 4 + 1] = rowY(i);
        dotPositions[i * 4 + 2] = 0;
    }
    dotPositionBuffer.needsUpdate = true;

    // playhead + t readout follow the linear time
    const px = TRACK_LEFT + (TRACK_RIGHT - TRACK_LEFT) * p;
    const [phx, phy] = project(px, PLAYHEAD_TOP);
    playheadEl.style.left = `${phx - 1}px`;
    tReadout.style.left = `${phx}px`;
    tReadout.style.top = `${phy}px`;
    tReadout.textContent = `t ${p.toFixed(2)}`;

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
