import type { Vec3 } from '../core/types';

// Adapated from https://github.com/josephg/noisejs
// 
// ```
// A speed-improved perlin and simplex noise algorithms for 2D.
//
// Based on example code by Stefan Gustavson (stegu@itn.liu.se).
// Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
// Better rank ordering method by Stefan Gustavson in 2012.
// Converted to Javascript by Joseph Gentle.
//
// Version 2012-03-09
//
// This code was placed in the public domain by its original author,
// Stefan Gustavson. You may use it as you see fit, but
// attribution is appreciated.
// ```

/**
 * Seeded permutation and gradient tables that back a noise generator.
 *
 * All noise variants (simplex/perlin, 2D/3D) share this same table shape, so
 * each generator type is a structural alias of this.
 */
export type Permutation = { perm: number[]; gradP: Vec3[] };

export const dot2 = (grad: Vec3, x: number, y: number) => grad[0] * x + grad[1] * y;
export const dot3 = (grad: Vec3, x: number, y: number, z: number) => grad[0] * x + grad[1] * y + grad[2] * z;

const grad3: Vec3[] = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
];

const p = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174,
    20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230,
    220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
    200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118,
    126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154,
    163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
    246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
    181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
    141, 128, 195, 78, 66, 215, 61, 156, 180,
];

/**
 * Creates the seeded permutation and gradient tables for a noise generator.
 *
 * @param seed The seed value for the noise generator
 * @returns The permutation tables derived from the seed
 */
export function createPermutation(seed: number): Permutation {
    if (seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
    }

    seed = Math.floor(seed);
    if (seed < 256) {
        seed |= seed << 8;
    }

    // To remove the need for index wrapping, double the permutation table length
    const perm: number[] = new Array(512);
    const gradP: Vec3[] = new Array(512);

    for (let i = 0; i < 256; i++) {
        let v: number;
        if (i & 1) {
            v = p[i] ^ (seed & 255);
        } else {
            v = p[i] ^ ((seed >> 8) & 255);
        }

        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
    }

    return { perm, gradP };
}
