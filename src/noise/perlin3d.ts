import { fade, lerp } from '../core/scalar';
import { createPermutation, dot3, type Permutation } from './permutation';

/** A seeded 3D Perlin noise generator. Create one with {@link create}. */
export type Perlin3DGenerator = Permutation;

/**
 * Creates a 3D Perlin noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Perlin3DGenerator {
    return createPermutation(seed);
}

/**
 * Samples 3D Perlin noise.
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @returns The noise value at (x, y, z)
 */
export function sample({ perm, gradP }: Perlin3DGenerator, x: number, y: number, z: number): number {
    // Find unit grid cell containing point
    let X = Math.floor(x);
    let Y = Math.floor(y);
    let Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X;
    y = y - Y;
    z = z - Z;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;

    // Calculate noise contributions from each of the eight corners
    const n000 = dot3(gradP[X + perm[Y + perm[Z]]], x, y, z);
    const n001 = dot3(gradP[X + perm[Y + perm[Z + 1]]], x, y, z - 1);
    const n010 = dot3(gradP[X + perm[Y + 1 + perm[Z]]], x, y - 1, z);
    const n011 = dot3(gradP[X + perm[Y + 1 + perm[Z + 1]]], x, y - 1, z - 1);
    const n100 = dot3(gradP[X + 1 + perm[Y + perm[Z]]], x - 1, y, z);
    const n101 = dot3(gradP[X + 1 + perm[Y + perm[Z + 1]]], x - 1, y, z - 1);
    const n110 = dot3(gradP[X + 1 + perm[Y + 1 + perm[Z]]], x - 1, y - 1, z);
    const n111 = dot3(gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]], x - 1, y - 1, z - 1);

    // Compute the fade curve value for x, y, z
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    // Interpolate
    return lerp(lerp(lerp(n000, n100, u), lerp(n001, n101, u), w), lerp(lerp(n010, n110, u), lerp(n011, n111, u), w), v);
}
