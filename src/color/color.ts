import type { Const } from '../core/const';
import { linearToSrgb, srgbToLinear } from './colorspace';
import { hslToLinearSrgb, oklabToLinearSrgb } from './convert';
import type { HSL } from './hsl';
import type { Oklab } from './oklab';
import * as oklch from './oklch';
import type { Oklch } from './oklch';

export * from './parse';

/** A linear-sRGB color: [r, g, b], nominally in [0, 1]. Out-of-gamut colors have channels outside that range. */
export type Color = [r: number, g: number, b: number];

/** Accepted input types for creating or parsing a Color. */
export type ColorInput =
    | string // '#f00', '#ff0000', 'red', 'rgb(255,0,0)', 'hsl(0,100%,50%)', 'oklch(70% 0.1 250)'
    | number // 0xff0000 integer (sRGB gamma)
    | [number, number, number]; // [r, g, b] linear floats [0, 1]

/** Create a new Color initialized to black [0, 0, 0]. */
export function create(): Color {
    return [0, 0, 0];
}

/** Create a new Color with the given linear r, g, b values. */
export function fromValues(r: number, g: number, b: number): Color {
    return [r, g, b];
}

/** Create a new Color that is a copy of `c`. */
export function clone(c: Const<Color>): Color {
    return [c[0], c[1], c[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Color, src: Const<Color>): Color {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the linear r, g, b components of `out` directly. Returns `out`. */
export function set(out: Color, r: number, g: number, b: number): Color {
    out[0] = r;
    out[1] = g;
    out[2] = b;
    return out;
}

/** Set all three channels of `out` to the same linear value `s` (a gray). Returns `out`. */
export function setScalar(out: Color, s: number): Color {
    out[0] = s;
    out[1] = s;
    out[2] = s;
    return out;
}

/**
 * Set `out` from an sRGB gamma-encoded [r, g, b] array with values in [0, 1].
 * Converts from sRGB gamma space to linear. Returns `out`.
 */
export function setFromSRGB(out: Color, srgb: readonly [number, number, number]): Color {
    out[0] = srgbToLinear(srgb[0]);
    out[1] = srgbToLinear(srgb[1]);
    out[2] = srgbToLinear(srgb[2]);
    return out;
}

/** Create a new Color from an sRGB gamma-encoded [r, g, b] array with values in [0, 1]. */
export function fromSRGB(srgb: readonly [number, number, number]): Color {
    return setFromSRGB(create(), srgb);
}

/** Write the sRGB gamma-encoded [r, g, b] of a linear-sRGB Color into `out` (values [0, 1]). */
export function toSRGB(out: [number, number, number], c: Const<Color>): [number, number, number] {
    out[0] = linearToSrgb(c[0]);
    out[1] = linearToSrgb(c[1]);
    out[2] = linearToSrgb(c[2]);
    return out;
}

/** Create a CSS `rgb(...)` string in sRGB gamma space (for HTML/canvas use). */
export function toCSS(c: Const<Color>): string {
    return `rgb(${to255(c[0])}, ${to255(c[1])}, ${to255(c[2])})`;
}

/** Convert to a 0xRRGGBB integer in sRGB gamma space. */
export function toHex(c: Const<Color>): number {
    return (to255(c[0]) << 16) | (to255(c[1]) << 8) | to255(c[2]);
}

/** Convert to a 6-digit sRGB hex string without a leading '#', e.g. 'ff8800'. */
export function toHexString(c: Const<Color>): string {
    return toHex(c).toString(16).padStart(6, '0');
}

/** Set `out` from an HSL color (hue, saturation and lightness on gamma-encoded sRGB, as in CSS). Returns `out`. */
export function fromHsl(out: Color, a: Const<HSL>): Color {
    return hslToLinearSrgb(out, a[0], a[1], a[2]);
}

/**
 * Set `out` from an Oklab color. Returns `out`.
 * Colors outside the sRGB gamut yield channels outside [0, 1]. Clamp or gamut map if needed.
 */
export function fromOklab(out: Color, a: Const<Oklab>): Color {
    return oklabToLinearSrgb(out, a[0], a[1], a[2]);
}

/**
 * Set `out` from an Oklch color. Returns `out`.
 * Colors outside the sRGB gamut yield channels outside [0, 1]. Use `fromOklchInGamut` to map them
 * perceptually, or `clamp` for a cheaper clip that can shift hue.
 */
export function fromOklch(out: Color, a: Const<Oklch>): Color {
    return fromOklab(out, oklch.toOklab(_fromOklch_lab, a));
}

const _fromOklch_lab: Oklab = [0, 0, 0];

/**
 * Set `out` from an Oklch color, mapped into the sRGB gamut. Returns `out`.
 *
 * Out-of-gamut colors keep their lightness and hue and lose chroma until they reach the gamut surface
 * (the CSS Color 4 ray trace method). Results are within about 0.02 deltaE OK of the CSS `oklch()`
 * gamut mapping algorithm, but not identical. L >= 1 maps to white and L <= 0 to black.
 */
export function fromOklchInGamut(out: Color, a: Const<Oklch>): Color {
    const l = a[0];
    const h = a[2];

    if (l >= 1 || l <= 0) {
        const v = l >= 1 ? 1 : 0;
        out[0] = v;
        out[1] = v;
        out[2] = v;
        return out;
    }

    const lch = oklch.set(_fromOklchInGamut_lch, l, Math.max(a[1], 0), h);
    fromOklch(out, lch);
    if (isInUnitCube(out, 0)) return out;

    // cast a ray in linear RGB from the gray of the same lightness out through the color, take
    // where it leaves the [0, 1] cube, then restore L and h in Oklch and repeat to converge
    const anchor = _fromOklchInGamut_anchor;
    const last = _fromOklchInGamut_last;
    // the Oklab gray of lightness l is l^3 in every linear sRGB channel
    anchor[0] = anchor[1] = anchor[2] = l * l * l;
    last[0] = out[0];
    last[1] = out[1];
    last[2] = out[2];

    for (let i = 0; i < 4; i++) {
        if (i > 0) {
            oklch.fromColor(lch, out);
            lch[0] = l;
            lch[2] = h;
            fromOklch(out, lch);
        }

        const t = rayExitUnitCube(anchor, out);
        if (t < 0) {
            out[0] = last[0];
            out[1] = last[1];
            out[2] = last[2];
            break;
        }

        // a corrected color strictly inside the cube is a closer anchor for the next ray
        const moveAnchor = i > 0 && isInUnitCube(out, 1e-12);
        for (let k = 0; k < 3; k++) {
            const hit = anchor[k] + (out[k] - anchor[k]) * t;
            if (moveAnchor) anchor[k] = out[k];
            out[k] = hit;
            last[k] = hit;
        }
    }

    // remove floating point noise at the surface
    out[0] = Math.min(Math.max(out[0], 0), 1);
    out[1] = Math.min(Math.max(out[1], 0), 1);
    out[2] = Math.min(Math.max(out[2], 0), 1);
    return out;
}

const _fromOklchInGamut_lch: Oklch = [0, 0, 0];
const _fromOklchInGamut_anchor: Color = [0, 0, 0];
const _fromOklchInGamut_last: Color = [0, 0, 0];

/** Add `a + b` component-wise into `out`. Returns `out`. */
export function add(out: Color, a: Const<Color>, b: Const<Color>): Color {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}

/** Add scalar `s` to each channel of `a` into `out`. Returns `out`. */
export function addScalar(out: Color, a: Const<Color>, s: number): Color {
    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;
    return out;
}

/** Subtract `a - b` component-wise into `out`. Returns `out`. */
export function sub(out: Color, a: Const<Color>, b: Const<Color>): Color {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

/** Multiply `a * b` component-wise into `out` (tinting). Returns `out`. */
export function multiply(out: Color, a: Const<Color>, b: Const<Color>): Color {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}

/** Scale each channel of `a` by `s` into `out` (brightness). Returns `out`. */
export function multiplyScalar(out: Color, a: Const<Color>, s: number): Color {
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    return out;
}

/** Linearly interpolate from `a` to `b` by `t` into `out` (physically-correct blend). Returns `out`. */
export function lerp(out: Color, a: Const<Color>, b: Const<Color>, t: number): Color {
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/** Clamp each channel of `c` to [0, 1] into `out`. Returns `out`. */
export function clamp(out: Color, c: Const<Color>): Color {
    out[0] = clamp01(c[0]);
    out[1] = clamp01(c[1]);
    out[2] = clamp01(c[2]);
    return out;
}

/** Whether `a` and `b` are equal, within an optional per-channel `epsilon` (default exact). */
export function equals(a: Const<Color>, b: Const<Color>, epsilon = 0): boolean {
    return Math.abs(a[0] - b[0]) <= epsilon && Math.abs(a[1] - b[1]) <= epsilon && Math.abs(a[2] - b[2]) <= epsilon;
}

/** Relative luminance in [0, 1] (Rec. 709 weights, on linear light). */
export function luminance(c: Const<Color>): number {
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function clamp01(x: number): number {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** linear channel -> clamped sRGB byte [0, 255]. */
function to255(c: number): number {
    return Math.max(0, Math.min(255, Math.round(linearToSrgb(c) * 255)));
}

function isInUnitCube(c: Const<Color>, inset: number): boolean {
    const lo = inset;
    const hi = 1 - inset;
    return c[0] >= lo && c[0] <= hi && c[1] >= lo && c[1] <= hi && c[2] >= lo && c[2] <= hi;
}

/**
 * Slab test for the ray from `start` toward `end` against the [0, 1] cube. Returns the ray parameter t
 * of the first crossing in the start to end direction (the exit point when `start` is inside), or -1 on a miss.
 */
function rayExitUnitCube(start: Const<Color>, end: Const<Color>): number {
    let tnear = -Infinity;
    let tfar = Infinity;
    for (let i = 0; i < 3; i++) {
        const s = start[i];
        const d = end[i] - s;
        if (Math.abs(d) > 1e-12) {
            const t1 = -s / d;
            const t2 = (1 - s) / d;
            tnear = Math.max(Math.min(t1, t2), tnear);
            tfar = Math.min(Math.max(t1, t2), tfar);
        } else if (s < 0 || s > 1) {
            return -1;
        }
    }
    if (tnear > tfar || tfar < 0) return -1;
    const t = tnear < 0 ? tfar : tnear;
    return Number.isFinite(t) ? t : -1;
}
