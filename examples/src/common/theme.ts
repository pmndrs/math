// The pmndrs brand theme from the promo film: a warm dark base, linework and type in the brand
// light, warm greys for guides, and spectrum accents for emphasis. Shaders write these
// values straight to an sRGB canvas, so the hex values land on screen unchanged.

export const palette = {
    /** Canvas base, the talk's mineral sky. */
    base: '#14120e',
    /** Page and panel surface, a shade above the base. */
    page: '#191712',
    /** Brand light, for linework, type and neutral solids. */
    light: '#eae5da',
    /** Warm gray for secondary text and faint guides. */
    muted: '#8c877a',
    /** Dim fill for context that should recede. */
    dim: '#5a554a',
} as const;

/** Brand accents in spectrum order: purple, red, orange, yellow, green, teal, blue. */
export const spectrum = ['#d855f9', '#ff4980', '#ffc043', '#ebff0f', '#caf543', '#00f7a3', '#2bdcf6'] as const;

/** A hex color as [r, g, b] in [0, 1], for shader constants. */
export function rgb(hex: string): [number, number, number] {
    return [parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255];
}

/** The base as an opaque clear color for scene passes. */
export const clearColor: [number, number, number, number] = [...rgb(palette.base), 1];

/** A monochromatic fill between the canvas base and an ink. */
export function toneAt(hex: string, shade: number): [number, number, number] {
    const a = rgb(palette.base);
    const b = rgb(hex);
    return [a[0] + (b[0] - a[0]) * shade, a[1] + (b[1] - a[1]) * shade, a[2] + (b[2] - a[2]) * shade];
}

/** Warm greyscale as [r, g, b] in [0, 1]: 0 is the base, 1 the brand light. Mirrors `grey` in common/ink. */
export function greyAt(shade: number): [number, number, number] {
    return toneAt(palette.light, shade);
}
