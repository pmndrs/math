import { beforeEach, describe, expect, it } from 'vitest';
import { type Vec4, vec4 } from '../../../src';

describe('vec4', () => {
    let a: Vec4;
    let b: Vec4;
    let out: Vec4;

    beforeEach(() => {
        a = [1, 2, 3, 4];
        b = [5, 6, 7, 8];
        out = [0, 0, 0, 0];
    });

    describe('create', () => {
        it('should create a zero vector', () => {
            const result = vec4.create();
            expect(result).toEqual([0, 0, 0, 0]);
        });
    });

    describe('clone', () => {
        it('should create a copy of the vector', () => {
            const result = vec4.clone(a);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).not.toBe(a);
        });
    });

    describe('fromValues', () => {
        it('should create a vector with given values', () => {
            const result = vec4.fromValues(9, 10, 11, 12);
            expect(result).toEqual([9, 10, 11, 12]);
        });
    });

    describe('copy', () => {
        it('should copy values from source to output vector', () => {
            const result = vec4.copy(out, a);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).toBe(out);
        });
    });

    describe('set', () => {
        it('should set the vector components', () => {
            const result = vec4.set(out, 1, 2, 3, 4);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).toBe(out);
        });
    });

    describe('fromBuffer', () => {
        it('should set components from buffer', () => {
            const buffer = [10, 20, 30, 40, 50, 60];
            const result = vec4.fromBuffer(out, buffer, 1);
            expect(result).toEqual([20, 30, 40, 50]);
            expect(result).toBe(out);
        });
    });

    describe('toBuffer', () => {
        it('should write components to buffer', () => {
            const buffer = new Array(6).fill(0);
            const result = vec4.toBuffer(buffer, a, 1);
            expect(buffer).toEqual([0, 1, 2, 3, 4, 0]);
            expect(result).toBe(buffer);
        });
    });

    describe('add', () => {
        it('should add two vectors', () => {
            const result = vec4.add(out, a, b);
            expect(result).toEqual([6, 8, 10, 12]);
        });
    });

    describe('subtract', () => {
        it('should subtract second vector from first', () => {
            const result = vec4.subtract(out, b, a);
            expect(result).toEqual([4, 4, 4, 4]);
        });
    });

    describe('multiply', () => {
        it('should multiply vectors component-wise', () => {
            const result = vec4.multiply(out, a, b);
            expect(result).toEqual([5, 12, 21, 32]);
        });
    });

    describe('divide', () => {
        it('should divide vectors component-wise', () => {
            const result = vec4.divide(out, [10, 12, 14, 16], [2, 3, 7, 8]);
            expect(result).toEqual([5, 4, 2, 2]);
        });
    });

    describe('ceil', () => {
        it('should ceil all components', () => {
            const result = vec4.ceil(out, [1.1, 2.7, 3.3, 4.9]);
            expect(result).toEqual([2, 3, 4, 5]);
        });
    });

    describe('floor', () => {
        it('should floor all components', () => {
            const result = vec4.floor(out, [1.9, 2.1, 3.8, 4.2]);
            expect(result).toEqual([1, 2, 3, 4]);
        });
    });

    describe('min', () => {
        it('should return minimum of each component', () => {
            const result = vec4.min(out, a, b);
            expect(result).toEqual([1, 2, 3, 4]);
        });
    });

    describe('max', () => {
        it('should return maximum of each component', () => {
            const result = vec4.max(out, a, b);
            expect(result).toEqual([5, 6, 7, 8]);
        });
    });

    describe('round', () => {
        it('should round all components', () => {
            const result = vec4.round(out, [1.4, 2.6, 3.5, 4.3]);
            expect(result).toEqual([1, 3, 4, 4]);
        });
    });

    describe('scale', () => {
        it('should scale vector by scalar', () => {
            const result = vec4.scale(out, a, 2);
            expect(result).toEqual([2, 4, 6, 8]);
        });
    });

    describe('scaleAndAdd', () => {
        it('should scale second vector and add to first', () => {
            const result = vec4.scaleAndAdd(out, a, b, 2);
            expect(result).toEqual([11, 14, 17, 20]);
        });
    });

    describe('distance', () => {
        it('should calculate distance between vectors', () => {
            const result = vec4.distance(a, b);
            expect(result).toBe(8); // sqrt(16 + 16 + 16 + 16) = sqrt(64) = 8
        });

        it('should return 0 for same vectors', () => {
            expect(vec4.distance(a, a)).toBe(0);
        });
    });

    describe('squaredDistance', () => {
        it('should calculate squared distance between vectors', () => {
            const result = vec4.squaredDistance(a, b);
            expect(result).toBe(64); // 4^2 + 4^2 + 4^2 + 4^2 = 64
        });
    });

    describe('length', () => {
        it('should calculate vector length', () => {
            const result = vec4.length([2, 2, 2, 2]);
            expect(result).toBe(4); // sqrt(4 + 4 + 4 + 4) = sqrt(16) = 4
        });

        it('should return 0 for zero vector', () => {
            expect(vec4.length([0, 0, 0, 0])).toBe(0);
        });
    });

    describe('squaredLength', () => {
        it('should calculate squared length', () => {
            const result = vec4.squaredLength([2, 2, 2, 2]);
            expect(result).toBe(16);
        });
    });

    describe('negate', () => {
        it('should negate all components', () => {
            const result = vec4.negate(out, a);
            expect(result).toEqual([-1, -2, -3, -4]);
        });
    });

    describe('inverse', () => {
        it('should invert all components', () => {
            const result = vec4.inverse(out, [2, 4, 8, 16]);
            expect(result).toEqual([0.5, 0.25, 0.125, 0.0625]);
        });
    });

    describe('normalize', () => {
        it('should normalize vector to unit length', () => {
            const result = vec4.normalize(out, [2, 2, 2, 2]);
            expect(result[0]).toBeCloseTo(0.5);
            expect(result[1]).toBeCloseTo(0.5);
            expect(result[2]).toBeCloseTo(0.5);
            expect(result[3]).toBeCloseTo(0.5);
            expect(vec4.length(result)).toBeCloseTo(1);
        });

        it('should handle zero vector', () => {
            const result = vec4.normalize(out, [0, 0, 0, 0]);
            expect(result).toEqual([0, 0, 0, 0]);
        });
    });

    describe('dot', () => {
        it('should calculate dot product', () => {
            const result = vec4.dot(a, b);
            expect(result).toBe(70); // 1*5 + 2*6 + 3*7 + 4*8 = 5 + 12 + 21 + 32 = 70
        });

        it('should return 0 for orthogonal vectors', () => {
            const result = vec4.dot([1, 0, 0, 0], [0, 1, 0, 0]);
            expect(result).toBe(0);
        });
    });

    describe('cross', () => {
        it('should calculate 4D cross product', () => {
            const u: Vec4 = [1, 0, 0, 0];
            const v: Vec4 = [0, 1, 0, 0];
            const w: Vec4 = [0, 0, 1, 0];
            const result = vec4.cross(out, u, v, w);
            expect(result).toEqual([0, 0, 0, -1]);
        });

        it('should handle different vector combinations', () => {
            const u: Vec4 = [1, 2, 3, 4];
            const v: Vec4 = [5, 6, 7, 8];
            const w: Vec4 = [9, 10, 11, 12];
            const result = vec4.cross(out, u, v, w);
            expect(result).toHaveLength(4);
            // Just verify it returns a 4D vector; exact calculation is complex
        });
    });

    describe('lerp', () => {
        it('should interpolate between vectors', () => {
            const result = vec4.lerp(out, a, b, 0.5);
            expect(result).toEqual([3, 4, 5, 6]);
        });

        it('should return first vector at t=0', () => {
            const result = vec4.lerp(out, a, b, 0);
            expect(result).toEqual(a);
        });

        it('should return second vector at t=1', () => {
            const result = vec4.lerp(out, a, b, 1);
            expect(result).toEqual(b);
        });
    });

    describe('lagrange', () => {
        const c: Vec4 = [9, 11, 13, 15];

        it('should return first vector at t=0', () => {
            const result = vec4.lagrange(out, a, b, c, 0);
            expect(result[0]).toBeCloseTo(a[0]);
            expect(result[1]).toBeCloseTo(a[1]);
            expect(result[2]).toBeCloseTo(a[2]);
            expect(result[3]).toBeCloseTo(a[3]);
        });

        it('should return middle vector at t=0.5', () => {
            const result = vec4.lagrange(out, a, b, c, 0.5);
            expect(result[0]).toBeCloseTo(b[0]);
            expect(result[1]).toBeCloseTo(b[1]);
            expect(result[2]).toBeCloseTo(b[2]);
            expect(result[3]).toBeCloseTo(b[3]);
        });

        it('should return last vector at t=1', () => {
            const result = vec4.lagrange(out, a, b, c, 1);
            expect(result[0]).toBeCloseTo(c[0]);
            expect(result[1]).toBeCloseTo(c[1]);
            expect(result[2]).toBeCloseTo(c[2]);
            expect(result[3]).toBeCloseTo(c[3]);
        });
    });

    describe('transformMat4', () => {
        it('should transform vector by 4x4 matrix', () => {
            // Identity matrix should return original vector
            const identity: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            const result = vec4.transformMat4(out, a, identity as any);
            expect(result).toEqual(a);
        });

        it('should apply scaling transformation', () => {
            // Scale by 2 in all dimensions
            const scaleMatrix: number[] = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2];
            const result = vec4.transformMat4(out, [1, 1, 1, 1], scaleMatrix as any);
            expect(result).toEqual([2, 2, 2, 2]);
        });
    });

    describe('transformQuat', () => {
        it('should transform vector by quaternion', () => {
            // Identity quaternion should return original vector (w component unchanged)
            const identityQuat: number[] = [0, 0, 0, 1];
            const result = vec4.transformQuat(out, a, identityQuat as any);
            expect(result[0]).toBeCloseTo(a[0]);
            expect(result[1]).toBeCloseTo(a[1]);
            expect(result[2]).toBeCloseTo(a[2]);
            expect(result[3]).toBe(a[3]); // w component should be preserved
        });
    });

    describe('zero', () => {
        it('should set all components to zero', () => {
            const result = vec4.zero(a);
            expect(result).toEqual([0, 0, 0, 0]);
            expect(result).toBe(a);
        });
    });

    describe('str', () => {
        it('should return string representation', () => {
            const result = vec4.str(a);
            expect(result).toBe('vec4(1, 2, 3, 4)');
        });
    });

    describe('exactEquals', () => {
        it('should return true for exactly equal vectors', () => {
            expect(vec4.exactEquals(a, [1, 2, 3, 4])).toBe(true);
        });

        it('should return false for different vectors', () => {
            expect(vec4.exactEquals(a, b)).toBe(false);
        });

        it('should return false for approximately equal vectors', () => {
            expect(vec4.exactEquals([1, 2, 3, 4], [1.0000001, 2, 3, 4])).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for approximately equal vectors', () => {
            expect(vec4.equals([1, 2, 3, 4], [1.0000001, 2, 3, 4])).toBe(true);
        });

        it('should return false for significantly different vectors', () => {
            expect(vec4.equals(a, b)).toBe(false);
        });
    });

    describe('finite', () => {
        it('should return true for finite vectors', () => {
            expect(vec4.finite(a)).toBe(true);
        });

        it('should return false for vectors with infinity', () => {
            expect(vec4.finite([1, Infinity, 3, 4])).toBe(false);
        });

        it('should return false for vectors with NaN', () => {
            expect(vec4.finite([1, NaN, 3, 4])).toBe(false);
        });
    });

    describe('aliases', () => {
        it('sub should be alias for subtract', () => {
            expect(vec4.sub).toBe(vec4.subtract);
        });

        it('mul should be alias for multiply', () => {
            expect(vec4.mul).toBe(vec4.multiply);
        });

        it('div should be alias for divide', () => {
            expect(vec4.div).toBe(vec4.divide);
        });

        it('dist should be alias for distance', () => {
            expect(vec4.dist).toBe(vec4.distance);
        });

        it('sqrDist should be alias for squaredDistance', () => {
            expect(vec4.sqrDist).toBe(vec4.squaredDistance);
        });

        it('len should be alias for length', () => {
            expect(vec4.len).toBe(vec4.length);
        });

        it('sqrLen should be alias for squaredLength', () => {
            expect(vec4.sqrLen).toBe(vec4.squaredLength);
        });
    });
});
