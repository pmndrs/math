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

const _lab: Oklab = [0, 0, 0];

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
