import type { Quat, Vec2, Vec3, Vec4 } from '../core/types';
import type { RandomGenerator } from './mulberry32';

/**
 * Writes a random unit-length Vec2 into out.
 * @param random the random generator to use
 * @param out the receiving vector
 * @returns out
 */
export function vec2(random: RandomGenerator, out: Vec2 = [0, 0]): Vec2 {
    const r = random() * 2.0 * Math.PI;
    out[0] = Math.cos(r);
    out[1] = Math.sin(r);
    return out;
}

/**
 * Writes a random unit-length Vec3 into out.
 * @param random the random generator to use
 * @param out the receiving vector
 * @returns out
 */
export function vec3(random: RandomGenerator, out: Vec3 = [0, 0, 0]): Vec3 {
    const r = random() * 2.0 * Math.PI;
    const z = random() * 2.0 - 1.0;
    const zScale = Math.sqrt(1.0 - z * z);

    out[0] = Math.cos(r) * zScale;
    out[1] = Math.sin(r) * zScale;
    out[2] = z;
    return out;
}

/**
 * Writes a random unit-length Vec4 into out.
 * @param random the random generator to use
 * @param out the receiving vector
 * @returns out
 */
export function vec4(random: RandomGenerator, out: Vec4 = [0, 0, 0, 0]): Vec4 {
    // Marsaglia, George. Choosing a Point from the Surface of a
    // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
    // http://projecteuclid.org/euclid.aoms/1177692644;
    let rand = random();
    const v1 = rand * 2 - 1;
    const v2 = (4 * random() - 2) * Math.sqrt(rand * -rand + rand);
    const s1 = v1 * v1 + v2 * v2;

    rand = random();
    const v3 = rand * 2 - 1;
    const v4 = (4 * random() - 2) * Math.sqrt(rand * -rand + rand);
    const s2 = v3 * v3 + v4 * v4;

    const d = Math.sqrt((1 - s1) / s2);
    out[0] = v1;
    out[1] = v2;
    out[2] = v3 * d;
    out[3] = v4 * d;
    return out;
}

/**
 * Writes a random unit quaternion into out.
 * @param random the random generator to use
 * @param out the receiving quaternion
 * @returns out
 */
export function quat(random: RandomGenerator, out: Quat = [0, 0, 0, 0]): Quat {
    // Implementation of http://planning.cs.uiuc.edu/node198.html
    const u1 = random();
    const u2 = random();
    const u3 = random();

    const sqrt1MinusU1 = Math.sqrt(1 - u1);
    const sqrtU1 = Math.sqrt(u1);

    out[0] = sqrt1MinusU1 * Math.sin(2.0 * Math.PI * u2);
    out[1] = sqrt1MinusU1 * Math.cos(2.0 * Math.PI * u2);
    out[2] = sqrtU1 * Math.sin(2.0 * Math.PI * u3);
    out[3] = sqrtU1 * Math.cos(2.0 * Math.PI * u3);
    return out;
}
