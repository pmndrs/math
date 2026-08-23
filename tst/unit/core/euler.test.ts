import { describe, expect, it } from 'vitest';
import type { Euler, EulerOrder, Quat } from '../../../src';
import { euler, mat4, quat } from '../../../src';
import * as mulberry32 from '../../../src/random/mulberry32';

const ORDERS: EulerOrder[] = ['xyz', 'xzy', 'yxz', 'yzx', 'zxy', 'zyx'];

// The axis whose ±90° rotation drives each order into its gimbal-lock (degenerate) branch,
// i.e. the axis of the middle rotation that gates the asin() singularity for that order.
const SINGULAR_AXIS: Record<EulerOrder, [number, number, number]> = {
    xyz: [0, 1, 0],
    zyx: [0, 1, 0],
    yxz: [1, 0, 0],
    zxy: [1, 0, 0],
    yzx: [0, 0, 1],
    xzy: [0, 0, 1],
};

/** A deterministic, uniformly-distributed random unit quaternion. */
function randomQuat(rand: mulberry32.Mulberry32): Quat {
    const ax = mulberry32.sample(rand) * 2 - 1;
    const ay = mulberry32.sample(rand) * 2 - 1;
    const az = mulberry32.sample(rand) * 2 - 1;
    const len = Math.hypot(ax, ay, az) || 1;
    const angle = mulberry32.sample(rand) * Math.PI * 2;
    return quat.setAxisAngle(quat.create(), [ax / len, ay / len, az / len], angle);
}

