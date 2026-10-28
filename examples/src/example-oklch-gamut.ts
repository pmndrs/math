import { type Color, color, colorspace, oklab, oklch, type Oklch } from 'math/color';
import { createInfo } from './common/info';
import { palette } from './common/theme';

// A slice of Oklch at one hue: chroma runs across, lightness up. Inside the drawn line the colours
// fit in sRGB. Outside it they do not, and the two planes show two ways of bringing them back.
// Clipping (color.clamp) cuts each RGB channel to [0, 1], which shifts hue and lightness, so the
// region beyond the line smears into neighbouring hues. color.fromOklchInGamut keeps lightness and
// hue and only reduces chroma, so each row beyond the line repeats the colour on the boundary.
// Hover to compare one colour, drag the hue strip to turn the slice.

const MONO = '"Geist Mono", ui-monospace, monospace';
const C_MAX = 0.37;
const RES_W = 220;
const RES_H = 180;

// layout metrics (CSS pixels)
const MARGIN = 40;
const GAP = 56;
const STRIP_H = 16;

let hue = 240;
let autoRotate = true;
// the colour under comparison, in plane coordinates (C, L)
let probeC = 0.25;
let probeL = 0.8;

/* canvas */

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
canvas.style.touchAction = 'none';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const info = createInfo();
info.innerHTML = 'hover a plane to compare one colour<br>drag the hue strip to turn the slice';

// low resolution planes, scaled up when drawn
const clipImage = new ImageData(RES_W, RES_H);
const mappedImage = new ImageData(RES_W, RES_H);
const clipBuffer = document.createElement('canvas');
const mappedBuffer = document.createElement('canvas');
clipBuffer.width = mappedBuffer.width = RES_W;
clipBuffer.height = mappedBuffer.height = RES_H;

let planeW = 0;
let planeH = 0;
let clipX = 0;
let mappedX = 0;
let planeY = 0;
let stripY = 0;

function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    planeW = Math.floor(Math.min((w - MARGIN * 2 - GAP) / 2, 520));
    planeH = Math.floor(Math.min(planeW * 0.8, h - 300));
    const blockH = planeH + 44 + STRIP_H + 110;
    clipX = Math.round((w - planeW * 2 - GAP) / 2);
    mappedX = clipX + planeW + GAP;
    planeY = Math.max(MARGIN + 20, Math.round((h - blockH) / 2) + 20);
    stripY = planeY + planeH + 44;
}

/* colour */

const lch: Oklch = [0, 0, 0];
const lin = color.create();
const clipped = color.create();
const mapped = color.create();

function inGamut(c: Color): boolean {
    const e = 1e-9;
    return c[0] >= -e && c[0] <= 1 + e && c[1] >= -e && c[1] <= 1 + e && c[2] >= -e && c[2] <= 1 + e;
}

function writePixel(data: Uint8ClampedArray, i: number, c: Color) {
    data[i] = colorspace.linearToSrgb(Math.min(Math.max(c[0], 0), 1)) * 255;
    data[i + 1] = colorspace.linearToSrgb(Math.min(Math.max(c[1], 0), 1)) * 255;
    data[i + 2] = colorspace.linearToSrgb(Math.min(Math.max(c[2], 0), 1)) * 255;
    data[i + 3] = 255;
}

function renderPlanes() {
    for (let y = 0; y < RES_H; y++) {
        const l = 1 - (y + 0.5) / RES_H;
        for (let x = 0; x < RES_W; x++) {
            oklch.set(lch, l, ((x + 0.5) / RES_W) * C_MAX, hue);
            color.fromOklch(lin, lch);
            const i = (y * RES_W + x) * 4;
            if (inGamut(lin)) {
                writePixel(clipImage.data, i, lin);
                writePixel(mappedImage.data, i, lin);
            } else {
                writePixel(clipImage.data, i, color.clamp(clipped, lin));
                writePixel(mappedImage.data, i, color.fromOklchInGamut(mapped, lch));
            }
        }
    }
    (clipBuffer.getContext('2d') as CanvasRenderingContext2D).putImageData(clipImage, 0, 0);
    (mappedBuffer.getContext('2d') as CanvasRenderingContext2D).putImageData(mappedImage, 0, 0);
}

