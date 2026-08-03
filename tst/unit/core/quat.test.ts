import { describe, expect, it } from 'vitest';
import type { Euler, Mat3, Quat, Vec3 } from '../../../src';
import { mat4, quat, vec3 } from '../../../src';

describe('quat', () => {
    describe('create', () => {
        it('should create identity quaternion', () => {
            const result = quat.create();
            expect(result).toEqual([0, 0, 0, 1]);
        });
    });

    describe('identity', () => {
        it('should set quaternion to identity', () => {
            const q: Quat = [1, 2, 3, 4];
            const result = quat.identity(q);
            expect(result).toEqual([0, 0, 0, 1]);
            expect(result).toBe(q);
        });
    });

    describe('setAxisAngle', () => {
        it('should set quaternion from axis and angle', () => {
            const q: Quat = [0, 0, 0, 0];
            const axis: Vec3 = [0, 0, 1];
            const angle = Math.PI / 2;

            const result = quat.setAxisAngle(q, axis, angle);
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(angle / 2));
            expect(result[3]).toBeCloseTo(Math.cos(angle / 2));
            expect(result).toBe(q);
        });
    });

    describe('getAxisAngle', () => {
        it('should get axis and angle from quaternion', () => {
            const axis: Vec3 = [0, 0, 1];
            const angle = Math.PI / 2;
            const q = quat.setAxisAngle(quat.create(), axis, angle);

            const outAxis: Vec3 = [0, 0, 0];
            const resultAngle = quat.getAxisAngle(outAxis, q);

            expect(resultAngle).toBeCloseTo(angle);
            expect(outAxis[0]).toBeCloseTo(0);
            expect(outAxis[1]).toBeCloseTo(0);
            expect(outAxis[2]).toBeCloseTo(1);
        });

        it('should handle identity quaternion', () => {
            const q = quat.identity(quat.create());
            const outAxis: Vec3 = [0, 0, 0];
            const angle = quat.getAxisAngle(outAxis, q);

            expect(angle).toBeCloseTo(0);
            expect(outAxis[0]).toBe(1);
            expect(outAxis[1]).toBe(0);
            expect(outAxis[2]).toBe(0);
        });
    });

    describe('getAngle', () => {
        it('should get angle between two quaternions', () => {
            const q1 = quat.identity(quat.create());
            const q2 = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);

            const angle = quat.getAngle(q1, q2);
            expect(angle).toBeCloseTo(Math.PI / 2);
        });

        it('should return 0 for identical quaternions', () => {
            const q1 = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 4);
            const q2 = quat.clone(q1);

            const angle = quat.getAngle(q1, q2);
            expect(angle).toBeCloseTo(0);
        });
    });

    describe('multiply', () => {
        it('should multiply two quaternions correctly', () => {
            const q1 = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const q2 = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 2);
            const result = quat.create();

            quat.multiply(result, q1, q2);

            // Result should be a composition of both rotations
            expect(quat.length(result)).toBeCloseTo(1);
        });

        it('should be identity when multiplying by identity', () => {
            const q1 = quat.setAxisAngle(quat.create(), [1, 2, 3], Math.PI / 3);
            const identity = quat.identity(quat.create());
            const result = quat.create();

            quat.multiply(result, q1, identity);
            expect(result[0]).toBeCloseTo(q1[0]);
            expect(result[1]).toBeCloseTo(q1[1]);
            expect(result[2]).toBeCloseTo(q1[2]);
            expect(result[3]).toBeCloseTo(q1[3]);
        });
    });

    describe('rotateX', () => {
        it('should rotate quaternion around X axis', () => {
            const q = quat.identity(quat.create());
            const result = quat.create();

            quat.rotateX(result, q, Math.PI / 2);

            expect(result[0]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(0);
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('rotateY', () => {
        it('should rotate quaternion around Y axis', () => {
            const q = quat.identity(quat.create());
            const result = quat.create();

            quat.rotateY(result, q, Math.PI / 2);

            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[2]).toBeCloseTo(0);
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('rotateZ', () => {
        it('should rotate quaternion around Z axis', () => {
            const q = quat.identity(quat.create());
            const result = quat.create();

            quat.rotateZ(result, q, Math.PI / 2);

            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('calculateW', () => {
        it('should calculate W component from XYZ', () => {
            const q: Quat = [0.5, 0.5, 0.5, 999]; // W should be ignored
            const result = quat.create();

            quat.calculateW(result, q);

            expect(result[0]).toBe(0.5);
            expect(result[1]).toBe(0.5);
            expect(result[2]).toBe(0.5);
            expect(result[3]).toBeCloseTo(0.5);
        });
    });

    describe('exp and ln', () => {
        it('should be inverse operations', () => {
            const q = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 4);
            const logged = quat.create();
            const restored = quat.create();

            quat.ln(logged, q);
            quat.exp(restored, logged);

            expect(restored[0]).toBeCloseTo(q[0]);
            expect(restored[1]).toBeCloseTo(q[1]);
            expect(restored[2]).toBeCloseTo(q[2]);
            expect(restored[3]).toBeCloseTo(q[3]);
        });
    });

    describe('pow', () => {
        it('should raise quaternion to a power', () => {
            const q = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 4);
            const squared = quat.create();

            quat.pow(squared, q, 2);

            // q^2 should be equivalent to 2 * angle
            const axis: Vec3 = [0, 0, 0];
            const angle = quat.getAxisAngle(axis, squared);
            expect(angle).toBeCloseTo(Math.PI / 2);
        });
    });

    describe('slerp', () => {
        it('should interpolate between quaternions', () => {
            const q1 = quat.identity(quat.create());
            const q2 = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const result = quat.create();

            quat.slerp(result, q1, q2, 0.5);

            const axis: Vec3 = [0, 0, 0];
            const angle = quat.getAxisAngle(axis, result);
            expect(angle).toBeCloseTo(Math.PI / 4);
        });

        it('should return first quaternion at t=0', () => {
            const q1 = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 3);
            const q2 = quat.setAxisAngle(quat.create(), [0, 1, 0], Math.PI / 4);
            const result = quat.create();

            quat.slerp(result, q1, q2, 0);

            expect(result[0]).toBeCloseTo(q1[0]);
            expect(result[1]).toBeCloseTo(q1[1]);
            expect(result[2]).toBeCloseTo(q1[2]);
            expect(result[3]).toBeCloseTo(q1[3]);
        });

        it('should return second quaternion at t=1', () => {
            const q1 = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 3);
            const q2 = quat.setAxisAngle(quat.create(), [0, 1, 0], Math.PI / 4);
            const result = quat.create();

            quat.slerp(result, q1, q2, 1);

            expect(result[0]).toBeCloseTo(q2[0]);
            expect(result[1]).toBeCloseTo(q2[1]);
            expect(result[2]).toBeCloseTo(q2[2]);
            expect(result[3]).toBeCloseTo(q2[3]);
        });
    });

    describe('invert', () => {
        it('should compute quaternion inverse', () => {
            const q = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 4);
            const inverse = quat.create();
            const identity = quat.create();

            quat.invert(inverse, q);
            quat.multiply(identity, q, inverse);

            expect(identity[0]).toBeCloseTo(0);
            expect(identity[1]).toBeCloseTo(0);
            expect(identity[2]).toBeCloseTo(0);
            expect(identity[3]).toBeCloseTo(1);
        });
    });

    describe('conjugate', () => {
        it('should compute quaternion conjugate', () => {
            const q: Quat = [1, 2, 3, 4];
            const result = quat.create();

            quat.conjugate(result, q);

            expect(result).toEqual([-1, -2, -3, 4]);
        });

        it('should be inverse for unit quaternions', () => {
            const q = quat.normalize(quat.create(), [1, 2, 3, 4]);
            const conjugated = quat.create();
            const identity = quat.create();

            quat.conjugate(conjugated, q);
            quat.multiply(identity, q, conjugated);

            expect(identity[0]).toBeCloseTo(0);
            expect(identity[1]).toBeCloseTo(0);
            expect(identity[2]).toBeCloseTo(0);
            expect(identity[3]).toBeCloseTo(1);
        });
    });

    describe('fromMat3', () => {
        it('should create quaternion from rotation matrix', () => {
            const angle = Math.PI / 4;
            const axis: Vec3 = [0, 0, 1];
            const originalQuat = quat.setAxisAngle(quat.create(), axis, angle);

            // Create rotation matrix from quaternion using mat4 then extract 3x3
            const mat4Matrix = mat4.create();
            mat4.fromQuat(mat4Matrix, originalQuat);

            // Extract 3x3 rotation matrix from 4x4
            const rotMatrix: Mat3 = [
                mat4Matrix[0],
                mat4Matrix[1],
                mat4Matrix[2],
                mat4Matrix[4],
                mat4Matrix[5],
                mat4Matrix[6],
                mat4Matrix[8],
                mat4Matrix[9],
                mat4Matrix[10],
            ];

            const result = quat.create();
            quat.fromMat3(result, rotMatrix);

            // Should be approximately the same quaternion (may have sign flip)
            const dotProduct = Math.abs(quat.dot(originalQuat, result));
            expect(dotProduct).toBeCloseTo(1, 4);
        });
    });

    describe('fromEuler', () => {
        it('should create quaternion from euler angles', () => {
            const euler: Euler = [Math.PI / 4, Math.PI / 6, Math.PI / 3, 'xyz'];
            const result = quat.create();

            quat.fromEuler(result, euler);

            expect(quat.length(result)).toBeCloseTo(1);
        });

        it('should handle different euler orders', () => {
            const orders: Array<'xyz' | 'yxz' | 'zxy' | 'zyx' | 'yzx' | 'xzy'> = ['xyz', 'yxz', 'zxy', 'zyx', 'yzx', 'xzy'];

            orders.forEach((order) => {
                const euler: Euler = [Math.PI / 4, Math.PI / 6, Math.PI / 8, order];
                const result = quat.create();

                quat.fromEuler(result, euler);
                expect(quat.length(result)).toBeCloseTo(1);
            });
        });
    });

    describe('fromDegrees', () => {
        it('should create quaternion from euler angles in degrees', () => {
            const result = quat.create();

            quat.fromDegrees(result, 45, 30, 60, 'xyz');

            expect(quat.length(result)).toBeCloseTo(1);
        });
    });

    describe('rotationTo', () => {
        it('should create rotation from one vector to another', () => {
            const a: Vec3 = [1, 0, 0];
            const b: Vec3 = [0, 1, 0];
            const result = quat.create();

            quat.rotationTo(result, a, b);

            // Apply rotation to vector a
            const rotated = vec3.transformQuat(vec3.create(), a, result);
            expect(rotated[0]).toBeCloseTo(b[0]);
            expect(rotated[1]).toBeCloseTo(b[1]);
            expect(rotated[2]).toBeCloseTo(b[2]);
        });

        it('should handle parallel vectors', () => {
            const a: Vec3 = [1, 0, 0];
            const b: Vec3 = [1, 0, 0];
            const result = quat.create();

            quat.rotationTo(result, a, b);

            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(0);
            expect(result[3]).toBeCloseTo(1);
        });

        it('should handle opposite vectors', () => {
            const a: Vec3 = [1, 0, 0];
            const b: Vec3 = [-1, 0, 0];
            const result = quat.create();

            quat.rotationTo(result, a, b);

            const rotated = vec3.transformQuat(vec3.create(), a, result);
            expect(rotated[0]).toBeCloseTo(b[0]);
            expect(rotated[1]).toBeCloseTo(b[1]);
            expect(rotated[2]).toBeCloseTo(b[2]);
        });
    });

    describe('sqlerp', () => {
        it('should perform spherical quadrangle interpolation', () => {
            const q1 = quat.identity(quat.create());
            const q2 = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 4);
            const q3 = quat.setAxisAngle(quat.create(), [0, 1, 0], Math.PI / 4);
            const q4 = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 4);
            const result = quat.create();

            quat.sqlerp(result, q1, q2, q3, q4, 0.5);

            expect(quat.length(result)).toBeCloseTo(1);
        });
    });

    describe('setAxes', () => {
        it('should create quaternion from view, right, up vectors', () => {
            const view: Vec3 = [0, 0, -1];
            const right: Vec3 = [1, 0, 0];
            const up: Vec3 = [0, 1, 0];
            const result = quat.create();

            quat.setAxes(result, view, right, up);

            expect(quat.length(result)).toBeCloseTo(1);
        });
    });

    describe('vec4 aliases', () => {
        it('should work with clone', () => {
            const q: Quat = [1, 2, 3, 4];
            const result = quat.clone(q);

            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).not.toBe(q);
        });

        it('should work with fromValues', () => {
            const result = quat.fromValues(1, 2, 3, 4);
            expect(result).toEqual([1, 2, 3, 4]);
        });

        it('should work with copy', () => {
            const a: Quat = [1, 2, 3, 4];
            const b: Quat = [0, 0, 0, 0];

            const result = quat.copy(b, a);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).toBe(b);
        });

        it('should work with set', () => {
            const q: Quat = [0, 0, 0, 0];
            const result = quat.set(q, 1, 2, 3, 4);

            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).toBe(q);
        });

        it('should work with add', () => {
            const a: Quat = [1, 2, 3, 4];
            const b: Quat = [5, 6, 7, 8];
            const result = quat.create();

            quat.add(result, a, b);
            expect(result).toEqual([6, 8, 10, 12]);
        });

        it('should work with scale', () => {
            const q: Quat = [1, 2, 3, 4];
            const result = quat.create();

            quat.scale(result, q, 2);
            expect(result).toEqual([2, 4, 6, 8]);
        });

        it('should work with dot', () => {
            const a: Quat = [1, 2, 3, 4];
            const b: Quat = [5, 6, 7, 8];

            const result = quat.dot(a, b);
            expect(result).toBe(70);
        });

        it('should work with lerp', () => {
            const a: Quat = [0, 0, 0, 1];
            const b: Quat = [1, 1, 1, 1];
            const result = quat.create();

            quat.lerp(result, a, b, 0.5);
            expect(result).toEqual([0.5, 0.5, 0.5, 1]);
        });

        it('should work with length and len alias', () => {
            const q: Quat = [3, 4, 0, 0];

            expect(quat.length(q)).toBe(5);
            expect(quat.len(q)).toBe(5);
        });

        it('should work with squaredLength and sqrLen alias', () => {
            const q: Quat = [3, 4, 0, 0];

            expect(quat.squaredLength(q)).toBe(25);
            expect(quat.sqrLen(q)).toBe(25);
        });

        it('should work with normalize', () => {
            const q: Quat = [3, 4, 0, 0];
            const result = quat.create();

            quat.normalize(result, q);
            expect(quat.length(result)).toBeCloseTo(1);
        });

        it('should work with exactEquals', () => {
            const a: Quat = [1, 2, 3, 4];
            const b: Quat = [1, 2, 3, 4];
            const c: Quat = [1, 2, 3, 5];

            expect(quat.exactEquals(a, b)).toBe(true);
            expect(quat.exactEquals(a, c)).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for nearly equal quaternions', () => {
            const a: Quat = [0, 0, 0, 1];
            const b: Quat = [0, 0, 0, 0.999999999];

            expect(quat.equals(a, b)).toBe(true);
        });

        it('should return true for quaternions with opposite signs', () => {
            const a: Quat = [0, 0, 0, 1];
            const b: Quat = [0, 0, 0, -1];

            expect(quat.equals(a, b)).toBe(true);
        });

        it('should return false for different quaternions', () => {
            const a: Quat = [1, 0, 0, 0];
            const b: Quat = [0, 1, 0, 0];

            expect(quat.equals(a, b)).toBe(false);
        });
    });

    describe('mul alias', () => {
        it('should be alias for multiply', () => {
            const q1 = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const q2 = quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 2);
            const result1 = quat.create();
            const result2 = quat.create();

            quat.multiply(result1, q1, q2);
            quat.mul(result2, q1, q2);

            expect(result1).toEqual(result2);
        });
    });

    describe('str', () => {
        it('should return string representation', () => {
            const q: Quat = [1, 2, 3, 4];
            const result = quat.str(q);

            expect(result).toBe('quat(1, 2, 3, 4)');
        });
    });
});
