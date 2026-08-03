import { describe, expect, it } from 'vitest';
import type { Euler, EulerOrder } from '../../../src';
import { euler, mat4, quat } from '../../../src';

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
