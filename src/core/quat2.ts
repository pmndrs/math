import * as common from './common';
import * as mat4 from './mat4';
import * as quat from './quat';
import type { Mat4, Quat, Quat2, Vec3 } from './types';

/**
 * Creates a new identity dual quat
 *
 * @returns a new dual quaternion [real -> rotation, dual -> translation]
 */
export function create(): Quat2 {
    // biome-ignore format:skip
    return [
		0, 0, 0, 1, // real part
		0, 0, 0, 0, // dual part
	];
}

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param a dual quaternion to clone
 * @returns new dual quaternion
 * @function
 */
export function clone(a: Quat2): Quat2 {
    const dq = create();
    dq[0] = a[0];
    dq[1] = a[1];
    dq[2] = a[2];
    dq[3] = a[3];
    dq[4] = a[4];
    dq[5] = a[5];
    dq[6] = a[6];
    dq[7] = a[7];
    return dq;
}

/**
 * Creates a new dual quat initialized with the given values
 *
 * @param x1 X component
 * @param y1 Y component
 * @param z1 Z component
 * @param w1 W component
 * @param x2 X component
 * @param y2 Y component
 * @param z2 Z component
 * @param w2 W component
 * @returns new dual quaternion
 * @function
 */
export function fromValues(
    x1: number,
    y1: number,
    z1: number,
    w1: number,
    x2: number,
    y2: number,
    z2: number,
    w2: number,
): Quat2 {
    const dq = create();
    dq[0] = x1;
    dq[1] = y1;
    dq[2] = z1;
    dq[3] = w1;
    dq[4] = x2;
    dq[5] = y2;
    dq[6] = z2;
    dq[7] = w2;
    return dq;
}

/**
 * Creates a new dual quat from the given values (quat and translation)
 *
 * @param x1 X component
 * @param y1 Y component
 * @param z1 Z component
 * @param w1 W component
 * @param x2 X component (translation)
 * @param y2 Y component (translation)
 * @param z2 Z component (translation)
 * @returns new dual quaternion
 * @function
 */
export function fromRotationTranslationValues(
    x1: number,
    y1: number,
    z1: number,
    w1: number,
    x2: number,
    y2: number,
    z2: number,
): Quat2 {
    const dq = create();
    dq[0] = x1;
    dq[1] = y1;
    dq[2] = z1;
    dq[3] = w1;
    const ax = x2 * 0.5;
    const ay = y2 * 0.5;
    const az = z2 * 0.5;
    dq[4] = ax * w1 + ay * z1 - az * y1;
    dq[5] = ay * w1 + az * x1 - ax * z1;
    dq[6] = az * w1 + ax * y1 - ay * x1;
    dq[7] = -ax * x1 - ay * y1 - az * z1;
    return dq;
}

/**
 * Creates a dual quat from a quaternion and a translation
 *
 * @param out dual quaternion receiving operation result
 * @param q a normalized quaternion
 * @param t translation vector
 * @returns dual quaternion receiving operation result
 * @function
 */
export function fromRotationTranslation(out: Quat2, q: Quat, t: Vec3): Quat2 {
    const ax = t[0] * 0.5;
    const ay = t[1] * 0.5;
    const az = t[2] * 0.5;
    const bx = q[0];
    const by = q[1];
    const bz = q[2];
    const bw = q[3];
    out[0] = bx;
    out[1] = by;
    out[2] = bz;
    out[3] = bw;
    out[4] = ax * bw + ay * bz - az * by;
    out[5] = ay * bw + az * bx - ax * bz;
    out[6] = az * bw + ax * by - ay * bx;
    out[7] = -ax * bx - ay * by - az * bz;
    return out;
}

/**
 * Creates a dual quat from a translation
 *
 * @param out dual quaternion receiving operation result
 * @param t translation vector
 * @returns dual quaternion receiving operation result
 * @function
 */
export function fromTranslation(out: Quat2, t: Vec3): Quat2 {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = t[0] * 0.5;
    out[5] = t[1] * 0.5;
    out[6] = t[2] * 0.5;
    out[7] = 0;
    return out;
}

