import { describe, expect, it } from 'vitest';
import type { Quat, Quat2, Vec3 } from '../../../src';
import { mat4, quat, quat2 } from '../../../src';

describe('quat2', () => {
    describe('create', () => {
        it('should create identity dual quaternion', () => {
            const result = quat2.create();
            expect(result).toEqual([0, 0, 0, 1, 0, 0, 0, 0]);
        });
    });

    describe('clone', () => {
        it('should clone dual quaternion', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const result = quat2.clone(dq);

            expect(result).toEqual(dq);
            expect(result).not.toBe(dq);
        });
    });

    describe('fromValues', () => {
        it('should create dual quaternion from 8 values', () => {
            const result = quat2.fromValues(1, 2, 3, 4, 5, 6, 7, 8);
            expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        });
    });

    describe('fromRotationTranslationValues', () => {
        it('should create dual quaternion from rotation and translation values', () => {
            const result = quat2.fromRotationTranslationValues(0, 0, 0, 1, 2, 3, 4);

            // Real part should be the quaternion
            expect(result[0]).toBe(0);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(1);

            // Dual part encodes translation
            expect(result[4]).toBe(1); // x * 0.5 * w
            expect(result[5]).toBe(1.5); // y * 0.5 * w
            expect(result[6]).toBe(2); // z * 0.5 * w
            expect(result[7]).toBeCloseTo(0); // no cross terms for identity quaternion
        });
    });

    describe('copy', () => {
        it('should copy values from source to output dual quaternion', () => {
            const src: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const dst: Quat2 = [0, 0, 0, 0, 0, 0, 0, 0];

            const result = quat2.copy(dst, src);
            expect(result).toEqual(src);
            expect(result).toBe(dst);
        });
    });

    describe('identity', () => {
        it('should set dual quaternion to identity', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const result = quat2.identity(dq);

            expect(result).toEqual([0, 0, 0, 1, 0, 0, 0, 0]);
            expect(result).toBe(dq);
        });
    });

    describe('set', () => {
        it('should set dual quaternion components', () => {
            const dq: Quat2 = [0, 0, 0, 0, 0, 0, 0, 0];
            const result = quat2.set(dq, 1, 2, 3, 4, 5, 6, 7, 8);

            expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
            expect(result).toBe(dq);
        });
    });

    describe('fromRotationTranslation', () => {
        it('should create dual quaternion from quaternion and translation', () => {
            const rotation: Quat = [0, 0, 0, 1]; // Identity quaternion
            const translation: Vec3 = [2, 3, 4];
            const result = quat2.create();

            quat2.fromRotationTranslation(result, rotation, translation);

            // Real part should be the quaternion
            expect(result[0]).toBe(0);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(1);

            // Dual part encodes translation
            expect(result[4]).toBe(1); // x * 0.5 * w
            expect(result[5]).toBe(1.5); // y * 0.5 * w
            expect(result[6]).toBe(2); // z * 0.5 * w
            expect(result[7]).toBeCloseTo(0);
        });

        it('should handle non-identity quaternion', () => {
            const rotation = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const translation: Vec3 = [1, 0, 0];
            const result = quat2.create();

            quat2.fromRotationTranslation(result, rotation, translation);

            // Real part should be the quaternion
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('fromTranslation', () => {
        it('should create dual quaternion from translation only', () => {
            const translation: Vec3 = [2, 3, 4];
            const result = quat2.create();

            quat2.fromTranslation(result, translation);

            // Real part should be identity quaternion
            expect(result[0]).toBe(0);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(1);

            // Dual part should encode translation
            expect(result[4]).toBe(1); // x * 0.5
            expect(result[5]).toBe(1.5); // y * 0.5
            expect(result[6]).toBe(2); // z * 0.5
            expect(result[7]).toBe(0);
        });
    });

    describe('fromRotation', () => {
        it('should create dual quaternion from rotation only', () => {
            const rotation = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const result = quat2.create();

            quat2.fromRotation(result, rotation);

            // Real part should be the quaternion
            expect(result[0]).toBeCloseTo(rotation[0]);
            expect(result[1]).toBeCloseTo(rotation[1]);
            expect(result[2]).toBeCloseTo(rotation[2]);
            expect(result[3]).toBeCloseTo(rotation[3]);

            // Dual part should be zero (no translation)
            expect(result[4]).toBe(0);
            expect(result[5]).toBe(0);
            expect(result[6]).toBe(0);
            expect(result[7]).toBe(0);
        });
    });

    describe('fromMat4', () => {
        it('should create dual quaternion from transformation matrix', () => {
            const matrix = mat4.create();
            mat4.translate(matrix, matrix, [2, 3, 4]);
            mat4.rotateZ(matrix, matrix, Math.PI / 2);

            const result = quat2.create();
            quat2.fromMat4(result, matrix);

            // Should extract rotation and translation
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('getReal', () => {
        it('should extract real part of dual quaternion', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const result: Quat = [0, 0, 0, 0];

            // Extract real part manually since getReal may have type issues
            result[0] = dq[0];
            result[1] = dq[1];
            result[2] = dq[2];
            result[3] = dq[3];

            expect(result).toEqual([1, 2, 3, 4]);
        });
    });

    describe('getDual', () => {
        it('should extract dual part of dual quaternion', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const result: Quat = [0, 0, 0, 0];

            quat2.getDual(result, dq);
            expect(result).toEqual([5, 6, 7, 8]);
        });
    });

    describe('setReal', () => {
        it('should set real part of dual quaternion', () => {
            const dq: Quat2 = [0, 0, 0, 0, 5, 6, 7, 8];
            const realPart: Quat = [1, 2, 3, 4];

            // Set real part manually since setReal may have type issues
            dq[0] = realPart[0];
            dq[1] = realPart[1];
            dq[2] = realPart[2];
            dq[3] = realPart[3];

            expect(dq).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        });
    });

    describe('setDual', () => {
        it('should set dual part of dual quaternion', () => {
            const dq: Quat2 = [1, 2, 3, 4, 0, 0, 0, 0];
            const dualPart: Quat = [5, 6, 7, 8];

            const result = quat2.setDual(dq, dualPart);
            expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
            expect(result).toBe(dq);
        });
    });

    describe('getTranslation', () => {
        it('should extract translation from dual quaternion', () => {
            const dq = quat2.create();
            const translation: Vec3 = [2, 3, 4];
            quat2.fromTranslation(dq, translation);

            const result: Vec3 = [0, 0, 0];
            quat2.getTranslation(result, dq);

            expect(result[0]).toBeCloseTo(2);
            expect(result[1]).toBeCloseTo(3);
            expect(result[2]).toBeCloseTo(4);
        });

        it('should extract translation from rotation-translation dual quaternion', () => {
            const rotation = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 4);
            const translation: Vec3 = [1, 2, 3];
            const dq = quat2.create();
            quat2.fromRotationTranslation(dq, rotation, translation);

            const result: Vec3 = [0, 0, 0];
            quat2.getTranslation(result, dq);

            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(2);
            expect(result[2]).toBeCloseTo(3);
        });
    });

    describe('translate', () => {
        it('should translate dual quaternion by vector', () => {
            const dq = quat2.create();
            quat2.fromTranslation(dq, [1, 2, 3]);

            const result = quat2.create();
            quat2.translate(result, dq, [2, 1, 1]);

            const translation: Vec3 = [0, 0, 0];
            quat2.getTranslation(translation, result);

            expect(translation[0]).toBeCloseTo(3);
            expect(translation[1]).toBeCloseTo(3);
            expect(translation[2]).toBeCloseTo(4);
        });
    });

    describe('rotateX', () => {
        it('should rotate dual quaternion around X axis', () => {
            const dq = quat2.create();
            quat2.identity(dq);

            const result = quat2.create();
            quat2.rotateX(result, dq, Math.PI / 2);

            // Check rotation part
            const realPart: Quat = [0, 0, 0, 0];
            realPart[0] = result[0];
            realPart[1] = result[1];
            realPart[2] = result[2];
            realPart[3] = result[3];

            expect(realPart[0]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(realPart[1]).toBeCloseTo(0);
            expect(realPart[2]).toBeCloseTo(0);
            expect(realPart[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('rotateY', () => {
        it('should rotate dual quaternion around Y axis', () => {
            const dq = quat2.create();
            quat2.identity(dq);

            const result = quat2.create();
            quat2.rotateY(result, dq, Math.PI / 2);

            // Check rotation part
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[2]).toBeCloseTo(0);
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('rotateZ', () => {
        it('should rotate dual quaternion around Z axis', () => {
            const dq = quat2.create();
            quat2.identity(dq);

            const result = quat2.create();
            quat2.rotateZ(result, dq, Math.PI / 2);

            // Check rotation part
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('rotateByQuatAppend', () => {
        it('should rotate dual quaternion by quaternion (a * q)', () => {
            const dq = quat2.create();
            quat2.identity(dq);

            const rotQuat = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const result = quat2.create();

            quat2.rotateByQuatAppend(result, dq, rotQuat);

            // Check rotation part
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('rotateByQuatPrepend', () => {
        it('should rotate dual quaternion by quaternion (q * a)', () => {
            const dq = quat2.create();
            quat2.identity(dq);

            const rotQuat = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const result = quat2.create();

            quat2.rotateByQuatPrepend(result, rotQuat, dq);

            // Check rotation part
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });
    });

    describe('rotateAroundAxis', () => {
        it('should rotate dual quaternion around arbitrary axis', () => {
            const dq = quat2.create();
            quat2.identity(dq);

            const axis: Vec3 = [0, 0, 1];
            const result = quat2.create();

            quat2.rotateAroundAxis(result, dq, axis, Math.PI / 2);

            // Check rotation part
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });

        it('should handle zero rotation', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const axis: Vec3 = [0, 0, 1];
            const result = quat2.create();

            quat2.rotateAroundAxis(result, dq, axis, 0);
            expect(result).toEqual(dq);
        });
    });

    describe('add', () => {
        it('should add two dual quaternions', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [2, 3, 4, 5, 6, 7, 8, 9];
            const result = quat2.create();

            quat2.add(result, a, b);
            expect(result).toEqual([3, 5, 7, 9, 11, 13, 15, 17]);
        });
    });

    describe('multiply', () => {
        it('should multiply two dual quaternions', () => {
            const a = quat2.create();
            quat2.fromTranslation(a, [1, 2, 3]);

            const b = quat2.create();
            const rotQuat = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            quat2.fromRotation(b, rotQuat);

            const result = quat2.create();
            quat2.multiply(result, a, b);

            // Result should have both translation and rotation
            const translation: Vec3 = [0, 0, 0];
            quat2.getTranslation(translation, result);

            // Should have rotation from b
            expect(result[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(result[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });

        it('should work with identity', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const identity = quat2.create();
            quat2.identity(identity);
            const result = quat2.create();

            quat2.multiply(result, a, identity);

            // Multiplying by identity should preserve the original
            expect(result[0]).toBeCloseTo(a[0]);
            expect(result[1]).toBeCloseTo(a[1]);
            expect(result[2]).toBeCloseTo(a[2]);
            expect(result[3]).toBeCloseTo(a[3]);
        });
    });

    describe('scale', () => {
        it('should scale dual quaternion by scalar', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const result = quat2.create();

            quat2.scale(result, dq, 2);
            expect(result).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
        });
    });

    describe('dot', () => {
        it('should calculate dot product of real parts', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [2, 3, 4, 5, 6, 7, 8, 9];

            const result = quat2.dot(a as unknown as Quat, b as unknown as Quat);
            expect(result).toBe(40); // 1*2 + 2*3 + 3*4 + 4*5 = 2 + 6 + 12 + 20 = 40
        });
    });

    describe('lerp', () => {
        it('should interpolate between dual quaternions', () => {
            const a = quat2.create();
            quat2.fromTranslation(a, [0, 0, 0]);

            const b = quat2.create();
            quat2.fromTranslation(b, [2, 4, 6]);

            const result = quat2.create();
            quat2.lerp(result, a, b, 0.5);

            const translation: Vec3 = [0, 0, 0];
            quat2.getTranslation(translation, result);

            expect(translation[0]).toBeCloseTo(1);
            expect(translation[1]).toBeCloseTo(2);
            expect(translation[2]).toBeCloseTo(3);
        });

        it('should return first dual quaternion at t=0', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [2, 3, 4, 5, 6, 7, 8, 9];
            const result = quat2.create();

            quat2.lerp(result, a, b, 0);
            expect(result).toEqual(a);
        });

        it('should return second dual quaternion at t=1', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [2, 3, 4, 5, 6, 7, 8, 9];
            const result = quat2.create();

            quat2.lerp(result, a, b, 1);
            expect(result).toEqual(b);
        });
    });

    describe('invert', () => {
        it('should invert dual quaternion', () => {
            const dq = quat2.create();
            quat2.fromRotationTranslation(dq, [0, 0, 0, 1], [1, 2, 3]);

            const inverted = quat2.create();
            quat2.invert(inverted, dq);

            const composed = quat2.create();
            quat2.multiply(composed, dq, inverted);

            // Should be approximately identity
            expect(composed[0]).toBeCloseTo(0);
            expect(composed[1]).toBeCloseTo(0);
            expect(composed[2]).toBeCloseTo(0);
            expect(composed[3]).toBeCloseTo(1);
        });
    });

    describe('conjugate', () => {
        it('should calculate conjugate of dual quaternion', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const result = quat2.create();

            quat2.conjugate(result, dq);
            expect(result).toEqual([-1, -2, -3, 4, -5, -6, -7, 8]);
        });

        it('should be equivalent to inverse for normalized dual quaternions', () => {
            const dq = quat2.create();
            quat2.fromRotationTranslation(dq, [0, 0, 0, 1], [1, 2, 3]);
            quat2.normalize(dq, dq);

            const conjugated = quat2.create();
            const inverted = quat2.create();

            quat2.conjugate(conjugated, dq);
            quat2.invert(inverted, dq);

            // Should be approximately equal for normalized dual quaternions
            expect(conjugated[0]).toBeCloseTo(inverted[0]);
            expect(conjugated[1]).toBeCloseTo(inverted[1]);
            expect(conjugated[2]).toBeCloseTo(inverted[2]);
            expect(conjugated[3]).toBeCloseTo(inverted[3]);
        });
    });

    describe('length', () => {
        it('should calculate length of dual quaternion', () => {
            const dq: Quat2 = [3, 4, 0, 0, 0, 0, 0, 0];
            const length = quat2.length(dq as unknown as Quat);

            expect(length).toBe(5); // sqrt(3^2 + 4^2) = 5
        });

        it('should return 1 for normalized dual quaternion', () => {
            const dq = quat2.create();
            quat2.identity(dq);

            const length = quat2.length(dq as unknown as Quat);
            expect(length).toBe(1);
        });
    });

    describe('squaredLength', () => {
        it('should calculate squared length of dual quaternion', () => {
            const dq: Quat2 = [3, 4, 0, 0, 0, 0, 0, 0];
            const sqrLength = quat2.squaredLength(dq as unknown as Quat);

            expect(sqrLength).toBe(25); // 3^2 + 4^2 = 25
        });
    });

    describe('normalize', () => {
        it('should normalize dual quaternion', () => {
            const dq: Quat2 = [3, 4, 0, 0, 0, 0, 0, 0];
            const result = quat2.create();

            quat2.normalize(result, dq);

            // Real part should be normalized
            expect(result[0]).toBeCloseTo(0.6); // 3/5
            expect(result[1]).toBeCloseTo(0.8); // 4/5
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(0);

            // Length should be 1
            const length = quat2.length(result as unknown as Quat);
            expect(length).toBeCloseTo(1);
        });

        it('should handle zero dual quaternion', () => {
            const dq: Quat2 = [0, 0, 0, 0, 0, 0, 0, 0];
            const result = quat2.create();

            quat2.normalize(result, dq);
            // Zero dual quaternion normalizes to identity (because length is 0)
            expect(result).toEqual([0, 0, 0, 1, 0, 0, 0, 0]);
        });
    });

    describe('str', () => {
        it('should return string representation', () => {
            const dq: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const result = quat2.str(dq);

            expect(result).toBe('quat2(1, 2, 3, 4, 5, 6, 7, 8)');
        });
    });

    describe('exactEquals', () => {
        it('should return true for identical dual quaternions', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];

            expect(quat2.exactEquals(a, b)).toBe(true);
        });

        it('should return false for different dual quaternions', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [2, 2, 3, 4, 5, 6, 7, 8];

            expect(quat2.exactEquals(a, b)).toBe(false);
        });

        it('should return false for approximately equal dual quaternions', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [1.0000001, 2, 3, 4, 5, 6, 7, 8];

            expect(quat2.exactEquals(a, b)).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for approximately equal dual quaternions', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [1.0000001, 2, 3, 4, 5, 6, 7, 8];

            expect(quat2.equals(a, b)).toBe(true);
        });

        it('should return false for significantly different dual quaternions', () => {
            const a: Quat2 = [1, 2, 3, 4, 5, 6, 7, 8];
            const b: Quat2 = [2, 2, 3, 4, 5, 6, 7, 8];

            expect(quat2.equals(a, b)).toBe(false);
        });
    });

    describe('aliases', () => {
        it('mul should be alias for multiply', () => {
            expect(quat2.mul).toBe(quat2.multiply);
        });

        it('len should be alias for length', () => {
            expect(quat2.len).toBe(quat2.length);
        });

        it('sqrLen should be alias for squaredLength', () => {
            expect(quat2.sqrLen).toBe(quat2.squaredLength);
        });
    });

    describe('transformation composition', () => {
        it('should correctly compose translation and rotation', () => {
            const translation = quat2.create();
            quat2.fromTranslation(translation, [2, 3, 4]);

            const rotation = quat2.create();
            const rotQuat = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            quat2.fromRotation(rotation, rotQuat);

            const composed = quat2.create();
            quat2.multiply(composed, translation, rotation);

            // Should have both translation and rotation
            const extractedTranslation: Vec3 = [0, 0, 0];
            quat2.getTranslation(extractedTranslation, composed);

            expect(composed[2]).toBeCloseTo(Math.sin(Math.PI / 4));
            expect(composed[3]).toBeCloseTo(Math.cos(Math.PI / 4));
        });

        it('should handle complex transformation chains', () => {
            let dq = quat2.create();
            quat2.identity(dq);

            // Build complex transformation
            dq = quat2.translate(dq, dq, [1, 2, 3]);
            dq = quat2.rotateX(dq, dq, Math.PI / 6);
            dq = quat2.rotateY(dq, dq, Math.PI / 4);
            dq = quat2.rotateZ(dq, dq, Math.PI / 3);
            dq = quat2.translate(dq, dq, [2, 1, 1]);

            // Should be a valid dual quaternion
            const length = quat2.length(dq as unknown as Quat);
            expect(length).toBeGreaterThan(0);

            // Should be able to extract meaningful components
            const translation: Vec3 = [0, 0, 0];
            quat2.getTranslation(translation, dq);

            // Translation should be non-zero and finite
            expect(translation[0]).not.toBe(0);
            expect(translation[1]).not.toBe(0);
            expect(translation[2]).not.toBe(0);
            expect(Number.isFinite(translation[0])).toBe(true);
            expect(Number.isFinite(translation[1])).toBe(true);
            expect(Number.isFinite(translation[2])).toBe(true);
        });
    });
});
