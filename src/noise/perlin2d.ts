import { fade, lerp } from '../core/scalar';
import { createPermutation, type Permutation } from './permutation';

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
export function sample({ perm, grad3 }: Perlin2DGenerator, x: number, y: number): number {
    // Find unit grid cell containing point
    let X = Math.floor(x);
    let Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x = x - X;
    y = y - Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;

    const x1 = x - 1;
    const y1 = y - 1;

    // Hashed gradient indices of the four corners (flat xyz triples in grad3)
    const g00 = (X + perm[Y]) * 3;
    const g01 = (X + perm[Y + 1]) * 3;
    const g10 = (X + 1 + perm[Y]) * 3;
    const g11 = (X + 1 + perm[Y + 1]) * 3;

    // Calculate noise contributions from each of the four corners
    const n00 = grad3[g00] * x + grad3[g00 + 1] * y;
    const n01 = grad3[g01] * x + grad3[g01 + 1] * y1;
    const n10 = grad3[g10] * x1 + grad3[g10 + 1] * y;
    const n11 = grad3[g11] * x1 + grad3[g11 + 1] * y1;

    // Compute the fade curve value for x
    const u = fade(x);

    // Interpolate the four results
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
}
