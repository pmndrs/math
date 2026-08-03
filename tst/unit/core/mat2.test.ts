import { describe, expect, it } from 'vitest';
import type { Mat2, Vec2 } from '../../../src';
import { mat2 } from '../../../src';

describe('mat2', () => {
    describe('create', () => {
        it('should create identity matrix', () => {
            const result = mat2.create();
            expect(result).toEqual([1, 0, 0, 1]);
        });
    });

    describe('clone', () => {
        it('should clone matrix', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const result = mat2.clone(m);

            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).not.toBe(m);
        });
    });

    describe('copy', () => {
        it('should copy values from one matrix to another', () => {
            const src: Mat2 = [1, 2, 3, 4];
            const dst: Mat2 = [0, 0, 0, 0];

            const result = mat2.copy(dst, src);
            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).toBe(dst);
        });
    });

    describe('identity', () => {
        it('should set matrix to identity', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const result = mat2.identity(m);

            expect(result).toEqual([1, 0, 0, 1]);
            expect(result).toBe(m);
        });
    });

    describe('fromValues', () => {
        it('should create matrix from values', () => {
            const result = mat2.fromValues(1, 2, 3, 4);
            expect(result).toEqual([1, 2, 3, 4]);
        });
    });

    describe('set', () => {
        it('should set matrix values', () => {
            const m: Mat2 = [0, 0, 0, 0];
            const result = mat2.set(m, 1, 2, 3, 4);

            expect(result).toEqual([1, 2, 3, 4]);
            expect(result).toBe(m);
        });
    });

    describe('transpose', () => {
        it('should transpose matrix', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const result = mat2.create();

            mat2.transpose(result, m);
            expect(result).toEqual([1, 3, 2, 4]);
        });

        it('should transpose in place', () => {
            const m: Mat2 = [1, 2, 3, 4];

            mat2.transpose(m, m);
            expect(m).toEqual([1, 3, 2, 4]);
        });
    });

    describe('invert', () => {
        it('should invert matrix', () => {
            const m: Mat2 = [1, 0, 1, 1]; // Simple invertible matrix
            const result = mat2.create();

            const inverted = mat2.invert(result, m);
            expect(inverted).not.toBeNull();
            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(-1);
            expect(result[3]).toBeCloseTo(1);
        });

        it('should return null for non-invertible matrix', () => {
            const m: Mat2 = [1, 2, 2, 4]; // Determinant = 0
            const result = mat2.create();

            const inverted = mat2.invert(result, m);
            expect(inverted).toBeNull();
        });

        it('should verify identity when multiplying by inverse', () => {
            const m: Mat2 = [2, 1, 1, 1];
            const inverse = mat2.create();
            const identity = mat2.create();

            mat2.invert(inverse, m);
            mat2.multiply(identity, m, inverse);

            expect(identity[0]).toBeCloseTo(1);
            expect(identity[1]).toBeCloseTo(0);
            expect(identity[2]).toBeCloseTo(0);
            expect(identity[3]).toBeCloseTo(1);
        });
    });

    describe('adjoint', () => {
        it('should calculate adjoint matrix', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const result = mat2.create();

            mat2.adjoint(result, m);
            expect(result).toEqual([4, -2, -3, 1]);
        });
    });

    describe('determinant', () => {
        it('should calculate determinant', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const det = mat2.determinant(m);

            expect(det).toBe(-2);
        });

        it('should return 0 for singular matrix', () => {
            const m: Mat2 = [1, 2, 2, 4];
            const det = mat2.determinant(m);

            expect(det).toBe(0);
        });
    });

    describe('multiply', () => {
        it('should multiply two matrices', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [5, 6, 7, 8];
            const result = mat2.create();

            mat2.multiply(result, a, b);
            expect(result).toEqual([23, 34, 31, 46]);
        });

        it('should work with identity matrix', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const identity = mat2.identity(mat2.create());
            const result = mat2.create();

            mat2.multiply(result, m, identity);
            expect(result).toEqual([1, 2, 3, 4]);
        });
    });

    describe('rotate', () => {
        it('should rotate matrix by given angle', () => {
            const m = mat2.identity(mat2.create());
            const result = mat2.create();
            const angle = Math.PI / 2; // 90 degrees

            mat2.rotate(result, m, angle);

            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(1);
            expect(result[2]).toBeCloseTo(-1);
            expect(result[3]).toBeCloseTo(0);
        });
    });

    describe('scale', () => {
        it('should scale matrix by vector', () => {
            const m = mat2.identity(mat2.create());
            const scale: Vec2 = [2, 3];
            const result = mat2.create();

            mat2.scale(result, m, scale);
            expect(result).toEqual([2, 0, 0, 3]);
        });
    });

    describe('fromRotation', () => {
        it('should create rotation matrix from angle', () => {
            const result = mat2.create();
            const angle = Math.PI / 4; // 45 degrees

            mat2.fromRotation(result, angle);

            const cos45 = Math.cos(angle);
            const sin45 = Math.sin(angle);
            expect(result[0]).toBeCloseTo(cos45);
            expect(result[1]).toBeCloseTo(sin45);
            expect(result[2]).toBeCloseTo(-sin45);
            expect(result[3]).toBeCloseTo(cos45);
        });
    });

    describe('fromScaling', () => {
        it('should create scaling matrix from vector', () => {
            const result = mat2.create();
            const scale: Vec2 = [2, 3];

            mat2.fromScaling(result, scale);
            expect(result).toEqual([2, 0, 0, 3]);
        });
    });

    describe('str', () => {
        it('should return string representation', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const result = mat2.str(m);

            expect(result).toBe('mat2(1, 2, 3, 4)');
        });
    });

    describe('frob', () => {
        it('should calculate Frobenius norm', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const norm = mat2.frob(m);

            expect(norm).toBeCloseTo(Math.sqrt(30)); // sqrt(1+4+9+16)
        });
    });

    describe('LDU', () => {
        it('should decompose matrix into LDU', () => {
            const m: Mat2 = [2, 1, 4, 3];
            const L = mat2.identity(mat2.create());
            const D = mat2.identity(mat2.create());
            const U = mat2.create();

            const [resultL, resultD, resultU] = mat2.LDU(L, D, U, m);

            expect(resultL).toBe(L);
            expect(resultD).toBe(D);
            expect(resultU).toBe(U);

            // L should be lower triangular with 1s on diagonal
            expect(L[0]).toBe(1);
            expect(L[1]).toBe(0);
            expect(L[3]).toBe(1);

            // U should have the correct values
            expect(U[0]).toBe(2);
            expect(U[1]).toBe(1);
        });
    });

    describe('add', () => {
        it('should add two matrices', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [5, 6, 7, 8];
            const result = mat2.create();

            mat2.add(result, a, b);
            expect(result).toEqual([6, 8, 10, 12]);
        });
    });

    describe('subtract', () => {
        it('should subtract second matrix from first', () => {
            const a: Mat2 = [5, 6, 7, 8];
            const b: Mat2 = [1, 2, 3, 4];
            const result = mat2.create();

            mat2.subtract(result, a, b);
            expect(result).toEqual([4, 4, 4, 4]);
        });
    });

    describe('exactEquals', () => {
        it('should return true for identical matrices', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [1, 2, 3, 4];

            expect(mat2.exactEquals(a, b)).toBe(true);
        });

        it('should return false for different matrices', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [1, 2, 3, 5];

            expect(mat2.exactEquals(a, b)).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for nearly equal matrices', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [1.0000001, 2.0000001, 3.0000001, 4.0000001];

            expect(mat2.equals(a, b)).toBe(true);
        });

        it('should return false for significantly different matrices', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [1, 2, 3, 5];

            expect(mat2.equals(a, b)).toBe(false);
        });
    });

    describe('multiplyScalar', () => {
        it('should multiply matrix by scalar', () => {
            const m: Mat2 = [1, 2, 3, 4];
            const result = mat2.create();

            mat2.multiplyScalar(result, m, 2);
            expect(result).toEqual([2, 4, 6, 8]);
        });
    });

    describe('multiplyScalarAndAdd', () => {
        it('should multiply second matrix by scalar and add to first', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [1, 1, 1, 1];
            const result = mat2.create();

            mat2.multiplyScalarAndAdd(result, a, b, 2);
            expect(result).toEqual([3, 4, 5, 6]);
        });
    });

    describe('aliases', () => {
        it('mul should be alias for multiply', () => {
            const a: Mat2 = [1, 2, 3, 4];
            const b: Mat2 = [5, 6, 7, 8];
            const result1 = mat2.create();
            const result2 = mat2.create();

            mat2.multiply(result1, a, b);
            mat2.mul(result2, a, b);

            expect(result1).toEqual(result2);
        });

        it('sub should be alias for subtract', () => {
            const a: Mat2 = [5, 6, 7, 8];
            const b: Mat2 = [1, 2, 3, 4];
            const result1 = mat2.create();
            const result2 = mat2.create();

            mat2.subtract(result1, a, b);
            mat2.sub(result2, a, b);

            expect(result1).toEqual(result2);
        });
    });
});
