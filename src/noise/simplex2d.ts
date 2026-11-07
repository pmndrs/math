import { createPermutation, type Permutation } from './permutation';

/** A seeded 2D simplex noise generator. Create one with {@link create}. */
export type Simplex2DGenerator = Permutation;

// skewing and unskewing factors for 2 dimensions
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/**
 * Creates a 2D simplex noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Simplex2DGenerator {
    return createPermutation(seed);
}

/**
 * Samples 2D simplex noise, returning a value in the interval [-1, 1].
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @returns The noise value at (x, y)
 */
export function sample({ perm, grad3 }: Simplex2DGenerator, x: number, y: number): number {
    // Skew the input space to determine which simplex cell we're in
    const s = (x + y) * F2; // Hairy factor for 2D
    let i = Math.floor(x + s);
    let j = Math.floor(y + s);
    const t = (i + j) * G2;
    const x0 = x - i + t; // The x,y distances from the cell origin, unskewed.
    const y0 = y - j + t;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    let i1: number;
    let j1: number; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
        // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        i1 = 1;
        j1 = 0;
    } else {
        // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        i1 = 0;
        j1 = 1;
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
    const y2 = y0 - 1 + 2 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    // (flat xyz triples in grad3; only x and y are used for 2D)
    i &= 255;
    j &= 255;
    const gi0 = (i + perm[j]) * 3;
    const gi1 = (i + i1 + perm[j + j1]) * 3;
    const gi2 = (i + 1 + perm[j + 1]) * 3;
    // Scale the three corner contributions to the interval [-1, 1].
    return 70 * (contribution(grad3, gi0, x0, y0) + contribution(grad3, gi1, x1, y1) + contribution(grad3, gi2, x2, y2));
}

/** Computes one corner's gradient contribution with radial attenuation. */
function contribution(grad3: Float64Array, index: number, x: number, y: number): number {
    let t = 0.5 - x * x - y * y;
    if (t >= 0) {
        t *= t;
        return t * t * (grad3[index] * x + grad3[index + 1] * y);
    }
    return 0;
}