/**
 * Creates a dual quat from a quaternion
 *
 * @param out dual quaternion receiving operation result
 * @param q the quaternion
 * @returns dual quaternion receiving operation result
 * @function
 */
export function fromRotation(out: Quat2, q: Quat): Quat2 {
    out[0] = q[0];
    out[1] = q[1];
    out[2] = q[2];
    out[3] = q[3];
    out[4] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    return out;
}

/**
 * Creates a new dual quat from a matrix (4x4)
 *
 * @param out the dual quaternion
 * @param a the matrix
 * @returns dual quat receiving operation result
 * @function
 */
export function fromMat4(out: Quat2, a: Mat4): Quat2 {
    //TODO Optimize this
    const outer = quat.create();
    mat4.getRotation(outer, a);
    const t = [0, 0, 0] as Vec3;
    mat4.getTranslation(t, a);
    fromRotationTranslation(out, outer, t);
    return out;
}

/**
 * Copy the values from one dual quat to another
 *
 * @param out the receiving dual quaternion
 * @param a the source dual quaternion
 * @returns out
 * @function
 */
export function copy(out: Quat2, a: Quat2): Quat2 {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    return out;
}

/**
 * Set a dual quat to the identity dual quaternion
 *
 * @param out the receiving quaternion
 * @returns out
 */
export function identity(out: Quat2): Quat2 {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    return out;
}

/**
 * Set the components of a dual quat to the given values
 *
 * @param out the receiving quaternion
 * @param x1 X component
 * @param y1 Y component
 * @param z1 Z component
 * @param w1 W component
 * @param x2 X component
 * @param y2 Y component
 * @param z2 Z component
 * @param w2 W component
 * @returns out
 * @function
 */
export function set(
    out: Quat2,
    x1: number,
    y1: number,
    z1: number,
    w1: number,
    x2: number,
    y2: number,
    z2: number,
    w2: number,
): Quat2 {
    out[0] = x1;
    out[1] = y1;
    out[2] = z1;
    out[3] = w1;

    out[4] = x2;
    out[5] = y2;
    out[6] = z2;
    out[7] = w2;
    return out;
}

/**
 * Gets the real part of a dual quat
 * @param  out real part
 * @param  a Dual Quaternion
 * @return real part
 */
export const getReal = quat.copy;

/**
 * Gets the dual part of a dual quat
 * @param  out dual part
 * @param  a Dual Quaternion
 * @return dual part
 */
export function getDual(out: Quat, a: Quat2): Quat {
    out[0] = a[4];
    out[1] = a[5];
    out[2] = a[6];
    out[3] = a[7];
    return out;
}

/**
 * Set the real component of a dual quat to the given quaternion
 *
 * @param out the receiving quaternion
 * @param q a quaternion representing the real part
 * @returns out
 * @function
 */
export const setReal = quat.copy;

/**
 * Set the dual component of a dual quat to the given quaternion
 *
 * @param out the receiving quaternion
 * @param q a quaternion representing the dual part
 * @returns out
 * @function
 */
export function setDual(out: Quat2, q: Quat): Quat2 {
    out[4] = q[0];
    out[5] = q[1];
    out[6] = q[2];
    out[7] = q[3];
    return out;
}

/**
 * Gets the translation of a normalized dual quat
 * @param  out translation
 * @param  a Dual Quaternion to be decomposed
 * @return translation
 */
