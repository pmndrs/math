export const EPSILON = 0.000001;

/**
 * Symmetric round
 * see https://www.npmjs.com/package/round-half-up-symmetric#user-content-detailed-background
 *
 * @param a value to round
 */
export function round(a: number): number {
    if (a >= 0) return Math.round(a);

    return a % 0.5 === 0 ? Math.floor(a) : Math.round(a);
}

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param a The first number to test.
 * @param b The second number to test.
 * @returns True if the numbers are approximately equal, false otherwise.
 */
export function equals(a: number, b: number, epsilon = EPSILON): boolean {
    return Math.abs(a - b) <= epsilon * Math.max(1.0, Math.abs(a), Math.abs(b));
}

/**
 * Ease-in-out, goes to -Infinite before 0 and Infinite after 1
 *
 * https://www.desmos.com/calculator/vsnmlaljdu
 *
 * @param t
 * @returns
 */
export function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 *
 * Returns the result of linearly interpolating between input A and input B by input T.
 *
 * @param v0
 * @param v1
 * @param t
 * @returns
 */
export function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t;
}

/**
 *
 * Quadratic interpolation through three values using Lagrange interpolation.
 * Passes through v0 at t=0, v1 at t=0.5, and v2 at t=1.
 *
 * @param v0 value at t=0
 * @param v1 value at t=0.5
 * @param v2 value at t=1
 * @param t
 * @returns
 */
export function lagrange(v0: number, v1: number, v2: number, t: number) {
    return 2 * (t - 1) * (t - 0.5) * v0 - 4 * (t - 1) * t * v1 + 2 * (t - 0.5) * t * v2;
}

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

/**
 * Loops `t` so that it is never larger than `length` and never smaller than 0.
 */
export function repeat(t: number, length: number): number {
    return clamp(t - Math.floor(t / length) * length, 0, length);
}

/**
 * Remaps a number from one range to another.
 */
export function remap(number: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number {
    const scale = (number - inLow) / (inHigh - inLow);
    return outLow + scale * (outHigh - outLow);
}

/**
 * Remaps a number from one range to another, clamping the result to the output range.
 */
export function remapClamp(value: number, inLow: number, inHigh: number, outLow: number, outHigh: number): number {
    const scale = (value - inLow) / (inHigh - inLow);
    const remapped = outLow + scale * (outHigh - outLow);
    return Math.max(outLow, Math.min(outHigh, remapped));
}
