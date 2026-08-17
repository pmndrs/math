import { createPermutation, type Permutation } from './permutation';

/** A seeded 3D Worley (cellular) noise generator. Create one with {@link create}. */
export type Worley3DGenerator = Permutation;

/**
 * Creates a 3D Worley noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Worley3DGenerator {
    return createPermutation(seed);
}

/**
 * Samples 3D Worley (cellular) noise: the Euclidean distance to the nearest of a
 * set of feature points, one scattered per unit cell. Values are roughly in
 * [0, 1] (0 right at a feature point). Threshold a 3D field for cave networks,
 * ore pockets, or volumetric cell structures.
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @returns The distance to the nearest feature point (F1)
 */
export function sample({ perm }: Worley3DGenerator, x: number, y: number, z: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);
    let f1 = Infinity; // squared nearest distance

    // check the point's cell and its 26 neighbours
    for (let gx = -1; gx <= 1; gx++) {
        for (let gy = -1; gy <= 1; gy++) {
            for (let gz = -1; gz <= 1; gz++) {
                const cx = ix + gx;
                const cy = iy + gy;
                const cz = iz + gz;
                // a hashed feature-point offset in [0, 1) per axis, decorrelated
                const base = perm[(cx & 255) + perm[(cy & 255) + perm[cz & 255]]];
                const rx = base / 256;
                const ry = perm[((cx + 71) & 255) + perm[((cy + 37) & 255) + perm[(cz + 13) & 255]]] / 256;
                const rz = perm[((cx + 23) & 255) + perm[((cy + 53) & 255) + perm[(cz + 97) & 255]]] / 256;
                const dx = cx + rx - x;
                const dy = cy + ry - y;
                const dz = cz + rz - z;
                const d2 = dx * dx + dy * dy + dz * dz;
                if (d2 < f1) f1 = d2;
            }
        }
    }

    return Math.sqrt(f1);
}
