import { fade, lerp } from '../core/scalar';
import { createPermutation, type Permutation } from './permutation';

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
export function sample({ perm, grad3 }: Perlin3DGenerator, x: number, y: number, z: number): number {
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

    const x1 = x - 1;
    const y1 = y - 1;
    const z1 = z - 1;

    // Hash the Z and Y rows once; each corner then only needs one more lookup
    const pz0 = perm[Z];
    const pz1 = perm[Z + 1];
    const py00 = perm[Y + pz0];
    const py01 = perm[Y + pz1];
    const py10 = perm[Y + 1 + pz0];
    const py11 = perm[Y + 1 + pz1];

    // Hashed gradient indices of the eight corners (flat xyz triples in grad3)
    const g000 = (X + py00) * 3;
    const g001 = (X + py01) * 3;
    const g010 = (X + py10) * 3;
    const g011 = (X + py11) * 3;
    const g100 = (X + 1 + py00) * 3;
    const g101 = (X + 1 + py01) * 3;
    const g110 = (X + 1 + py10) * 3;
    const g111 = (X + 1 + py11) * 3;

    // Calculate noise contributions from each of the eight corners
    const n000 = grad3[g000] * x + grad3[g000 + 1] * y + grad3[g000 + 2] * z;
    const n001 = grad3[g001] * x + grad3[g001 + 1] * y + grad3[g001 + 2] * z1;
    const n010 = grad3[g010] * x + grad3[g010 + 1] * y1 + grad3[g010 + 2] * z;
    const n011 = grad3[g011] * x + grad3[g011 + 1] * y1 + grad3[g011 + 2] * z1;
    const n100 = grad3[g100] * x1 + grad3[g100 + 1] * y + grad3[g100 + 2] * z;
    const n101 = grad3[g101] * x1 + grad3[g101 + 1] * y + grad3[g101 + 2] * z1;
    const n110 = grad3[g110] * x1 + grad3[g110 + 1] * y1 + grad3[g110 + 2] * z;
    const n111 = grad3[g111] * x1 + grad3[g111 + 1] * y1 + grad3[g111 + 2] * z1;

    // Compute the fade curve value for x, y, z
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    // Interpolate
    return lerp(lerp(lerp(n000, n100, u), lerp(n001, n101, u), w), lerp(lerp(n010, n110, u), lerp(n011, n111, u), w), v);
}
