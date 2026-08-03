import { fade, lerp } from '../core/common';
import { createPermutation, dot2, type Permutation } from './permutation';

/** A seeded 2D Perlin noise generator. Create one with {@link create}. */
export type Perlin2DGenerator = Permutation;

/**
 * Creates a 2D Perlin noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Perlin2DGenerator {
    return createPermutation(seed);
}

/**
 * Samples 2D Perlin noise.
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @returns The noise value at (x, y)
 */
export function sample({ perm, gradP }: Perlin2DGenerator, x: number, y: number): number {
    // Find unit grid cell containing point
    let X = Math.floor(x);
    let Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X;
    y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;

    // Calculate noise contributions from each of the four corners
    const n00 = dot2(gradP[X + perm[Y]], x, y);
    const n01 = dot2(gradP[X + perm[Y + 1]], x, y - 1);
    const n10 = dot2(gradP[X + 1 + perm[Y]], x - 1, y);
    const n11 = dot2(gradP[X + 1 + perm[Y + 1]], x - 1, y - 1);

    // Compute the fade curve value for x
    const u = fade(x);

    // Interpolate the four results
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
}
