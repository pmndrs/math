import type { Vec2 } from '../core/vec2';
import type { Vec3 } from '../core/vec3';

// Fractal combinators: helpers that layer octaves of ANY base noise source into
// the richer fields used for terrain, clouds, and marble. They are generic - the
// `sample` callback receives the current octave's frequency and returns the base
// noise at your coordinates scaled by it, so the same helper works with any
// generator at any dimension:
//
//   fbm((f) => simplex2d.sample(gen, x * f, y * f), { octaves: 5 })
//   fbm((f) => simplex3d.sample(gen, x * f, y * f, z * f))

/** Options for the fractal (multi-octave) noise helpers. */
export type FractalOptions = {
    /** number of octaves to sum (default 4) */
    octaves?: number;
    /** frequency of the first octave (default 1) */
    frequency?: number;
    /** frequency multiplier between octaves (default 2) */
    lacunarity?: number;
    /** amplitude multiplier between octaves (default 0.5) */
    gain?: number;
};

/**
 * Fractional Brownian motion: sums octaves of a noise source at increasing
 * frequency and decreasing amplitude - the workhorse for natural-looking
 * heightmaps and clouds. Given a source in [-1, 1], returns a value in [-1, 1].
 *
 * @param sample receives an octave frequency, returns the base noise scaled by it
 * @param options octave count and per-octave frequency/amplitude falloff
 * @returns the summed, normalized noise value
 */
export function fbm(sample: (frequency: number) => number, options?: FractalOptions): number {
    const octaves = options?.octaves ?? 4;
    const lacunarity = options?.lacunarity ?? 2;
    const gain = options?.gain ?? 0.5;
    let frequency = options?.frequency ?? 1;
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
 * @param options octave count and per-octave frequency/amplitude falloff
 * @returns the summed, normalized ridged value
 */
export function ridged(sample: (frequency: number) => number, options?: FractalOptions): number {
    const octaves = options?.octaves ?? 4;
    const lacunarity = options?.lacunarity ?? 2;
    const gain = options?.gain ?? 0.5;
    let frequency = options?.frequency ?? 1;
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
 * @param options octave count and per-octave frequency/amplitude falloff
 * @returns the summed, normalized billow value
 */
export function billow(sample: (frequency: number) => number, options?: FractalOptions): number {
    const octaves = options?.octaves ?? 4;
    const lacunarity = options?.lacunarity ?? 2;
    const gain = options?.gain ?? 0.5;
    let frequency = options?.frequency ?? 1;
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
