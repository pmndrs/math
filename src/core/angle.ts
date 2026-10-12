const TAU = Math.PI * 2;

export const DEGREES_TO_RADIANS = Math.PI / 180;

export const RADIANS_TO_DEGREES = 180 / Math.PI;

/**
 * Converts Degrees To Radians
 *
 * @param a Angle in Degrees
 */
export function degreesToRadians(degrees: number): number {
    return degrees * DEGREES_TO_RADIANS;
}

/**
 * Converts Radians To Degrees
 *
 * @param a Angle in Radians
 */
export function radiansToDegrees(radians: number): number {
    return radians * RADIANS_TO_DEGREES;
}

/**
 * Wraps an angle (in radians) into the range [-π, π).
 *
 * An angle already inside the range is returned unchanged, bit for bit.
 *
 * This is a fast specialisation of `wrap(a, -π, π)`. It drifts from it by roughly
 * one ulp per turn wrapped, and past about 1e15 radians the quotient loses the
 * angle entirely and the result folds to -π. Use `wrap` when the result matters
 * more than the speed.
 *
 * @param a the angle to wrap
 * @returns the angle wrapped into [-π, π)
 */
export function wrapAngle(a: number): number {
    const wrapped = a - TAU * Math.floor((a + Math.PI) / TAU);
    if (wrapped >= Math.PI || wrapped <= -Math.PI) return a >= -Math.PI && a < Math.PI ? a : -Math.PI;
    return wrapped;
}

/**
 * Calculates the shortest signed difference between two angles (in radians).
 *
 * Closed at the positive end, unlike `wrapAngle`, so a half turn apart reads as +π.
 *
 * @param current the current angle
 * @param target the target angle
 * @returns the shortest signed difference in (-π, π]
 */
export function deltaAngle(current: number, target: number): number {
    const diff = target - current;
    const delta = diff - TAU * Math.floor(diff / TAU);
    return delta > Math.PI ? delta - TAU : delta;
}
