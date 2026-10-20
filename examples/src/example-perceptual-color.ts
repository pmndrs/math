import { type Color, color, hsl, oklab, oklch } from 'math/color';
import { mulberry32 } from 'math/random';
import { createInfo } from './common/info';
import { palette } from './common/theme';

// RGB and HSL against Oklab and Oklch, drawn to a 2D canvas. Under every band sits a thin strip of
// its perceived lightness (Oklab L as a neutral grey), so the difference is visible at a glance:
// hue sweeps and random picks in HSL and RGB swing between bright and dark, while Oklch holds an
// even lightness. Gradients compare blending in each space, where RGB and HSL fall through grey
// or swing in brightness and Oklab and Oklch stay even. Every colour comes from math/color.

const MONO = '"Geist Mono", ui-monospace, monospace';
const SWATCHES = 32;

// layout metrics (CSS pixels)
const MARGIN = 32;
const LABEL_W = 220;
const STAT_W = 150;
const BAND_H = 26;
const STRIP_H = 6;
const ROW_GAP = 10;
const HEADER_H = 34;

type Row = { label: string; colors: Color[]; stat: string; discrete: boolean };
type Section = { title: string; rows: Row[] };

const _lab = oklab.create();
const _lch = oklch.create();

function lightness(c: Color): number {
    return oklab.fromColor(_lab, c)[0];
}

function lightnessStat(colors: Color[]): string {
    let sum = 0;
    for (const c of colors) sum += lightness(c);
    const mean = sum / colors.length;
    let variance = 0;
    for (const c of colors) variance += (lightness(c) - mean) ** 2;
    return `L ${mean.toFixed(2)} ± ${Math.sqrt(variance / colors.length).toFixed(2)}`;
}

function minChromaStat(colors: Color[]): string {
    let min = Infinity;
    for (const c of colors) min = Math.min(min, oklch.fromColor(_lch, c)[1]);
    return `min C ${min.toFixed(3)}`;
}

/* hue sweeps */

function sweep(n: number, at: (out: Color, t: number) => Color): Color[] {
    const colors: Color[] = [];
    for (let i = 0; i < n; i++) colors.push(at(color.create(), i / (n - 1)));
    return colors;
}

function hueSection(n: number): Section {
    const rows: [string, (out: Color, t: number) => Color][] = [
        ['hsl   s 100%  l 50%', (out, t) => hsl.toColor(out, [t, 1, 0.5])],
        ['oklch L 0.75  C 0.12', (out, t) => oklch.toColorInGamut(out, [0.75, 0.12, t * 360])],
        ['oklch L 0.75  max C', (out, t) => oklch.toColorInGamut(out, [0.75, 0.4, t * 360])],
    ];
    return {
        title: 'hue sweep',
        rows: rows.map(([label, at]) => {
            const colors = sweep(n, at);
            return { label, colors, stat: lightnessStat(colors), discrete: false };
        }),
    };
}

/* random picks */

let seed = 7;

function randomSection(): Section {
    const state = mulberry32.create(seed);
    const rand = () => mulberry32.sample(state);
    const rows: [string, (out: Color) => Color][] = [
        ['rgb   uniform r g b', (out) => color.setFromSRGB(out, [rand(), rand(), rand()])],
        ['hsl   random h', (out) => hsl.toColor(out, [rand(), 1, 0.5])],
        ['oklch random h', (out) => oklch.toColorInGamut(out, [0.75, 0.12, rand() * 360])],
    ];
    return {
        title: `random picks  seed ${seed}`,
        rows: rows.map(([label, pick]) => {
            const colors: Color[] = [];
            for (let i = 0; i < SWATCHES; i++) colors.push(pick(color.create()));
            return { label, colors, stat: lightnessStat(colors), discrete: true };
        }),
    };
}

/* gradients */

const PRESETS: [Color, Color][] = [
    [
        [0, 0, 1],
        [1, 1, 0],
    ],
    [
        [1, 1, 1],
        [0, 0, 1],
    ],
    [
        [1, 0, 1],
        [0, 1, 0],
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
    ],
];
let preset = 0;
const stopA = color.clone(PRESETS[0][0]);
const stopB = color.clone(PRESETS[0][1]);

