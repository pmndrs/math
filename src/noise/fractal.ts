import type { Vec2 } from '../core/vec2';
import type { Vec3 } from '../core/vec3';

// Fractal combinators: helpers that layer octaves of ANY base noise source into
// the richer fields used for terrain, clouds, and marble. They are generic - the
// `sample` callback receives the current octave's frequency and returns the base
// noise at your coordinates scaled by it, so the same helper works with any
// generator at any dimension:
//
//   fbm((f) => simplex2d.sample(gen, x * f, y * f), 5, 2, 0.5)
//   fbm((f) => simplex3d.sample(gen, x * f, y * f, z * f), 5, 2, 0.5)

/**
 * Fractional Brownian motion: sums octaves of a noise source at increasing
 * frequency and decreasing amplitude - the workhorse for natural-looking
 * heightmaps and clouds. Given a source in [-1, 1], returns a value in [-1, 1].
 *
 * @param sample receives an octave frequency, returns the base noise scaled by it
 * @param octaves number of octaves to sum
 * @param lacunarity frequency multiplier between octaves
 * @param gain amplitude multiplier between octaves
 * @returns the summed, normalized noise value
 */
export function fbm(sample: (frequency: number) => number, octaves: number, lacunarity: number, gain: number): number {
    let frequency = 1;
    let amplitude = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
        sum += amplitude * sample(frequency);
        norm += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
    return norm === 0 ? 0 : sum / norm;
}

/**
 * Ridged multifractal: like {@link fbm}, but each octave is folded to
 * `1 - abs(noise)`, filling the field with sharp ridges - the classic mountain
 * range / canyon look. Given a source in [-1, 1], returns a value in [0, 1].
 *
 * @param sample receives an octave frequency, returns the base noise scaled by it
 * @param octaves number of octaves to sum
 * @param lacunarity frequency multiplier between octaves
 * @param gain amplitude multiplier between octaves
 * @returns the summed, normalized ridged value
 */
export function ridged(
    sample: (frequency: number) => number,
    octaves: number,
    lacunarity: number,
    gain: number,
): number {
    let frequency = 1;
    let amplitude = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
        sum += amplitude * (1 - Math.abs(sample(frequency)));
        norm += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
    return norm === 0 ? 0 : sum / norm;
}

/**
 * Billow noise: like {@link fbm}, but each octave is folded to `2*abs(noise) - 1`,
 * giving puffy, rounded, cloud-like lobes. Given a source in [-1, 1], returns a
 * value in [-1, 1].
 *
 * @param sample receives an octave frequency, returns the base noise scaled by it
 * @param octaves number of octaves to sum
 * @param lacunarity frequency multiplier between octaves
 * @param gain amplitude multiplier between octaves
 * @returns the summed, normalized billow value
 */
export function billow(
    sample: (frequency: number) => number,
    octaves: number,
    lacunarity: number,
    gain: number,
): number {
    let frequency = 1;
    let amplitude = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
        sum += amplitude * (2 * Math.abs(sample(frequency)) - 1);
        norm += amplitude;
        frequency *= lacunarity;
        amplitude *= gain;
    }
    return norm === 0 ? 0 : sum / norm;
}

/**
 * Domain warping (2D): offsets a point by a noise-derived vector, so feeding the
 * result back into a noise source bends and swirls it - marble, meandering
 * terrain, organic distortion. The two axes sample the warp noise at
 * decorrelated offsets so they don't move in lockstep.
 *
 * @param out the receiving Vec2 (the warped point)
 * @param sample the warp noise source, sampled at (x, y)
 * @param x x coordinate
 * @param y y coordinate
 * @param amount displacement scale (default 1)
 * @returns out
 */
export function domainWarp2(out: Vec2, sample: (x: number, y: number) => number, x: number, y: number, amount = 1): Vec2 {
    out[0] = x + amount * sample(x, y);
    out[1] = y + amount * sample(x + 5.2, y + 1.3);
    return out;
}

/**
 * Domain warping (3D): offsets a point by a noise-derived vector so a noise
 * source sampled at the result is bent and swirled. See {@link domainWarp2}.
 *
 * @param out the receiving Vec3 (the warped point)
 * @param sample the warp noise source, sampled at (x, y, z)
 * @param x x coordinate
 * @param y y coordinate
 * @param z z coordinate
 * @param amount displacement scale (default 1)
 * @returns out
 */