describe('euler', () => {
    describe('create', () => {
        it('should create default Euler with xyz order', () => {
            const result = euler.create();
            expect(result).toEqual([0, 0, 0, 'xyz']);
        });
    });

    describe('fromValues', () => {
        it('should create Euler from values', () => {
            const result = euler.fromValues(Math.PI / 4, Math.PI / 3, Math.PI / 6, 'yxz');
            expect(result).toEqual([Math.PI / 4, Math.PI / 3, Math.PI / 6, 'yxz']);
        });
    });

    describe('fromDegrees', () => {
        it('should convert degrees to radians and set order', () => {
            const result = euler.create();
            euler.fromDegrees(result, 90, 180, 45, 'zxy');

            expect(result[0]).toBeCloseTo(Math.PI / 2);
            expect(result[1]).toBeCloseTo(Math.PI);
            expect(result[2]).toBeCloseTo(Math.PI / 4);
            expect(result[3]).toBe('zxy');
        });

        it('should modify the input Euler', () => {
            const eulerAngle = euler.create();
            const result = euler.fromDegrees(eulerAngle, 30, 60, 90, 'xyz');

            expect(result).toBe(eulerAngle);
            expect(result[0]).toBeCloseTo(Math.PI / 6);
            expect(result[1]).toBeCloseTo(Math.PI / 3);
            expect(result[2]).toBeCloseTo(Math.PI / 2);
        });
    });

    describe('fromRotationMat4', () => {
        it('should extract Euler angles from rotation matrix (xyz order)', () => {
            const rotX = Math.PI / 6; // 30 degrees
            const rotY = Math.PI / 4; // 45 degrees
            const rotZ = Math.PI / 3; // 60 degrees

            // Create a rotation matrix from known angles using correct order for 'xyz'
            const matrix = mat4.create();
            mat4.rotateX(matrix, matrix, rotX);
            mat4.rotateY(matrix, matrix, rotY);
            mat4.rotateZ(matrix, matrix, rotZ);

            const result = euler.create();
            euler.fromRotationMat4(result, matrix, 'xyz');

            expect(result[0]).toBeCloseTo(rotX, 4);
            expect(result[1]).toBeCloseTo(rotY, 4);
            expect(result[2]).toBeCloseTo(rotZ, 4);
            expect(result[3]).toBe('xyz');
        });

        it('should handle different rotation orders', () => {
            const orders: EulerOrder[] = ['xyz', 'yxz', 'zxy', 'zyx', 'yzx', 'xzy'];

            orders.forEach((order) => {
                const matrix = mat4.create();
                mat4.rotateY(matrix, matrix, Math.PI / 6);

                const result = euler.create();
                euler.fromRotationMat4(result, matrix, order);

                expect(result[3]).toBe(order);
                expect(typeof result[0]).toBe('number');
                expect(typeof result[1]).toBe('number');
                expect(typeof result[2]).toBe('number');
            });
        });

        it('should use existing order if none specified', () => {
            const matrix = mat4.create();
            mat4.rotateX(matrix, matrix, Math.PI / 4);

            const result: Euler = [0, 0, 0, 'yxz'];
            euler.fromRotationMat4(result, matrix);

            expect(result[3]).toBe('yxz');
        });

        it('should handle gimbal lock situations', () => {
            const matrix = mat4.create();
            // Create a matrix that causes gimbal lock (Y rotation = ±90°)
            mat4.rotateY(matrix, matrix, Math.PI / 2);

            const result = euler.create();
            euler.fromRotationMat4(result, matrix, 'xyz');

            expect(result[1]).toBeCloseTo(Math.PI / 2);
            // X and Z should be reasonable values (not NaN or Infinity)
            expect(Number.isFinite(result[0])).toBe(true);
            expect(Number.isFinite(result[2])).toBe(true);
        });
    });

    describe('exactEquals', () => {
        it('should return true for identical Euler angles', () => {
            const a: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'xyz'];
            const b: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'xyz'];

            expect(euler.exactEquals(a, b)).toBe(true);
        });

        it('should return false for different angles', () => {
            const a: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'xyz'];
            const b: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 5, 'xyz'];

            expect(euler.exactEquals(a, b)).toBe(false);
        });

        it('should return false for different orders', () => {
            const a: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'xyz'];
            const b: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'yxz'];

            expect(euler.exactEquals(a, b)).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for nearly equal Euler angles', () => {
            const a: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'xyz'];
            const b: Euler = [Math.PI / 4 + 1e-10, Math.PI / 3 + 1e-10, Math.PI / 6 + 1e-10, 'xyz'];

            expect(euler.equals(a, b)).toBe(true);
        });

        it('should return false for significantly different angles', () => {
            const a: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'xyz'];
            const b: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 5, 'xyz'];

            expect(euler.equals(a, b)).toBe(false);
        });

        it('should return false for different orders', () => {
            const a: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'xyz'];
            const b: Euler = [Math.PI / 4, Math.PI / 3, Math.PI / 6, 'yxz'];

            expect(euler.equals(a, b)).toBe(false);
        });

        it('should handle edge cases with zero values', () => {
            const a: Euler = [0, 0, 0, 'xyz'];
            const b: Euler = [1e-10, 1e-10, 1e-10, 'xyz'];

            expect(euler.equals(a, b)).toBe(true);
        });
    });

    describe('fromQuat', () => {
        it('should convert quaternion to Euler angles', () => {
            const q = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 4);
            const result = euler.create();

            euler.fromQuat(result, q, 'xyz');

            expect(result[3]).toBe('xyz');
            // Should have rotation around Z axis
            expect(Math.abs(result[2])).toBeCloseTo(Math.PI / 4, 5);
        });

        it('should work with different orders', () => {
            const q = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 6);
            const orders: EulerOrder[] = ['xyz', 'yxz', 'zxy', 'zyx', 'yzx', 'xzy'];

            orders.forEach((order) => {
                const result = euler.create();
                euler.fromQuat(result, q, order);

                expect(result[3]).toBe(order);
                expect(Number.isFinite(result[0])).toBe(true);
                expect(Number.isFinite(result[1])).toBe(true);
                expect(Number.isFinite(result[2])).toBe(true);
            });
        });

        it('should be consistent with fromEuler round-trip', () => {
            const originalEuler: Euler = [Math.PI / 6, Math.PI / 4, Math.PI / 8, 'xyz'];
            const q = quat.create();
            const resultEuler = euler.create();

            quat.fromEuler(q, originalEuler);
            euler.fromQuat(resultEuler, q, 'xyz');

            // Should be approximately the same (accounting for potential sign flips or equivalent angles)
            expect(resultEuler[3]).toBe('xyz');
            expect(Number.isFinite(resultEuler[0])).toBe(true);
            expect(Number.isFinite(resultEuler[1])).toBe(true);
            expect(Number.isFinite(resultEuler[2])).toBe(true);
        });
    });

    describe('reorder', () => {
        it('should convert Euler from one order to another', () => {
            const originalEuler: Euler = [Math.PI / 6, Math.PI / 4, Math.PI / 8, 'xyz'];
            const result = euler.create();

            euler.reorder(result, originalEuler, 'yxz');

            expect(result[3]).toBe('yxz');
            expect(Number.isFinite(result[0])).toBe(true);
            expect(Number.isFinite(result[1])).toBe(true);
            expect(Number.isFinite(result[2])).toBe(true);
        });

        it('should preserve rotation when reordering', () => {
            const originalEuler: Euler = [Math.PI / 6, Math.PI / 4, Math.PI / 8, 'xyz'];
            const reordered = euler.create();

            euler.reorder(reordered, originalEuler, 'zyx');

            // Convert both to quaternions to verify they represent the same rotation
            const qOriginal = quat.create();
            const qReordered = quat.create();

            quat.fromEuler(qOriginal, originalEuler);
            quat.fromEuler(qReordered, reordered);

            // Quaternions should be approximately equal (accounting for sign flip)
            const dotProduct = Math.abs(quat.dot(qOriginal, qReordered));
            expect(dotProduct).toBeCloseTo(1, 5);
        });

        it('should handle all order combinations', () => {
            const orders: EulerOrder[] = ['xyz', 'yxz', 'zxy', 'zyx', 'yzx', 'xzy'];
            const originalEuler: Euler = [Math.PI / 8, Math.PI / 6, Math.PI / 4, 'xyz'];

            orders.forEach((targetOrder) => {
                const result = euler.create();
                euler.reorder(result, originalEuler, targetOrder);

                expect(result[3]).toBe(targetOrder);
                expect(Number.isFinite(result[0])).toBe(true);
                expect(Number.isFinite(result[1])).toBe(true);
                expect(Number.isFinite(result[2])).toBe(true);
            });
        });

        it('should return same angles when reordering to same order', () => {
            const originalEuler: Euler = [Math.PI / 6, Math.PI / 4, Math.PI / 8, 'xyz'];
            const result = euler.create();

            euler.reorder(result, originalEuler, 'xyz');

            expect(result[0]).toBeCloseTo(originalEuler[0]);
            expect(result[1]).toBeCloseTo(originalEuler[1]);
            expect(result[2]).toBeCloseTo(originalEuler[2]);
            expect(result[3]).toBe('xyz');
        });
    });

    describe('set', () => {
        it('should set components and order, returning the same instance', () => {
            const out = euler.create();
            const result = euler.set(out, 1, 2, 3, 'zyx');

            expect(result).toBe(out);
            expect(out).toEqual([1, 2, 3, 'zyx']);
        });
    });

    describe('fromQuat / fromRotationMat4 parity', () => {
        // fromQuat computes the rotation-matrix elements inline instead of building a scratch
        // mat4; this pins it to the matrix path it replaced, for every order.
        it('fromQuat matches fromRotationMat4(mat4.fromQuat(q)) for all orders', () => {
            const rand = mulberry32.create(12345);

            for (let i = 0; i < 200; i++) {
                const q = randomQuat(rand);
                const m = mat4.fromQuat(mat4.create(), q);

                for (const order of ORDERS) {
                    const viaQuat = euler.fromQuat(euler.create(), q, order);
                    const viaMat = euler.fromRotationMat4(euler.create(), m, order);

                    expect(viaQuat[0]).toBeCloseTo(viaMat[0], 10);
                    expect(viaQuat[1]).toBeCloseTo(viaMat[1], 10);
                    expect(viaQuat[2]).toBeCloseTo(viaMat[2], 10);
                    expect(viaQuat[3]).toBe(viaMat[3]);
                }
            }
        });
    });

    describe('round-trip correctness (all orders)', () => {
        it('fromQuat produces euler angles that reconstruct the original rotation', () => {
            const rand = mulberry32.create(2024);

            for (const order of ORDERS) {
                for (let i = 0; i < 50; i++) {
                    const q0 = randomQuat(rand);
                    const e = euler.fromQuat(euler.create(), q0, order);
                    const q1 = quat.fromEuler(quat.create(), e);

                    // |dot| ≈ 1 tolerates the double-cover sign flip and equivalent angle sets
                    expect(Math.abs(quat.dot(q0, q1))).toBeCloseTo(1, 5);
                }
            }
        });

        it('fromRotationMat4 produces euler angles that reconstruct the original rotation', () => {
            const rand = mulberry32.create(4048);

            for (const order of ORDERS) {
                for (let i = 0; i < 50; i++) {
                    const q0 = randomQuat(rand);
                    const m = mat4.fromQuat(mat4.create(), q0);
                    const e = euler.fromRotationMat4(euler.create(), m, order);
                    const q1 = quat.fromEuler(quat.create(), e);

                    expect(Math.abs(quat.dot(q0, q1))).toBeCloseTo(1, 5);
                }
            }
        });
    });

    describe('gimbal lock (degenerate branch) per order', () => {
        ORDERS.forEach((order) => {
            [Math.PI / 2, -Math.PI / 2].forEach((angle) => {
                it(`handles the singular ${angle > 0 ? '+' : '-'}90° case for ${order}`, () => {
                    const q = quat.setAxisAngle(quat.create(), SINGULAR_AXIS[order], angle);
                    const e = euler.fromQuat(euler.create(), q, order);

                    expect(Number.isFinite(e[0])).toBe(true);
                    expect(Number.isFinite(e[1])).toBe(true);
                    expect(Number.isFinite(e[2])).toBe(true);
                    expect(e[3]).toBe(order);

                    // the degenerate decomposition must still represent the same rotation
                    const q1 = quat.fromEuler(quat.create(), e);
                    expect(Math.abs(quat.dot(q, q1))).toBeCloseTo(1, 5);
                });
            });
        });
    });

    describe('integration tests', () => {
        it('should handle round-trip conversions correctly', () => {
            const originalEuler: Euler = [Math.PI / 4, Math.PI / 6, Math.PI / 3, 'xyz'];

            // Euler -> Quat -> Euler
            const q = quat.create();
            const resultEuler = euler.create();

            quat.fromEuler(q, originalEuler);
            euler.fromQuat(resultEuler, q, 'xyz');

            // Should represent the same rotation (may have different but equivalent angles)
            const qOriginal = quat.create();
            const qResult = quat.create();

            quat.fromEuler(qOriginal, originalEuler);
            quat.fromEuler(qResult, resultEuler);

            const dotProduct = Math.abs(quat.dot(qOriginal, qResult));
            expect(dotProduct).toBeCloseTo(1, 5);
        });

        it('should handle Euler -> Matrix -> Euler conversion', () => {
            const originalEuler: Euler = [Math.PI / 8, Math.PI / 12, Math.PI / 16, 'xyz'];

            // Euler -> Quat -> Matrix -> Euler
            const q = quat.create();
            const matrix = mat4.create();
            const resultEuler = euler.create();

            quat.fromEuler(q, originalEuler);
            mat4.fromQuat(matrix, q);
            euler.fromRotationMat4(resultEuler, matrix, 'xyz');

            // Should preserve the rotation
            const qOriginal = quat.create();
            const qResult = quat.create();

            quat.fromEuler(qOriginal, originalEuler);
            quat.fromEuler(qResult, resultEuler);

            const dotProduct = Math.abs(quat.dot(qOriginal, qResult));
            expect(dotProduct).toBeCloseTo(1, 4);
        });

        it('should handle extreme angles', () => {
            const extremeEuler: Euler = [Math.PI * 1.5, Math.PI * 0.75, Math.PI * 1.25, 'xyz'];

            const q = quat.create();
            const resultEuler = euler.create();

            quat.fromEuler(q, extremeEuler);
            euler.fromQuat(resultEuler, q, 'xyz');

            // Should still be valid
            expect(Number.isFinite(resultEuler[0])).toBe(true);
            expect(Number.isFinite(resultEuler[1])).toBe(true);
            expect(Number.isFinite(resultEuler[2])).toBe(true);
            expect(resultEuler[3]).toBe('xyz');
        });

        it('should handle small angles', () => {
            const smallEuler: Euler = [1e-6, 1e-7, 1e-8, 'xyz'];

            const q = quat.create();
            const resultEuler = euler.create();

            quat.fromEuler(q, smallEuler);
            euler.fromQuat(resultEuler, q, 'xyz');

            // Should preserve small rotations
            expect(resultEuler[0]).toBeCloseTo(smallEuler[0], 10);
            expect(resultEuler[1]).toBeCloseTo(smallEuler[1], 10);
            expect(resultEuler[2]).toBeCloseTo(smallEuler[2], 10);
        });
    });
});
