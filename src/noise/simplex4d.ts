import { createPermutation, type Permutation } from './permutation';

/** A seeded 4D simplex noise generator. Create one with {@link create}. */
export type Simplex4DGenerator = Permutation;

// Skewing and unskewing factors for 4 dimensions
const F4 = (Math.sqrt(5) - 1) / 4;
const G4 = (5 - Math.sqrt(5)) / 20;

/**
 * Creates a 4D simplex noise generator with the given seed.
 *
 * @param seed The seed value for the noise generator
 * @returns A generator to pass to {@link sample}
 */
export function create(seed: number): Simplex4DGenerator {
    return createPermutation(seed);
}

/**
 * Samples 4D simplex noise, returning a value in the interval [-1, 1].
 *
 * The fourth axis is commonly used as time (for animated 3D noise) or as a wrap
 * dimension (map a coordinate around a circle in w for seamless looping).
 *
 * @param generator A generator created with {@link create}
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param w W coordinate
 * @returns The noise value at (x, y, z, w)
 */
export function sample({ perm, grad4 }: Simplex4DGenerator, x: number, y: number, z: number, w: number): number {
    // Skew the input space to determine which simplex cell we're in
    const s = (x + y + z + w) * F4; // Factor for 4D skewing
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const l = Math.floor(w + s);

    const t = (i + j + k + l) * G4; // Factor for 4D unskewing
    const x0 = x - (i - t); // The x,y,z,w distances from the cell origin, unskewed
    const y0 = y - (j - t);
    const z0 = z - (k - t);
    const w0 = w - (l - t);

    // For the 4D case, the simplex is a 5-cell (4-simplex). Rank the coordinates
    // to work out the traversal order of the four middle corners: the largest
    // coordinate steps first, then the next, and so on (Gustavson's rank method).
    let rankx = 0;
    let ranky = 0;
    let rankz = 0;
    let rankw = 0;
    if (x0 > y0) rankx++;
    else ranky++;
    if (x0 > z0) rankx++;
    else rankz++;
    if (x0 > w0) rankx++;
    else rankw++;
    if (y0 > z0) ranky++;
    else rankz++;
    if (y0 > w0) ranky++;
    else rankw++;
    if (z0 > w0) rankz++;
    else rankw++;

    // rank 3 is the largest coordinate, so it gets the +1 first, and so on.
    const i1 = rankx >= 3 ? 1 : 0;
    const j1 = ranky >= 3 ? 1 : 0;
    const k1 = rankz >= 3 ? 1 : 0;
    const l1 = rankw >= 3 ? 1 : 0;

    const i2 = rankx >= 2 ? 1 : 0;
    const j2 = ranky >= 2 ? 1 : 0;
    const k2 = rankz >= 2 ? 1 : 0;
    const l2 = rankw >= 2 ? 1 : 0;

    const i3 = rankx >= 1 ? 1 : 0;
    const j3 = ranky >= 1 ? 1 : 0;
    const k3 = rankz >= 1 ? 1 : 0;
    const l3 = rankw >= 1 ? 1 : 0;

    // Offsets for the remaining corners, unskewed (subtract the step, add G4 per step)
    const x1 = x0 - i1 + G4;
    const y1 = y0 - j1 + G4;
    const z1 = z0 - k1 + G4;
    const w1 = w0 - l1 + G4;

    const x2 = x0 - i2 + 2 * G4;
    const y2 = y0 - j2 + 2 * G4;
    const z2 = z0 - k2 + 2 * G4;
    const w2 = w0 - l2 + 2 * G4;

    const x3 = x0 - i3 + 3 * G4;
    const y3 = y0 - j3 + 3 * G4;
    const z3 = z0 - k3 + 3 * G4;
    const w3 = w0 - l3 + 3 * G4;

    const x4 = x0 - 1 + 4 * G4;
    const y4 = y0 - 1 + 4 * G4;
    const z4 = z0 - 1 + 4 * G4;
    const w4 = w0 - 1 + 4 * G4;

    // Work out the hashed gradient indices of the five simplex corners
    // (flat xyzw quads in grad4)
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const ll = l & 255;
    const g0 = (ii + perm[jj + perm[kk + perm[ll]]]) * 4;
    const g1 = (ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]) * 4;
    const g2 = (ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]) * 4;
    const g3 = (ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]) * 4;
    const g4 = (ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]) * 4;

    // Calculate the contribution from the five corners
    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    let n3 = 0;
    let n4 = 0;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    if (t0 >= 0) {
        t0 *= t0;
        n0 = t0 * t0 * (grad4[g0] * x0 + grad4[g0 + 1] * y0 + grad4[g0 + 2] * z0 + grad4[g0 + 3] * w0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    if (t1 >= 0) {
        t1 *= t1;
        n1 = t1 * t1 * (grad4[g1] * x1 + grad4[g1 + 1] * y1 + grad4[g1 + 2] * z1 + grad4[g1 + 3] * w1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    if (t2 >= 0) {
        t2 *= t2;
        n2 = t2 * t2 * (grad4[g2] * x2 + grad4[g2 + 1] * y2 + grad4[g2 + 2] * z2 + grad4[g2 + 3] * w2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    if (t3 >= 0) {
        t3 *= t3;
        n3 = t3 * t3 * (grad4[g3] * x3 + grad4[g3 + 1] * y3 + grad4[g3 + 2] * z3 + grad4[g3 + 3] * w3);
    }
    let t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    if (t4 >= 0) {
        t4 *= t4;
        n4 = t4 * t4 * (grad4[g4] * x4 + grad4[g4 + 1] * y4 + grad4[g4 + 2] * z4 + grad4[g4 + 3] * w4);
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1, 1].
    return 27 * (n0 + n1 + n2 + n3 + n4);
}