export function domainWarp3(
    out: Vec3,
    sample: (x: number, y: number, z: number) => number,
    x: number,
    y: number,
    z: number,
    amount = 1,
): Vec3 {
    out[0] = x + amount * sample(x, y, z);
    out[1] = y + amount * sample(x + 5.2, y + 1.3, z + 2.8);
    out[2] = z + amount * sample(x + 1.7, y + 9.2, z + 3.5);
    return out;
}

/**
 * Curl of a 2D scalar noise potential - a divergence-free (incompressible) flow
 * field. Particles advected through it swirl like a fluid and never converge to
 * sinks or fly apart, which is why it's the cheap go-to for procedural smoke /
 * flow. Given a scalar potential psi(x, y), the flow is (d psi/dy, -d psi/dx),
 * with the derivatives taken by central differences of step `eps`.
 *
 * @param out the receiving Vec2 (the flow velocity)
 * @param sample the scalar potential noise, sampled at (x, y)
 * @param x x coordinate
 * @param y y coordinate
 * @param eps finite-difference step (default 1e-4)
 * @returns out
 */
export function curl2(out: Vec2, sample: (x: number, y: number) => number, x: number, y: number, eps = 1e-4): Vec2 {
    const inv = 1 / (2 * eps);
    const dpdx = (sample(x + eps, y) - sample(x - eps, y)) * inv;
    const dpdy = (sample(x, y + eps) - sample(x, y - eps)) * inv;
    out[0] = dpdy;
    out[1] = -dpdx;
    return out;
}

// large, arbitrary offsets that decorrelate the three potential components in curl3
const C3_O2X = 123.4;
const C3_O2Y = 55.7;
const C3_O2Z = -19.2;
const C3_O3X = -73.1;
const C3_O3Y = 218.9;
const C3_O3Z = 90.3;

/**
 * Curl of a 3D noise vector potential - a divergence-free 3D flow field for
 * volumetric smoke / fluid motion. The three potential components reuse a single
 * `sample` at large, decorrelating offsets, and the flow is their curl,
 * `∇ × psi`, with derivatives taken by central differences of step `eps`.
 *
 * @param out the receiving Vec3 (the flow velocity)
 * @param sample the scalar potential noise, sampled at (x, y, z)
 * @param x x coordinate
 * @param y y coordinate
 * @param z z coordinate
 * @param eps finite-difference step (default 1e-4)
 * @returns out
 */
export function curl3(
    out: Vec3,
    sample: (x: number, y: number, z: number) => number,
    x: number,
    y: number,
    z: number,
    eps = 1e-4,
): Vec3 {
    const inv = 1 / (2 * eps);

    // potential 1 at (x, y, z): partials in y and z
    const dp1dy = (sample(x, y + eps, z) - sample(x, y - eps, z)) * inv;
    const dp1dz = (sample(x, y, z + eps) - sample(x, y, z - eps)) * inv;

    // potential 2 at the +O2 offset: partials in x and z
    const x2 = x + C3_O2X;
    const y2 = y + C3_O2Y;
    const z2 = z + C3_O2Z;
    const dp2dx = (sample(x2 + eps, y2, z2) - sample(x2 - eps, y2, z2)) * inv;
    const dp2dz = (sample(x2, y2, z2 + eps) - sample(x2, y2, z2 - eps)) * inv;

    // potential 3 at the +O3 offset: partials in x and y
    const x3 = x + C3_O3X;
    const y3 = y + C3_O3Y;
    const z3 = z + C3_O3Z;
    const dp3dx = (sample(x3 + eps, y3, z3) - sample(x3 - eps, y3, z3)) * inv;
    const dp3dy = (sample(x3, y3 + eps, z3) - sample(x3, y3 - eps, z3)) * inv;

    // curl = ( dp3/dy - dp2/dz, dp1/dz - dp3/dx, dp2/dx - dp1/dy )
    out[0] = dp3dy - dp2dz;
    out[1] = dp1dz - dp3dx;
    out[2] = dp2dx - dp1dy;
    return out;
}
