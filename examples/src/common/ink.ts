// Flat inks and linework for readable mathematical drawings.

import * as g from 'gpucat';
import { palette, rgb } from './theme';

const d = g.d;

/** The brand light, for construction lines and neutral solids. */
export const light = g.vec3(...rgb(palette.light));

/** A hex colour, usually one of the spectrum, as a shader constant. */
export function ink(hex: string): g.Node<typeof d.vec3f> {
    return g.vec3(...rgb(hex));
}

/** Warm greyscale: 0 is the base, 1 the brand light. */
export function grey(shade: g.Node<typeof d.f32>): g.Node<typeof d.vec3f> {
    return g.mix(ink(palette.base), light, shade);
}

/** An antialiased line at each integer value, with width in CSS pixels. Fragment only. */
export function isoline(value: g.Node<typeof d.f32>, width = 1): g.Node<typeof d.f32> {
    const distance = g.abs(g.fract(value.add(g.f32(0.5))).sub(g.f32(0.5)));
    const footprint = g.fwidth(value).max(g.f32(1e-5));
    const halfWidth = (width * devicePixelRatio) / 2;
    return g.f32(1).sub(g.smoothstep(g.f32(Math.max(0, halfWidth - 0.5)), g.f32(halfWidth + 0.5), distance.div(footprint)));
}

/** A line width in CSS pixels. gpucat lines span half their `lineWidth` in device pixels. */
export function pixels(css: number): number {
    return css * 2 * devicePixelRatio;
}
