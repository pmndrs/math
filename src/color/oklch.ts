import type { Const } from '../core/const';
import type { Color } from './color';
import * as oklab from './oklab';
import type { Oklab } from './oklab';

/**
 * An Oklch color, the polar form of Oklab: [L, C, h]. L is perceptual lightness in [0, 1], C is chroma
 * (0 for grays, up to about 0.37 inside sRGB) and h is the hue angle in degrees [0, 360), as in CSS `oklch()`.
 * Grays have no meaningful hue and are stored with C = 0 and h = 0.
 */
export type Oklch = [lightness: number, chroma: number, hue: number];

/** Create a new Oklch initialized to [0, 0, 0] (black). */
export function create(): Oklch {
    return [0, 0, 0];
}

/** Create a new Oklch with the given L, C, h (degrees) values. */
export function fromValues(l: number, c: number, h: number): Oklch {
    return [l, c, h];
}

/** Create a new Oklch that is a copy of `a`. */
export function clone(a: Const<Oklch>): Oklch {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Oklch, src: Const<Oklch>): Oklch {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the L, C, h (degrees) components of `out` directly. Returns `out`. */
export function set(out: Oklch, l: number, c: number, h: number): Oklch {
    out[0] = l;
    out[1] = c;
    out[2] = h;
    return out;
}

/** Write the Oklch of an Oklab color into `out`. Returns `out`. */
export function fromOklab(out: Oklch, a: Const<Oklab>): Oklch {
    const l = a[0];
    const c = Math.sqrt(a[1] * a[1] + a[2] * a[2]);
    // below this chroma the hue is numerical noise, so snap grays to C = 0, h = 0
    if (c < 4e-6) {
        out[0] = l;
        out[1] = 0;
        out[2] = 0;
        return out;
    }
    let h = (Math.atan2(a[2], a[1]) * 180) / Math.PI;
    if (h < 0) h += 360;
    out[0] = l;
    out[1] = c;
    out[2] = h;
    return out;
}

/** Write the Oklab of an Oklch color into `out`. Returns `out`. */
export function toOklab(out: Oklab, a: Const<Oklch>): Oklab {
    const l = a[0];
    const c = a[1];
    const h = (a[2] * Math.PI) / 180;
    out[0] = l;
    out[1] = c * Math.cos(h);
    out[2] = c * Math.sin(h);
    return out;
}

/** Write the Oklch of a linear-sRGB Color into `out`. Returns `out`. */
export function fromColor(out: Oklch, c: Const<Color>): Oklch {
    return fromOklab(out, oklab.fromColor(_lab, c));
}

/**
 * Write the linear-sRGB Color of an Oklch into `out`. Returns `out`.
 * Colors outside the sRGB gamut yield channels outside [0, 1]. Use `toColorInGamut` to map them
 * perceptually, or `color.clamp` for a cheaper clip that can shift hue.
 */
export function toColor(out: Color, a: Const<Oklch>): Color {
    return oklab.toColor(out, toOklab(_lab, a));
}

const _lab: Oklab = [0, 0, 0];

/**
 * Write the linear-sRGB Color of an Oklch into `out`, mapped into the sRGB gamut. Returns `out`.
 *
 * Out-of-gamut colors keep their lightness and hue and lose chroma until they reach the gamut surface
 * (the CSS Color 4 ray trace method). Results are within about 0.02 deltaE OK of the CSS `oklch()`
 * gamut mapping algorithm, but not identical. L >= 1 maps to white and L <= 0 to black.
 */
export function toColorInGamut(out: Color, a: Const<Oklch>): Color {
    const l = a[0];
    const h = a[2];

    if (l >= 1 || l <= 0) {
        const v = l >= 1 ? 1 : 0;
        out[0] = v;
        out[1] = v;
        out[2] = v;
        return out;
    }

    const lch = set(_toColorInGamut_lch, l, Math.max(a[1], 0), h);
    toColor(out, lch);
    if (isInUnitCube(out, 0)) return out;

    // cast a ray in linear RGB from the gray of the same lightness out through the color, take
    // where it leaves the [0, 1] cube, then restore L and h in Oklch and repeat to converge
    const anchor = _toColorInGamut_anchor;
    const last = _toColorInGamut_last;
    // the Oklab gray of lightness l is l^3 in every linear sRGB channel
    anchor[0] = anchor[1] = anchor[2] = l * l * l;
    last[0] = out[0];
    last[1] = out[1];
    last[2] = out[2];

    for (let i = 0; i < 4; i++) {
        if (i > 0) {
            fromColor(lch, out);
            lch[0] = l;
            lch[2] = h;
            toColor(out, lch);
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

const _toColorInGamut_lch: Oklch = [0, 0, 0];
const _toColorInGamut_anchor: Color = [0, 0, 0];
const _toColorInGamut_last: Color = [0, 0, 0];

/**
 * Interpolate from `a` to `b` by `t` into `out`, taking the shortest path around the hue circle.
 * If only one endpoint is gray (C = 0), it has no hue and takes the other endpoint's hue, so only chroma and
 * lightness change (white to blue stays blue instead of sweeping through other hues). Returns `out`.
 */
export function lerp(out: Oklch, a: Const<Oklch>, b: Const<Oklch>, t: number): Oklch {
    let ha = a[2];
    let hb = b[2];
    if (a[1] === 0 && b[1] !== 0) ha = hb;
    else if (b[1] === 0 && a[1] !== 0) hb = ha;

    let dh = (hb - ha) % 360;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;

    let h = ha + dh * t;
    h -= Math.floor(h / 360) * 360;

    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = h;
    return out;
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
