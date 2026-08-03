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
/* eslint-enable sort-keys */

// ---------------------------------------------------------------------------
// sRGB <-> linear conversion helpers
// ---------------------------------------------------------------------------

/** Convert a single sRGB gamma-encoded channel [0, 1] to linear light [0, 1]. */
function srgbChannelToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Convert a single linear light channel [0, 1] to sRGB gamma-encoded [0, 1]. */
function linearChannelToSrgb(c: number): number {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ---------------------------------------------------------------------------
// Internal parser helpers
// ---------------------------------------------------------------------------

function parseHex3(hex: string): Color {
    const r = parseInt(hex[1] + hex[1], 16) / 255;
    const g = parseInt(hex[2] + hex[2], 16) / 255;
    const b = parseInt(hex[3] + hex[3], 16) / 255;
    return [srgbChannelToLinear(r), srgbChannelToLinear(g), srgbChannelToLinear(b)];
}

function parseHex6(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [srgbChannelToLinear(r), srgbChannelToLinear(g), srgbChannelToLinear(b)];
}

function parseRgbString(str: string): Color | null {
    const m = str.match(/^rgb\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/i);
    if (!m) return null;
    const parse = (s: string): number => {
        s = s.trim();
        if (s.endsWith('%')) return parseFloat(s) / 100;
        return parseFloat(s) / 255;
    };
    return [srgbChannelToLinear(parse(m[1])), srgbChannelToLinear(parse(m[2])), srgbChannelToLinear(parse(m[3]))];
}

function parseHslString(str: string): Color | null {
    const m = str.match(/^hsl\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/i);
    if (!m) return null;
    const h = parseFloat(m[1]) / 360;
    const s = parseFloat(m[2]) / 100;
    const l = parseFloat(m[3]) / 100;
    return hslToLinear(h, s, l);
}

function hslToLinear(h: number, s: number, l: number): Color {
    let r: number, g: number, b: number;
    if (s === 0) {
        r = g = b = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [srgbChannelToLinear(r), srgbChannelToLinear(g), srgbChannelToLinear(b)];
}

function hue2rgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}

/** A linear-sRGB color: [r, g, b] floats in [0, 1]. */
export type Color = [r: number, g: number, b: number];

/** Accepted input types for creating or parsing a Color */
export type ColorInput =
    | string                     // '#f00', '#ff0000', 'red', 'rgb(255,0,0)', 'hsl(0,100%,50%)'
    | number                     // 0xff0000 integer (sRGB gamma)
    | [number, number, number];  // [r, g, b] linear floats [0, 1]

/** Create a new Color initialized to black [0, 0, 0]. */
export function create(): Color {
    return [0, 0, 0];
}

/** Create a new Color with the given linear r, g, b values. */
export function fromValues(r: number, g: number, b: number): Color {
    return [r, g, b];
}

/** Create a new Color that is a copy of `c`. */
export function clone(c: Color): Color {
    return [c[0], c[1], c[2]];
}

/** Copy the values from `src` into `out`. Returns `out`. */
export function copy(out: Color, src: Color): Color {
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

/**
 * Set `out` from an sRGB gamma-encoded [r, g, b] array with values in [0, 1].
 * Converts from sRGB gamma space to linear. Returns `out`.
 */
export function setFromSRGB(out: Color, srgb: [number, number, number]): Color {
    out[0] = srgbChannelToLinear(srgb[0]);
    out[1] = srgbChannelToLinear(srgb[1]);
    out[2] = srgbChannelToLinear(srgb[2]);
    return out;
}

/** Create a new Color from an sRGB gamma-encoded [r, g, b] array with values in [0, 1]. */
export function fromSRGB(srgb: [number, number, number]): Color {
    return setFromSRGB(create(), srgb);
}

/**
 * Parse any supported color input and write the result into `out`. Returns `out`.
 *
 * Supported inputs:
 *   - CSS hex strings:       '#f00', '#ff0000'
 *   - CSS rgb():             'rgb(255, 0, 0)', 'rgb(100%, 0%, 0%)'
 *   - CSS hsl():             'hsl(0, 100%, 50%)'
 *   - 0xRRGGBB integers:     0xff0000 (sRGB gamma)
 *   - Named CSS colors:      'red', 'lime', 'deepskyblue', ...
 *   - [r, g, b] array:       treated as already-linear [0, 1]
 */
export function setFromColorInput(out: Color, input: ColorInput): Color {
    const parsed = parse(input);
    if (parsed === null) return out;
    out[0] = parsed[0];
    out[1] = parsed[1];
    out[2] = parsed[2];
    return out;
}

/** Parse any supported color input into a new Color */
export function fromColorInput(input: ColorInput): Color | null {
    return parse(input);
}

/** Create a CSS `rgb(...)` string in sRGB gamma space (for HTML/canvas use) */
export function toCSS(c: Color): string {
    const r = Math.round(linearChannelToSrgb(c[0]) * 255);
    const g = Math.round(linearChannelToSrgb(c[1]) * 255);
    const b = Math.round(linearChannelToSrgb(c[2]) * 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function parse(input: ColorInput): Color | null {
    // [r, g, b] array, treated as already-linear
    if (Array.isArray(input)) {
        return [input[0] ?? 0, input[1] ?? 0, input[2] ?? 0];
    }

    // Integer 0xRRGGBB (sRGB gamma)
    if (typeof input === 'number') {
        const r = ((input >> 16) & 0xff) / 255;
        const g = ((input >> 8) & 0xff) / 255;
        const b = (input & 0xff) / 255;
        return [srgbChannelToLinear(r), srgbChannelToLinear(g), srgbChannelToLinear(b)];
    }

    // String forms
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

    const hex = CSS_COLORS[s];
    if (hex !== undefined) {
        return parseHex6('#' + hex.toString(16).padStart(6, '0'));
    }

    console.warn(`[gpucat] color: unrecognised color input: "${input}"`);
    return null;
}
