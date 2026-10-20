// Internal: conversions into linear sRGB shared by the `color` namespace and the CSS parser.
// Kept out of color.ts so the parser, which color.ts re-exports, can use them without an import cycle.

import type { Color } from './color';
import { srgbToLinear } from './colorspace';

/** HSL on gamma-encoded sRGB, all in [0, 1] (hue wraps), to linear sRGB in `out`. Returns `out`. */
export function hslToLinearSrgb(out: Color, h: number, s: number, l: number): Color {
    if (s === 0) {
        const v = srgbToLinear(l);
        out[0] = v;
        out[1] = v;
        out[2] = v;
        return out;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    out[0] = srgbToLinear(hue(p, q, h + 1 / 3));
    out[1] = srgbToLinear(hue(p, q, h));
    out[2] = srgbToLinear(hue(p, q, h - 1 / 3));
    return out;
}

function hue(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

/** Oklab to linear sRGB in `out`, unclamped. Returns `out`. */
export function oklabToLinearSrgb(out: Color, L: number, A: number, B: number): Color {
    // Oklab -> nonlinear LMS, cube, then LMS -> linear sRGB
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
