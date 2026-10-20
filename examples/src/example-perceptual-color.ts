import { type Color, color, hsl, oklab, oklch } from 'math/color';
import { mulberry32 } from 'math/random';
import { createInfo } from './common/info';
import { palette } from './common/theme';

// RGB and HSL against Oklab and Oklch, drawn to a 2D canvas. Under every band sits a thin strip of
// its lightness, drawn as the grey of equal luminance and summarised as CIE L*. That ruler comes
// from luminance alone, not from Oklab, so it is a fair judge of the Oklab based rows. Hue sweeps
// and random hues in HSL swing between bright and dark while Oklch stays far more even. Random RGB
// swings in lightness as much as HSL and is less vivid on average. Gradients compare blending in
// each space. Click anywhere to reroll the random picks and the gradient endpoints.

const MONO = '"Geist Mono", ui-monospace, monospace';
const SWATCHES = 32;

// layout metrics (CSS pixels)
const MARGIN = 32;
const LABEL_W = 220;
const STAT_W = 250;
const BAND_H = 26;
const STRIP_H = 6;
const ROW_GAP = 8;
const HEADER_H = 50;

type Row = { label: string; colors: Color[]; stat: string; discrete: boolean };
type Section = { title: string; caption: string; rows: Row[] };

const _lch = oklch.create();

/** CIE L* (0 to 100) from relative luminance, independent of Oklab. */
function lightness(c: Color): number {
    const y = Math.max(color.luminance(c), 0);
    return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y;
}

function chroma(c: Color): number {
    return oklch.fromColor(_lch, c)[1];
}

function lightnessStat(colors: Color[]): string {
    let sum = 0;
    for (const c of colors) sum += lightness(c);
    const mean = sum / colors.length;
    let variance = 0;
    for (const c of colors) variance += (lightness(c) - mean) ** 2;
    return `L* ${mean.toFixed(0)} ± ${Math.sqrt(variance / colors.length).toFixed(1)}`;
}

function chromaStat(colors: Color[]): string {
    let sum = 0;
    for (const c of colors) sum += chroma(c);
    const mean = sum / colors.length;
    let variance = 0;
    for (const c of colors) variance += (chroma(c) - mean) ** 2;
    return `C ${mean.toFixed(2)} ± ${Math.sqrt(variance / colors.length).toFixed(2)}`;
}

function minChromaStat(colors: Color[]): string {
    let min = Infinity;
    for (const c of colors) min = Math.min(min, chroma(c));
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
        caption: 'strips show the grey of equal luminance. oklch is far more even than hsl, though not perfectly flat.',
        rows: rows.map(([label, at]) => {
            const colors = sweep(n, at);
            return { label, colors, stat: lightnessStat(colors), discrete: false };
        }),
    };
}

/* random picks */

let seed = 1;

function randomSection(rand: () => number): Section {
    const rows: [string, (out: Color) => Color][] = [
        ['rgb   uniform r g b', (out) => color.setFromSRGB(out, [rand(), rand(), rand()])],
        ['hsl   random h', (out) => hsl.toColor(out, [rand(), 1, 0.5])],
        ['oklch random h', (out) => oklch.toColorInGamut(out, [0.75, 0.12, rand() * 360])],
    ];
    return {
        title: `random picks  seed ${seed}`,
        caption: 'uniform rgb swings in lightness as much as hsl and is less vivid on average. hsl and oklch random h are the like-for-like pair.',
        rows: rows.map(([label, pick]) => {
            const colors: Color[] = [];
            for (let i = 0; i < SWATCHES; i++) colors.push(pick(color.create()));
            return { label, colors, stat: `${lightnessStat(colors)}  ${chromaStat(colors)}`, discrete: true };
        }),
    };
}

/* gradients */

// the first gradient is the classic blue to yellow, rerolls pick two random vivid colours
const stopA: Color = [0, 0, 1];
const stopB: Color = [1, 1, 0];

function randomStop(out: Color, rand: () => number): Color {
    return oklch.toColorInGamut(out, [0.45 + rand() * 0.45, 0.4, rand() * 360]);
}

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
        caption: 'rgb blends can sag through grey. oklch blends round the hue circle the short way, so it can pass other hues.',
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
info.innerHTML = 'click anywhere to reroll';
canvas.style.cursor = 'pointer';

let sections: Section[] = [];
let originX = 0;
let originY = 0;
let bandW = 0;

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
    const state = mulberry32.create(seed);
    const rand = () => mulberry32.sample(state);
    sections = [hueSection(bandW), randomSection(rand), gradientSection(bandW)];
    const rows = sections.reduce((n, s) => n + s.rows.length, 0);
    const blockH = sections.length * HEADER_H + rows * (BAND_H + 2 + STRIP_H + ROW_GAP);
    originY = Math.max(MARGIN, Math.round((window.innerHeight - blockH) / 2));
    draw();
}

const _grey = color.create();

function fillColor(c: Color, asLightness: boolean) {
    ctx.fillStyle = color.toCSS(asLightness ? color.setScalar(_grey, color.luminance(c)) : c);
}

function drawBand(row: Row, x: number, y: number, h: number, asLightness: boolean) {
    const n = row.colors.length;
    if (row.discrete) {
        const cell = bandW / n;
        for (let i = 0; i < n; i++) {
            fillColor(row.colors[i], asLightness);
            ctx.fillRect(Math.round(x + i * cell), y, Math.max(1, Math.round(cell) - 2), h);
        }
    } else {
        for (let i = 0; i < n; i++) {
            fillColor(row.colors[i], asLightness);
            ctx.fillRect(x + i, y, 1.5, h);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.textBaseline = 'middle';

    let y = originY;
    for (const section of sections) {
        ctx.fillStyle = palette.muted;
        ctx.font = `11px ${MONO}`;
        ctx.fillText(section.title.toUpperCase(), originX, y + 12);
        ctx.fillStyle = palette.dim;
        ctx.fillText(section.caption, originX, y + 30);
        y += HEADER_H;

        for (const row of section.rows) {
            const bandX = originX + LABEL_W;
            ctx.fillStyle = palette.light;
            ctx.font = `12px ${MONO}`;
            ctx.fillText(row.label, originX, y + BAND_H / 2);

            drawBand(row, bandX, y, BAND_H, false);
            drawBand(row, bandX, y + BAND_H + 2, STRIP_H, true);

            ctx.fillStyle = palette.muted;
            ctx.fillText(row.stat, bandX + bandW + 16, y + BAND_H / 2);
            y += BAND_H + 2 + STRIP_H + ROW_GAP;
        }
    }
}

/* interaction */

window.addEventListener('resize', layout);

function reroll() {
    seed++;
    const state = mulberry32.create(seed * 7919);
    const rand = () => mulberry32.sample(state);
    randomStop(stopA, rand);
    randomStop(stopB, rand);
    rebuild();
}

canvas.addEventListener('pointerdown', reroll);

await document.fonts.ready;
layout();