function gradientSection(n: number): Section {
    const srgbA = color.toSRGB([0, 0, 0], stopA);
    const srgbB = color.toSRGB([0, 0, 0], stopB);
    const hslA = hsl.fromColor(hsl.create(), stopA);
    const hslB = hsl.fromColor(hsl.create(), stopB);
    const labA = oklab.fromColor(oklab.create(), stopA);
    const labB = oklab.fromColor(oklab.create(), stopB);
    const lchA = oklch.fromColor(oklch.create(), stopA);
    const lchB = oklch.fromColor(oklch.create(), stopB);
    const srgb: [number, number, number] = [0, 0, 0];
    const h = hsl.create();
    const lab = oklab.create();
    const lch = oklch.create();

    const rows: [string, (out: Color, t: number) => Color][] = [
        [
            'srgb  gamma lerp',
            (out, t) => {
                for (let k = 0; k < 3; k++) srgb[k] = srgbA[k] + (srgbB[k] - srgbA[k]) * t;
                return color.setFromSRGB(out, srgb);
            },
        ],
        ['rgb   linear lerp', (out, t) => color.lerp(out, stopA, stopB, t)],
        ['hsl   lerp', (out, t) => hsl.toColor(out, hsl.lerp(h, hslA, hslB, t))],
        ['oklab lerp', (out, t) => oklab.toColor(out, oklab.lerp(lab, labA, labB, t))],
        ['oklch lerp', (out, t) => oklch.toColorInGamut(out, oklch.lerp(lch, lchA, lchB, t))],
    ];
    return {
        title: `gradients  #${color.toHexString(stopA)} → #${color.toHexString(stopB)}`,
        rows: rows.map(([label, at]) => {
            const colors = sweep(n, at);
            return { label, colors, stat: minChromaStat(colors), discrete: false };
        }),
    };
}

/* canvas */

const canvas = document.createElement('canvas');
canvas.style.display = 'block';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const info = createInfo();
info.innerHTML =
    'hold <b>space</b> to see perceived lightness only<br><b>r</b> reroll · <b>g</b> next gradient<br>click a colour to start a gradient there, shift+click to end it';

let showLightness = false;
let sections: Section[] = [];
let originX = 0;
let originY = 0;
let bandW = 0;

// where each band was drawn, for picking colours with the pointer
const hits: { x: number; y: number; w: number; row: Row }[] = [];

function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const blockW = Math.min(w - MARGIN * 2, 1080);
    bandW = Math.max(120, Math.floor(blockW - LABEL_W - STAT_W));
    originX = Math.round((w - blockW) / 2);
    rebuild();
}

function rebuild() {
    sections = [hueSection(bandW), randomSection(), gradientSection(bandW)];
    const rows = sections.reduce((n, s) => n + s.rows.length, 0);
    const blockH = sections.length * HEADER_H + rows * (BAND_H + 2 + STRIP_H + ROW_GAP);
    originY = Math.max(MARGIN, Math.round((window.innerHeight - blockH) / 2));
    draw();
}

const _grey = color.create();

function fillColor(c: Color) {
    if (showLightness) {
        const l = lightness(c);
        ctx.fillStyle = color.toCSS(oklab.toColor(_grey, [l, 0, 0]));
    } else {
        ctx.fillStyle = color.toCSS(c);
    }
}

function drawBand(row: Row, x: number, y: number, h: number, asLightness: boolean) {
    const n = row.colors.length;
    const prev = showLightness;
    showLightness = showLightness || asLightness;
    if (row.discrete) {
        const cell = bandW / n;
        for (let i = 0; i < n; i++) {
            fillColor(row.colors[i]);
            ctx.fillRect(Math.round(x + i * cell), y, Math.max(1, Math.round(cell) - 2), h);
        }
    } else {
        for (let i = 0; i < n; i++) {
            fillColor(row.colors[i]);
            ctx.fillRect(x + i, y, 1.5, h);
        }
    }
    showLightness = prev;
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.textBaseline = 'middle';
    hits.length = 0;

    let y = originY;
    for (const section of sections) {
        ctx.fillStyle = palette.muted;
        ctx.font = `11px ${MONO}`;
        ctx.fillText(section.title.toUpperCase(), originX, y + HEADER_H / 2);
        y += HEADER_H;

        for (const row of section.rows) {
            const bandX = originX + LABEL_W;
            ctx.fillStyle = palette.light;
            ctx.font = `12px ${MONO}`;
            ctx.fillText(row.label, originX, y + BAND_H / 2);

            drawBand(row, bandX, y, BAND_H, false);
            drawBand(row, bandX, y + BAND_H + 2, STRIP_H, true);
            hits.push({ x: bandX, y, w: bandW, row });

            ctx.fillStyle = palette.muted;
            ctx.fillText(row.stat, bandX + bandW + 16, y + BAND_H / 2);
            y += BAND_H + 2 + STRIP_H + ROW_GAP;
        }
    }
}

/* interaction */

window.addEventListener('resize', layout);

window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !showLightness) {
        showLightness = true;
        draw();
        e.preventDefault();
    } else if (e.key === 'r') {
        seed = (seed * 48271) % 2147483647;
        rebuild();
    } else if (e.key === 'g') {
        preset = (preset + 1) % PRESETS.length;
        color.copy(stopA, PRESETS[preset][0]);
        color.copy(stopB, PRESETS[preset][1]);
        rebuild();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        showLightness = false;
        draw();
    }
});

canvas.addEventListener('pointerdown', (e) => {
    for (const hit of hits) {
        if (e.clientY < hit.y || e.clientY > hit.y + BAND_H || e.clientX < hit.x || e.clientX >= hit.x + hit.w) continue;
        const n = hit.row.colors.length;
        const i = Math.min(n - 1, Math.floor(((e.clientX - hit.x) / hit.w) * n));
        color.copy(e.shiftKey ? stopB : stopA, hit.row.colors[i]);
        rebuild();
        return;
    }
});

await document.fonts.ready;
layout();
