import type { Const } from '../core/const';
import type { Color } from './color';

/**
 * An Oklab color: [L, a, b]. L is perceptual lightness in [0, 1], a (green to red) and b (blue to yellow)
 * are roughly in [-0.4, 0.4]. Equal distances are roughly equal perceived differences.
 */
export type Oklab = [lightness: number, a: number, b: number];

/** Create a new Oklab initialized to [0, 0, 0] (black). */
export function create(): Oklab {
    return [0, 0, 0];
}

/** Create a new Oklab with the given L, a, b values. */
export function fromValues(l: number, a: number, b: number): Oklab {
    return [l, a, b];
}

/** Create a new Oklab that is a copy of `a`. */
export function clone(a: Const<Oklab>): Oklab {
    return [a[0], a[1], a[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Oklab, src: Const<Oklab>): Oklab {
    out[0] = src[0];
    out[1] = src[1];
    out[2] = src[2];
    return out;
}

/** Set the L, a, b components of `out` directly. Returns `out`. */
export function set(out: Oklab, l: number, a: number, b: number): Oklab {
    out[0] = l;
    out[1] = a;
    out[2] = b;
    return out;
}

/** Write the Oklab of a linear-sRGB Color into `out`. Returns `out`. */
export function fromColor(out: Oklab, c: Const<Color>): Oklab {
    const r = c[0];
    const g = c[1];
    const b = c[2];

    // linear sRGB -> LMS cone response, then a cube root (sign-preserving, so out-of-gamut input stays finite)
    const l = Math.cbrt(0.4122214694707629 * r + 0.5363325372617349 * g + 0.051445993267502196 * b);
    const m = Math.cbrt(0.2119034958178251 * r + 0.6806995506452345 * g + 0.10739695353694051 * b);
    const s = Math.cbrt(0.08830245919005637 * r + 0.2817188391361215 * g + 0.6299787016738223 * b);

    out[0] = 0.210454268309314 * l + 0.7936177747023054 * m - 0.0040720430116193 * s;
    out[1] = 1.9779985324311684 * l - 2.42859224204858 * m + 0.450593709617411 * s;
    out[2] = 0.0259040424655478 * l + 0.7827717124575296 * m - 0.8086757549230774 * s;
    return out;
}

/**
 * Write the linear-sRGB Color of an Oklab into `out`. Returns `out`.
 * Colors outside the sRGB gamut yield channels outside [0, 1]. Clamp or gamut map if needed.
 */
export function toColor(out: Color, a: Const<Oklab>): Color {
    const L = a[0];
    const A = a[1];
    const B = a[2];

    const l_ = L + 0.3963377773761749 * A + 0.2158037573099136 * B;
    const m_ = L - 0.1055613458156586 * A - 0.0638541728258133 * B;
    const s_ = L - 0.0894841775298119 * A - 1.2914855480194092 * B;
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    out[0] = 4.076741636075959 * l - 3.307711539258062 * m + 0.2309699031821041 * s;
    out[1] = -1.2684379732850313 * l + 2.6097573492876878 * m - 0.3413193760026569 * s;
    out[2] = -0.004196076138675526 * l - 0.703418617935936 * m + 1.7076146940746113 * s;
    return out;
}

/** Linearly interpolate from `a` to `b` by `t` into `out` (a perceptually even blend). Returns `out`. */
export function lerp(out: Oklab, a: Const<Oklab>, b: Const<Oklab>, t: number): Oklab {
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
}

/** Perceptual difference between `a` and `b` (deltaE OK, Euclidean in Oklab). About 0.02 is just noticeable. */
export function distance(a: Const<Oklab>, b: Const<Oklab>): number {
    const dl = a[0] - b[0];
    const da = a[1] - b[1];
    const db = a[2] - b[2];
    return Math.sqrt(dl * dl + da * da + db * db);
}
