import { easing } from 'math/time';
import { palette, spectrum } from './common/theme';

// A small-multiples gallery of math's easing functions: one card per curve,
// drawn to a 2D canvas. Each card plots the easing (input t across, output
// eased(t) up) over a faint grid and linear reference, with a dot in the accent
// tracing the curve at a shared, ping-ponging t so you can read each curve's
// shape and pacing at a glance. The plotted line is the function itself, sampled over [0, 1].

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
const PERIOD = 2.2; // seconds for one out-and-back
const SAMPLES = 64; // curve resolution

// card metrics (CSS pixels)
const PLOT = 130;
const PAD = 14;
const NAME_GAP = 9;
const NAME_H = 14;
const GAP = 16;
const MARGIN = 32;
const CARD_W = PLOT + PAD * 2;
const CARD_H = PAD + PLOT + NAME_GAP + NAME_H + PAD;
const MONO = '"Geist Mono", ui-monospace, monospace';
const ACCENT = spectrum[5];

/* canvas */

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

let cols = 1;
let startX = 0;
let startY = 0;

function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // lay the cards out in a centred grid
    const avail = w - MARGIN * 2;
    cols = Math.max(1, Math.min(N, Math.floor((avail + GAP) / (CARD_W + GAP))));
    const rows = Math.ceil(N / cols);
    const blockW = cols * CARD_W + (cols - 1) * GAP;
    const blockH = rows * CARD_H + (rows - 1) * GAP;
    startX = (w - blockW) / 2;
    startY = (h - blockH) / 2; // vertically centred
}
window.addEventListener('resize', resize);
resize();

/* draw */

function drawCard(index: number, p: number) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * (CARD_W + GAP);
    const y = startY + row * (CARD_H + GAP);
    const [name, fn] = EASINGS[index];

    // card background + border
    ctx.fillStyle = 'rgba(234, 229, 218, 0.02)';
    ctx.strokeStyle = 'rgba(234, 229, 218, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(x + 0.5, y + 0.5, CARD_W - 1, CARD_H - 1);
    ctx.fill();
    ctx.stroke();

    // plot origin (top-left of the square plot area)
    const px = x + PAD;
    const py = y + PAD;
    const mapX = (t: number) => px + t * PLOT;
    const mapY = (e: number) => py + (1 - e) * PLOT; // e=0 bottom, e=1 top

    // faint quarter grid
    ctx.strokeStyle = 'rgba(234, 229, 218, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 1; k < 4; k++) {
        ctx.moveTo(mapX(k / 4), mapY(0));
        ctx.lineTo(mapX(k / 4), mapY(1));
        ctx.moveTo(mapX(0), mapY(k / 4));
        ctx.lineTo(mapX(1), mapY(k / 4));
    }
    ctx.stroke();

    // faint linear reference
    ctx.strokeStyle = 'rgba(234, 229, 218, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(mapX(0), mapY(0));
    ctx.lineTo(mapX(1), mapY(1));
    ctx.stroke();
    ctx.setLineDash([]);

    // the easing curve (the function itself, sampled)
    ctx.strokeStyle = palette.light;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let s = 0; s <= SAMPLES; s++) {
        const t = s / SAMPLES;
        const cx = mapX(t);
        const cy = mapY(fn(t));
        if (s === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // the tracing dot at the shared t
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(mapX(p), mapY(fn(p)), 4.5, 0, Math.PI * 2);
    ctx.fill();

    // name below the plot
    ctx.fillStyle = palette.light;
    ctx.font = `12px ${MONO}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(name.toLowerCase(), px, py + PLOT + NAME_GAP + 11);
}

function frame(tms: number) {
    const t = tms / 1000;
    const cyc = (t / PERIOD) % 2;
    const p = cyc < 1 ? cyc : 2 - cyc; // 0 -> 1 -> 0

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = 0; i < N; i++) drawCard(i, p);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
