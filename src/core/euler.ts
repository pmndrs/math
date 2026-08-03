import { clamp, EPSILON } from './common';
import * as mat4 from './mat4';
import * as quat from './quat';
import type { Euler, EulerOrder, Mat4, Quat } from './types';

/**
 * Creates a new Euler with default values (0, 0, 0, 'xyz').
 */
export function create(): Euler {
    return [0, 0, 0, 'xyz'];
}

/**
 * Creates a new Euler from the given values.
 * @param x The x rotation in radians.
 * @param y The y rotation in radians.
 * @param z The z rotation in radians.
 * @param order The order of rotation.
 * @returns A new Euler.
 */
export function fromValues(x: number, y: number, z: number, order: EulerOrder): Euler {
    return [x, y, z, order];
}

/**
 * Sets a given Euler from the given values.
 * @param x The x rotation in radians.
 * @param y The y rotation in radians.
 * @param z The z rotation in radians.
 * @param order The order of rotation.
 * @returns The output Euler.
 */
export function set(out: Euler, x: number, y: number, z: number, order: EulerOrder): Euler {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = order;
    return out;
}

/**
 * Sets Euler angle radians from given degrees
 * @param out The output Euler.
 * @param x The x rotation in degrees.
 * @param y The y rotation in degrees.
 * @param z The z rotation in degrees.
 * @param order The order of rotation.
 * @returns The output Euler.
 */
export function fromDegrees(out: Euler, x: number, y: number, z: number, order: EulerOrder): Euler {
    out[0] = (x * Math.PI) / 180;
    out[1] = (y * Math.PI) / 180;
    out[2] = (z * Math.PI) / 180;
    out[3] = order;

    return out;
}

/**
 * Sets the Euler angles from a rotation matrix.
 * @param out The output Euler.
 * @param rotationMatrix The input rotation matrix.
 * @param order The order of the Euler angles.
 * @returns The output Euler.
 */
export function fromRotationMat4(out: Euler, rotationMatrix: Mat4, order: EulerOrder = out[3] || 'xyz'): Euler {
    const m11 = rotationMatrix[0];
    const m12 = rotationMatrix[4];
    const m13 = rotationMatrix[8];
    const m21 = rotationMatrix[1];
    const m22 = rotationMatrix[5];
    const m23 = rotationMatrix[9];
    const m31 = rotationMatrix[2];
    const m32 = rotationMatrix[6];
    const m33 = rotationMatrix[10];

    switch (order) {
        case 'xyz':
            out[1] = Math.asin(clamp(m13, -1, 1));

            if (Math.abs(m13) < 0.9999999) {
                out[0] = Math.atan2(-m23, m33);
                out[2] = Math.atan2(-m12, m11);
            } else {
                out[0] = Math.atan2(m32, m22);
                out[2] = 0;
            }

            break;

        case 'yxz':
            out[0] = Math.asin(-clamp(m23, -1, 1));

            if (Math.abs(m23) < 0.9999999) {
                out[1] = Math.atan2(m13, m33);
                out[2] = Math.atan2(m21, m22);
            } else {
                out[1] = Math.atan2(-m31, m11);
                out[2] = 0;
            }

            break;

        case 'zxy':
            out[0] = Math.asin(clamp(m32, -1, 1));

            if (Math.abs(m32) < 0.9999999) {
                out[1] = Math.atan2(-m31, m33);
                out[2] = Math.atan2(-m12, m22);
            } else {
                out[1] = 0;
                out[2] = Math.atan2(m21, m11);
            }

            break;

        case 'zyx':
            out[1] = Math.asin(-clamp(m31, -1, 1));

            if (Math.abs(m31) < 0.9999999) {
                out[0] = Math.atan2(m32, m33);
                out[2] = Math.atan2(m21, m11);
            } else {
                out[0] = 0;
                out[2] = Math.atan2(-m12, m22);
            }

            break;

        case 'yzx':
            out[2] = Math.asin(clamp(m21, -1, 1));

            if (Math.abs(m21) < 0.9999999) {
                out[0] = Math.atan2(-m23, m22);
                out[1] = Math.atan2(-m31, m11);
            } else {
                out[0] = 0;
                out[1] = Math.atan2(m13, m33);
            }

            break;

        case 'xzy':
            out[2] = Math.asin(-clamp(m12, -1, 1));

            if (Math.abs(m12) < 0.9999999) {
                out[0] = Math.atan2(m32, m22);
                out[1] = Math.atan2(m13, m11);
            } else {
                out[0] = Math.atan2(-m23, m33);
                out[1] = 0;
            }

            break;

        default:
            console.warn(`encountered an unknown order: ${order}`);
    }

    out[3] = order;

    return out;
}

/**
 * Returns whether or not the euler angles have exactly the same elements in the same position (when compared with ===)
 *
 * @param a The first euler.
 * @param b The second euler.
 * @returns True if the euler angles are equal, false otherwise.
 */
export function exactEquals(a: Euler, b: Euler): boolean {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/**
 * Returns whether or not the euler angles have approximately the same elements in the same position.
 *
 * @param a The first euler.
 * @param b The second euler.
 * @returns True if the euler angles are equal, false otherwise.
 */
export function equals(a: Euler, b: Euler): boolean {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const b0 = b[0];
    const b1 = b[1];
    const b2 = b[2];
    return (
        Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
        a[3] === b[3]
    );
}

const _setFromQuaternionRotationMatrix = /*@__PURE__*/ mat4.create();

/**
 * Sets the Euler angles from a quaternion.
 * @param out The output Euler.
 * @param q The input quaternion.
 * @param order The order of the Euler.
 * @returns The output Euler
 */
export function fromQuat(out: Euler, q: Quat, order: EulerOrder): Euler {
    mat4.fromQuat(_setFromQuaternionRotationMatrix, q);
    return fromRotationMat4(out, _setFromQuaternionRotationMatrix, order);
}

const _reorderQuaternion = /*@__PURE__*/ quat.create();

/**
 * Reorders the Euler based on the specified order.
 * @param out The output Euler.
 * @param a The input Euler.
 * @param order The order of the Euler.
 * @returns The output Euler.
 */
export function reorder(out: Euler, a: Euler, order: EulerOrder): Euler {
    quat.fromEuler(_reorderQuaternion, a);
    fromQuat(out, _reorderQuaternion, order);
    return out;
}
