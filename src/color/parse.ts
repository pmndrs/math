import type { Color, ColorInput } from './color';
import { srgbToLinear } from './colorspace';
import { hslToLinearSrgb, oklabToLinearSrgb } from './conversion';
import * as oklch from './oklch';

const CSS_COLORS: Record<string, number> = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x737373,
    slategrey: 0x737373,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32,
};

/**
 * Parse any supported color input and write the result into `out`. Returns `out`.
 *
 * Supported inputs:
 *   - CSS hex strings:       '#f00', '#ff0000'
 *   - CSS rgb():             'rgb(255, 0, 0)', 'rgb(100%, 0%, 0%)'
 *   - CSS hsl():             'hsl(0, 100%, 50%)'
 *   - CSS oklab():           'oklab(0.63 0.22 0.13)', 'oklab(63% 55% 32%)'
 *   - CSS oklch():           'oklch(0.63 0.26 29)', 'oklch(63% 65% 29deg)'
 *   - 0xRRGGBB integers:     0xff0000 (sRGB gamma)
 *   - Named CSS colors:      'red', 'lime', 'deepskyblue', ...
 *   - [r, g, b] array:       treated as already-linear [0, 1]
 *
 * oklab() and oklch() colors outside sRGB are kept as-is, with channels outside [0, 1]. Alpha is ignored.
 */
export function setFromColorInput(out: Color, input: ColorInput): Color {
    const parsed = parse(input);
    if (parsed === null) return out;
    out[0] = parsed[0];
    out[1] = parsed[1];
    out[2] = parsed[2];
    return out;
}

/** Parse any supported color input into a new Color, or null if unrecognised. */
export function fromColorInput(input: ColorInput): Color | null {
    return parse(input);
}

function parse(input: ColorInput): Color | null {
    // [r, g, b] array, treated as already-linear
    if (Array.isArray(input)) {
        return [input[0] ?? 0, input[1] ?? 0, input[2] ?? 0];
    }

    // integer 0xRRGGBB (sRGB gamma)
    if (typeof input === 'number') {
        const r = ((input >> 16) & 0xff) / 255;
        const g = ((input >> 8) & 0xff) / 255;
        const b = (input & 0xff) / 255;
        return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
    }

    // string forms
    const s = input.trim().toLowerCase();

    if (/^#[0-9a-f]{3}$/i.test(s)) return parseHex3(s);
    if (/^#[0-9a-f]{6}$/i.test(s)) return parseHex6(s);

    if (s.startsWith('rgb(')) {
        const result = parseRgbString(s);
        if (result) return result;
    }

    if (s.startsWith('hsl(')) {
        const result = parseHslString(s);
        if (result) return result;
    }

    if (s.startsWith('oklab(') || s.startsWith('oklch(')) {
        const result = parseOkString(s);
        if (result) return result;
    }

    const hex = CSS_COLORS[s];
    if (hex !== undefined) {
        return parseHex6(`#${hex.toString(16).padStart(6, '0')}`);
    }

    console.warn(`[math] color: unrecognised color input: "${input}"`);
    return null;
}

function parseHex3(hex: string): Color {
    const r = parseInt(hex[1] + hex[1], 16) / 255;
    const g = parseInt(hex[2] + hex[2], 16) / 255;
    const b = parseInt(hex[3] + hex[3], 16) / 255;
    return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
}

function parseHex6(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
}

function parseRgbString(str: string): Color | null {
    const m = str.match(/^rgb\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/i);
    if (!m) return null;
    const parseChannel = (s: string): number => {
        s = s.trim();
        if (s.endsWith('%')) return parseFloat(s) / 100;
        return parseFloat(s) / 255;
    };
    return [srgbToLinear(parseChannel(m[1])), srgbToLinear(parseChannel(m[2])), srgbToLinear(parseChannel(m[3]))];
}

function parseHslString(str: string): Color | null {
    const m = str.match(/^hsl\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/i);
    if (!m) return null;
    const h = parseFloat(m[1]) / 360;
    const s = parseFloat(m[2]) / 100;
    const l = parseFloat(m[3]) / 100;
    return hslToLinearSrgb([0, 0, 0], h, s, l);
}

function parseOkString(str: string): Color | null {
    // CSS Color 4 space-separated syntax with an optional ' / alpha'
    const m = str.match(/^ok(lab|lch)\(\s*(\S+)\s+(\S+)\s+([^\s/)]+)\s*(?:\/\s*[^)]*)?\)$/);
    if (!m) return null;
    // percentages: 100% is L = 1, and a, b or C = 0.4
    const l = parseOkChannel(m[2], 1);
    const x = parseOkChannel(m[3], 0.4);
    if (m[1] === 'lab') {
        const y = parseOkChannel(m[4], 0.4);
        return oklabToLinearSrgb([0, 0, 0], l, x, y);
    }
    const h = m[4] === 'none' ? 0 : parseFloat(m[4]);
    const lab = oklch.toOklab([0, 0, 0], [l, x, h]);
    return oklabToLinearSrgb(lab, lab[0], lab[1], lab[2]);
}

function parseOkChannel(s: string, percentScale: number): number {
    if (s === 'none') return 0;
    if (s.endsWith('%')) return (parseFloat(s) / 100) * percentScale;
    return parseFloat(s);
}