export function getTranslation(out: Vec3, a: Quat2): Vec3 {
    const ax = a[4];
    const ay = a[5];
    const az = a[6];
    const aw = a[7];
    const bx = -a[0];
    const by = -a[1];
    const bz = -a[2];
    const bw = a[3];
    out[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    out[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    out[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
    return out;
}

/**
 * Translates a dual quat by the given vector
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to translate
 * @param v vector to translate by
 * @returns out
 */
export function translate(out: Quat2, a: Quat2, v: Vec3): Quat2 {
    const ax1 = a[0];
    const ay1 = a[1];
    const az1 = a[2];
    const aw1 = a[3];
    const bx1 = v[0] * 0.5;
    const by1 = v[1] * 0.5;
    const bz1 = v[2] * 0.5;
    const ax2 = a[4];
    const ay2 = a[5];
    const az2 = a[6];
    const aw2 = a[7];
    out[0] = ax1;
    out[1] = ay1;
    out[2] = az1;
    out[3] = aw1;
    out[4] = aw1 * bx1 + ay1 * bz1 - az1 * by1 + ax2;
    out[5] = aw1 * by1 + az1 * bx1 - ax1 * bz1 + ay2;
    out[6] = aw1 * bz1 + ax1 * by1 - ay1 * bx1 + az2;
    out[7] = -ax1 * bx1 - ay1 * by1 - az1 * bz1 + aw2;
    return out;
}

/**
 * Rotates a dual quat around the X axis
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param rad how far should the rotation be
 * @returns out
 */
export function rotateX(out: Quat2, a: Quat2, rad: number): Quat2 {
    let bx = -a[0];
    let by = -a[1];
    let bz = -a[2];
    let bw = a[3];
    const ax = a[4];
    const ay = a[5];
    const az = a[6];
    const aw = a[7];
    const ax1 = ax * bw + aw * bx + ay * bz - az * by;
    const ay1 = ay * bw + aw * by + az * bx - ax * bz;
    const az1 = az * bw + aw * bz + ax * by - ay * bx;
    const aw1 = aw * bw - ax * bx - ay * by - az * bz;
    quat.rotateX(out as unknown as Quat, a as unknown as Quat, rad);
    bx = out[0];
    by = out[1];
    bz = out[2];
    bw = out[3];
    out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
    out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
    out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
    out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
    return out;
}

/**
 * Rotates a dual quat around the Y axis
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param rad how far should the rotation be
 * @returns out
 */
export function rotateY(out: Quat2, a: Quat2, rad: number): Quat2 {
    let bx = -a[0];
    let by = -a[1];
    let bz = -a[2];
    let bw = a[3];
    const ax = a[4];
    const ay = a[5];
    const az = a[6];
    const aw = a[7];
    const ax1 = ax * bw + aw * bx + ay * bz - az * by;
    const ay1 = ay * bw + aw * by + az * bx - ax * bz;
    const az1 = az * bw + aw * bz + ax * by - ay * bx;
    const aw1 = aw * bw - ax * bx - ay * by - az * bz;
    quat.rotateY(out as unknown as Quat, a as unknown as Quat, rad);
    bx = out[0];
    by = out[1];
    bz = out[2];
    bw = out[3];
    out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
    out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
    out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
    out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
    return out;
}

/**
 * Rotates a dual quat around the Z axis
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param rad how far should the rotation be
 * @returns out
 */
export function rotateZ(out: Quat2, a: Quat2, rad: number): Quat2 {
    let bx = -a[0];
    let by = -a[1];
    let bz = -a[2];
    let bw = a[3];
    const ax = a[4];
    const ay = a[5];
    const az = a[6];
    const aw = a[7];
    const ax1 = ax * bw + aw * bx + ay * bz - az * by;
    const ay1 = ay * bw + aw * by + az * bx - ax * bz;
    const az1 = az * bw + aw * bz + ax * by - ay * bx;
    const aw1 = aw * bw - ax * bx - ay * by - az * bz;
    quat.rotateZ(out as unknown as Quat, a as unknown as Quat, rad);
    bx = out[0];
    by = out[1];
    bz = out[2];
    bw = out[3];
    out[4] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
    out[5] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
    out[6] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
    out[7] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;
    return out;
}

/**
 * Rotates a dual quat by a given quaternion (a * q)
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param q quaternion to rotate by
 * @returns out
 */
export function rotateByQuatAppend(out: Quat2, a: Quat2, q: Quat): Quat2 {
    const qx = q[0];
    const qy = q[1];
    const qz = q[2];
    const qw = q[3];
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    let aw = a[3];

    out[0] = ax * qw + aw * qx + ay * qz - az * qy;
    out[1] = ay * qw + aw * qy + az * qx - ax * qz;
    out[2] = az * qw + aw * qz + ax * qy - ay * qx;
    out[3] = aw * qw - ax * qx - ay * qy - az * qz;
    ax = a[4];
    ay = a[5];
    az = a[6];
    aw = a[7];
    out[4] = ax * qw + aw * qx + ay * qz - az * qy;
    out[5] = ay * qw + aw * qy + az * qx - ax * qz;
    out[6] = az * qw + aw * qz + ax * qy - ay * qx;
    out[7] = aw * qw - ax * qx - ay * qy - az * qz;
    return out;
}

/**
 * Rotates a dual quat by a given quaternion (q * a)
 *
 * @param out the receiving dual quaternion
 * @param q quaternion to rotate by
 * @param a the dual quaternion to rotate
 * @returns out
 */
export function rotateByQuatPrepend(out: Quat2, q: Quat, a: Quat2): Quat2 {
    const qx = q[0];
    const qy = q[1];
    const qz = q[2];
    const qw = q[3];
    let bx = a[0];
    let by = a[1];
    let bz = a[2];
    let bw = a[3];

    out[0] = qx * bw + qw * bx + qy * bz - qz * by;
    out[1] = qy * bw + qw * by + qz * bx - qx * bz;
    out[2] = qz * bw + qw * bz + qx * by - qy * bx;
    out[3] = qw * bw - qx * bx - qy * by - qz * bz;
    bx = a[4];
    by = a[5];
    bz = a[6];
    bw = a[7];
    out[4] = qx * bw + qw * bx + qy * bz - qz * by;
    out[5] = qy * bw + qw * by + qz * bx - qx * bz;
    out[6] = qz * bw + qw * bz + qx * by - qy * bx;
    out[7] = qw * bw - qx * bx - qy * by - qz * bz;
    return out;
}

/**
 * Rotates a dual quat around a given axis. Does the normalisation automatically
 *
 * @param out the receiving dual quaternion
 * @param a the dual quaternion to rotate
 * @param axis the axis to rotate around
 * @param rad how far the rotation should be
 * @returns out
 */
export function rotateAroundAxis(out: Quat2, a: Quat2, axis: Vec3, rad: number): Quat2 {
    //Special case for rad = 0
    if (Math.abs(rad) < common.EPSILON) {
        return copy(out, a);
    }
    const axisLength = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);

    rad = rad * 0.5;
    const s = Math.sin(rad);
    const bx = (s * axis[0]) / axisLength;
    const by = (s * axis[1]) / axisLength;
    const bz = (s * axis[2]) / axisLength;
    const bw = Math.cos(rad);

    const ax1 = a[0];
    const ay1 = a[1];
    const az1 = a[2];
    const aw1 = a[3];
    out[0] = ax1 * bw + aw1 * bx + ay1 * bz - az1 * by;
    out[1] = ay1 * bw + aw1 * by + az1 * bx - ax1 * bz;
    out[2] = az1 * bw + aw1 * bz + ax1 * by - ay1 * bx;
    out[3] = aw1 * bw - ax1 * bx - ay1 * by - az1 * bz;

    const ax = a[4];
    const ay = a[5];
    const az = a[6];
    const aw = a[7];
    out[4] = ax * bw + aw * bx + ay * bz - az * by;
    out[5] = ay * bw + aw * by + az * bx - ax * bz;
    out[6] = az * bw + aw * bz + ax * by - ay * bx;
    out[7] = aw * bw - ax * bx - ay * by - az * bz;

    return out;
}

/**
 * Adds two dual quat's
 *
 * @param out the receiving dual quaternion
 * @param a the first operand
 * @param b the second operand
 * @returns out
 * @function
 */
export function add(out: Quat2, a: Quat2, b: Quat2): Quat2 {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    return out;
}

/**
 * Multiplies two dual quat's
 *
 * @param out the receiving dual quaternion
 * @param a the first operand
 * @param b the second operand
 * @returns out
 */
export function multiply(out: Quat2, a: Quat2, b: Quat2): Quat2 {
    const ax0 = a[0];
    const ay0 = a[1];
    const az0 = a[2];
    const aw0 = a[3];
    const bx1 = b[4];
    const by1 = b[5];
    const bz1 = b[6];
    const bw1 = b[7];
    const ax1 = a[4];
    const ay1 = a[5];
    const az1 = a[6];
    const aw1 = a[7];
    const bx0 = b[0];
    const by0 = b[1];
    const bz0 = b[2];
    const bw0 = b[3];
    out[0] = ax0 * bw0 + aw0 * bx0 + ay0 * bz0 - az0 * by0;
    out[1] = ay0 * bw0 + aw0 * by0 + az0 * bx0 - ax0 * bz0;
    out[2] = az0 * bw0 + aw0 * bz0 + ax0 * by0 - ay0 * bx0;
    out[3] = aw0 * bw0 - ax0 * bx0 - ay0 * by0 - az0 * bz0;
    out[4] = ax0 * bw1 + aw0 * bx1 + ay0 * bz1 - az0 * by1 + ax1 * bw0 + aw1 * bx0 + ay1 * bz0 - az1 * by0;
    out[5] = ay0 * bw1 + aw0 * by1 + az0 * bx1 - ax0 * bz1 + ay1 * bw0 + aw1 * by0 + az1 * bx0 - ax1 * bz0;
    out[6] = az0 * bw1 + aw0 * bz1 + ax0 * by1 - ay0 * bx1 + az1 * bw0 + aw1 * bz0 + ax1 * by0 - ay1 * bx0;
    out[7] = aw0 * bw1 - ax0 * bx1 - ay0 * by1 - az0 * bz1 + aw1 * bw0 - ax1 * bx0 - ay1 * by0 - az1 * bz0;
    return out;
}

/**
 * Alias for {@link quat2.multiply}
 * @function
 */
export const mul = multiply;

/**
 * Scales a dual quat by a scalar number
 *
 * @param out the receiving dual quat
 * @param a the dual quat to scale
 * @param b amount to scale the dual quat by
 * @returns out
 * @function
 */
export function scale(out: Quat2, a: Quat2, b: number): Quat2 {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    return out;
}

/**
 * Calculates the dot product of two dual quat's (The dot product of the real parts)
 *
 * @param a the first operand
 * @param b the second operand
 * @returns dot product of a and b
 * @function
 */
export const dot = quat.dot;

/**
 * Performs a linear interpolation between two dual quats's
 * NOTE: The resulting dual quaternions won't always be normalized (The error is most noticeable when t = 0.5)
 *
 * @param out the receiving dual quat
 * @param a the first operand
 * @param b the second operand
 * @param t interpolation amount, in the range [0-1], between the two inputs
 * @returns out
 */
export function lerp(out: Quat2, a: Quat2, b: Quat2, t: number): Quat2 {
    const mt = 1 - t;
    if (dot(a as unknown as Quat, b as unknown as Quat) < 0) t = -t;

    out[0] = a[0] * mt + b[0] * t;
    out[1] = a[1] * mt + b[1] * t;
    out[2] = a[2] * mt + b[2] * t;
    out[3] = a[3] * mt + b[3] * t;
    out[4] = a[4] * mt + b[4] * t;
    out[5] = a[5] * mt + b[5] * t;
    out[6] = a[6] * mt + b[6] * t;
    out[7] = a[7] * mt + b[7] * t;

    return out;
}

/**
 * Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper
 *
 * @param out the receiving dual quaternion
 * @param a dual quat to calculate inverse of
 * @returns out
 */
export function invert(out: Quat2, a: Quat2): Quat2 {
    const sqlen = squaredLength(a as unknown as Quat);
    out[0] = -a[0] / sqlen;
    out[1] = -a[1] / sqlen;
    out[2] = -a[2] / sqlen;
    out[3] = a[3] / sqlen;
    out[4] = -a[4] / sqlen;
    out[5] = -a[5] / sqlen;
    out[6] = -a[6] / sqlen;
    out[7] = a[7] / sqlen;
    return out;
}

/**
 * Calculates the conjugate of a dual quat
 * If the dual quaternion is normalized, this function is faster than quat2.inverse and produces the same result.
 *
 * @param out the receiving quaternion
 * @param a quat to calculate conjugate of
 * @returns out
 */
export function conjugate(out: Quat2, a: Quat2): Quat2 {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    out[4] = -a[4];
    out[5] = -a[5];
    out[6] = -a[6];
    out[7] = a[7];
    return out;
}

/**
 * Calculates the length of a dual quat
 *
 * @param a dual quat to calculate length of
 * @returns length of a
 * @function
 */
export const length = quat.length;

/**
 * Alias for {@link quat2.length}
 * @function
 */
export const len = length;

/**
 * Calculates the squared length of a dual quat
 *
 * @param a dual quat to calculate squared length of
 * @returns squared length of a
 * @function
 */
export const squaredLength = quat.squaredLength;

/**
 * Alias for {@link quat2.squaredLength}
 * @function
 */
export const sqrLen = squaredLength;

/**
 * Normalize a dual quat
 *
 * @param out the receiving dual quaternion
 * @param a dual quaternion to normalize
 * @returns out
 * @function
 */
export function normalize(out: Quat2, a: Quat2): Quat2 {
    let magnitude = squaredLength(a as unknown as Quat);
    if (magnitude > 0) {
        magnitude = Math.sqrt(magnitude);

        const a0 = a[0] / magnitude;
        const a1 = a[1] / magnitude;
        const a2 = a[2] / magnitude;
        const a3 = a[3] / magnitude;

        const b0 = a[4];
        const b1 = a[5];
        const b2 = a[6];
        const b3 = a[7];

        const a_dot_b = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;

        out[0] = a0;
        out[1] = a1;
        out[2] = a2;
        out[3] = a3;

        out[4] = (b0 - a0 * a_dot_b) / magnitude;
        out[5] = (b1 - a1 * a_dot_b) / magnitude;
        out[6] = (b2 - a2 * a_dot_b) / magnitude;
        out[7] = (b3 - a3 * a_dot_b) / magnitude;
    }
    return out;
}

/**
 * Returns a string representation of a dual quaternion
 *
 * @param a dual quaternion to represent as a string
 * @returns string representation of the dual quat
 */
export function str(a: Quat2): string {
    return `quat2(${a[0]}, ${a[1]}, ${a[2]}, ${a[3]}, ${a[4]}, ${a[5]}, ${a[6]}, ${a[7]})`;
}

/**
 * Returns whether or not the dual quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param a the first dual quaternion.
 * @param b the second dual quaternion.
 * @returns true if the dual quaternions are equal, false otherwise.
 */
export function exactEquals(a: Quat2, b: Quat2): boolean {
    return (
        a[0] === b[0] &&
        a[1] === b[1] &&
        a[2] === b[2] &&
        a[3] === b[3] &&
        a[4] === b[4] &&
        a[5] === b[5] &&
        a[6] === b[6] &&
        a[7] === b[7]
    );
}

/**
 * Returns whether or not the dual quaternions have approximately the same elements in the same position.
 *
 * @param a the first dual quat.
 * @param b the second dual quat.
 * @returns true if the dual quats are equal, false otherwise.
 */
export function equals(a: Quat2, b: Quat2): boolean {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const a3 = a[3];
    const a4 = a[4];
    const a5 = a[5];
    const a6 = a[6];
    const a7 = a[7];
    const b0 = b[0];
    const b1 = b[1];
    const b2 = b[2];
    const b3 = b[3];
    const b4 = b[4];
    const b5 = b[5];
    const b6 = b[6];
    const b7 = b[7];
    return (
        Math.abs(a0 - b0) <= common.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= common.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= common.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
        Math.abs(a3 - b3) <= common.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
        Math.abs(a4 - b4) <= common.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
        Math.abs(a5 - b5) <= common.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
        Math.abs(a6 - b6) <= common.EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
        Math.abs(a7 - b7) <= common.EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7))
    );
}