// the largest in-gamut chroma for each lightness, by bisection
const BOUNDARY_SAMPLES = 160;
const boundary: number[] = [];
let cuspL = 0;
let cuspC = 0;

function computeBoundary() {
    boundary.length = 0;
    cuspC = 0;
    for (let s = 0; s <= BOUNDARY_SAMPLES; s++) {
        const l = s / BOUNDARY_SAMPLES;
        let lo = 0;
        let hi = 0.5;
        for (let k = 0; k < 24; k++) {
            const mid = (lo + hi) / 2;
            if (inGamut(color.fromOklch(lin, oklch.set(lch, l, mid, hue)))) lo = mid;
            else hi = mid;
        }
        boundary.push(lo);
        if (lo > cuspC) {
            cuspC = lo;
            cuspL = l;
        }
    }
}

/* drawing */

function px(planeX: number, c: number): number {
    return planeX + (c / C_MAX) * planeW;
}

function py(l: number): number {
    return planeY + (1 - l) * planeH;
}

function fmt(c: Oklch): string {
    return `oklch(${c[0].toFixed(2)} ${c[1].toFixed(3)} ${c[2].toFixed(0).padStart(3)})`;
}

function hueDelta(a: number, b: number): number {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
}

function drawPlane(planeX: number, buffer: HTMLCanvasElement, title: string) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(buffer, planeX, planeY, planeW, planeH);

    // gamut boundary and cusp
    ctx.strokeStyle = palette.light;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let s = 0; s <= BOUNDARY_SAMPLES; s++) {
        const x = px(planeX, boundary[s]);
        const y = py(s / BOUNDARY_SAMPLES);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = palette.light;
    ctx.beginPath();
    ctx.arc(px(planeX, cuspC), py(cuspL), 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `11px ${MONO}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('cusp', px(planeX, cuspC) + 8, py(cuspL));

    // frame, axes and title
    ctx.strokeStyle = palette.dim;
    ctx.lineWidth = 1;
    ctx.strokeRect(planeX + 0.5, planeY + 0.5, planeW - 1, planeH - 1);
    ctx.fillStyle = palette.muted;
    ctx.textBaseline = 'top';
    for (const c of [0, 0.1, 0.2, 0.3]) ctx.fillText(c.toFixed(1), px(planeX, c) - 6, planeY + planeH + 8);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (const l of [0, 0.5, 1]) ctx.fillText(l.toFixed(1), planeX - 8, py(l));
    ctx.textAlign = 'left';
    ctx.fillText('C →', planeX + planeW - 28, planeY + planeH + 14);
    ctx.fillStyle = palette.light;
    ctx.font = `12px ${MONO}`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(title, planeX, planeY - 10);
}

function drawProbe(planeX: number, result: Oklch) {
    const x0 = px(planeX, probeC);
    const y0 = py(probeL);
    const x1 = px(planeX, result[1]);
    const y1 = py(result[0]);
    ctx.strokeStyle = palette.light;
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(x0, y0, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = palette.light;
    ctx.beginPath();
    ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawStrip() {
    const x0 = clipX;
    const w = planeW * 2 + GAP;
    const c = color.create();
    for (let i = 0; i < w; i++) {
        color.fromOklchInGamut(c, [0.75, 0.4, (i / w) * 360]);
        ctx.fillStyle = color.toCSS(c);
        ctx.fillRect(x0 + i, stripY, 1.5, STRIP_H);
    }
    const mx = x0 + (hue / 360) * w;
    ctx.strokeStyle = palette.light;
    ctx.lineWidth = 2;
    ctx.strokeRect(mx - 3, stripY - 4, 6, STRIP_H + 8);
    ctx.fillStyle = palette.muted;
    ctx.font = `11px ${MONO}`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(`HUE ${hue.toFixed(0)}°`, x0, stripY - 8);
}

const requested: Oklch = [0, 0, 0];
const clipResult: Oklch = [0, 0, 0];
const mappedResult: Oklch = [0, 0, 0];
const _labA = oklab.create();
const _labB = oklab.create();

function drawReadout(y: number) {
    oklch.set(requested, probeL, probeC, hue);
    color.fromOklch(lin, requested);
    oklch.fromColor(clipResult, color.clamp(clipped, lin));
    oklch.fromColor(mappedResult, color.fromOklchInGamut(mapped, requested));
    const requestedLab = oklch.toOklab(_labA, requested);

    const rows: [string, Color | null, Oklch, string][] = [
        ['requested', null, requested, inGamut(lin) ? 'in gamut' : 'outside sRGB'],
        [
            'clip',
            clipped,
            clipResult,
            `Δh ${hueDelta(clipResult[2], hue).toFixed(1)}°  ΔE ${oklab.distance(requestedLab, oklch.toOklab(_labB, clipResult)).toFixed(3)}`,
        ],
        [
            'fromOklchInGamut',
            mapped,
            mappedResult,
            `Δh ${hueDelta(mappedResult[2], hue).toFixed(1)}°  ΔE ${oklab.distance(requestedLab, oklch.toOklab(_labB, mappedResult)).toFixed(3)}`,
        ],
    ];

    ctx.font = `12px ${MONO}`;
    ctx.textBaseline = 'middle';
    rows.forEach(([name, swatch, value, note], i) => {
        const ry = y + i * 24;
        if (swatch) {
            ctx.fillStyle = color.toCSS(swatch);
            ctx.fillRect(clipX, ry - 8, 16, 16);
        } else {
            ctx.strokeStyle = palette.light;
            ctx.lineWidth = 1;
            ctx.strokeRect(clipX + 0.5, ry - 7.5, 15, 15);
        }
        ctx.fillStyle = palette.light;
        ctx.fillText(name, clipX + 28, ry);
        ctx.fillText(fmt(value), clipX + 180, ry);
        ctx.fillStyle = palette.muted;
        ctx.fillText(note, clipX + 410, ry);
    });
}

let lastHue = Number.NaN;

function draw() {
    if (hue !== lastHue) {
        renderPlanes();
        computeBoundary();
        lastHue = hue;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawPlane(clipX, clipBuffer, 'clip  color.clamp');
    drawPlane(mappedX, mappedBuffer, 'color.fromOklchInGamut');
    drawStrip();
    drawReadout(stripY + STRIP_H + 36);
    drawProbe(clipX, clipResult);
    drawProbe(mappedX, mappedResult);
}

/* interaction */

let draggingHue = false;

function setHueFromPointer(clientX: number) {
    const w = planeW * 2 + GAP;
    hue = Math.min(Math.max((clientX - clipX) / w, 0), 0.9999) * 360;
}

function setProbeFromPointer(clientX: number, clientY: number): boolean {
    const y = clientY - planeY;
    if (y < 0 || y > planeH) return false;
    for (const planeX of [clipX, mappedX]) {
        const x = clientX - planeX;
        if (x >= 0 && x <= planeW) {
            probeC = (x / planeW) * C_MAX;
            probeL = 1 - y / planeH;
            return true;
        }
    }
    return false;
}

canvas.addEventListener('pointerdown', (e) => {
    if (e.clientY >= stripY - 8 && e.clientY <= stripY + STRIP_H + 8) {
        autoRotate = false;
        draggingHue = true;
        canvas.setPointerCapture(e.pointerId);
        setHueFromPointer(e.clientX);
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (draggingHue) setHueFromPointer(e.clientX);
    else if (setProbeFromPointer(e.clientX, e.clientY)) autoRotate = false;
});

canvas.addEventListener('pointerup', () => {
    draggingHue = false;
});

window.addEventListener('resize', layout);

let lastTime = performance.now();

function frame(now: number) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (autoRotate) hue = (hue + dt * 6) % 360;
    draw();
    requestAnimationFrame(frame);
}

await document.fonts.ready;
layout();
requestAnimationFrame(frame);
