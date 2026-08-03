import { describe, expect, it } from 'vitest';
import type { Mat2d, Vec2 } from '../../../src';
import { mat2d } from '../../../src';

describe('mat2d', () => {
    describe('create', () => {
        it('should create identity matrix', () => {
            const result = mat2d.create();
            expect(result).toEqual([1, 0, 0, 1, 0, 0]);
        });
    });

    describe('clone', () => {
        it('should clone matrix', () => {
            const m: Mat2d = [1, 2, 3, 4, 5, 6];
            const result = mat2d.clone(m);

            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
            expect(result).not.toBe(m);
        });
    });

    describe('copy', () => {
        it('should copy values from one matrix to another', () => {
            const src: Mat2d = [1, 2, 3, 4, 5, 6];
            const dst: Mat2d = [0, 0, 0, 0, 0, 0];

            const result = mat2d.copy(dst, src);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
            expect(result).toBe(dst);
        });
    });

    describe('identity', () => {
        it('should set matrix to identity', () => {
            const m: Mat2d = [1, 2, 3, 4, 5, 6];
            const result = mat2d.identity(m);

            expect(result).toEqual([1, 0, 0, 1, 0, 0]);
            expect(result).toBe(m);
        });
    });

    describe('fromValues', () => {
        it('should create matrix from values', () => {
            const result = mat2d.fromValues(1, 2, 3, 4, 5, 6);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        });
    });

    describe('set', () => {
        it('should set matrix values', () => {
            const m: Mat2d = [0, 0, 0, 0, 0, 0];
            const result = mat2d.set(m, 1, 2, 3, 4, 5, 6);

            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
            expect(result).toBe(m);
        });
    });

    describe('invert', () => {
        it('should invert matrix', () => {
            const m: Mat2d = [1, 0, 0, 1, 2, 3]; // Identity with translation
            const result = mat2d.create();

            const inverted = mat2d.invert(result, m);
            expect(inverted).not.toBeNull();
            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(0);
            expect(result[3]).toBeCloseTo(1);
            expect(result[4]).toBeCloseTo(-2);
            expect(result[5]).toBeCloseTo(-3);
        });

        it('should return null for non-invertible matrix', () => {
            const m: Mat2d = [1, 2, 2, 4, 0, 0]; // Determinant = 0
            const result = mat2d.create();

            const inverted = mat2d.invert(result, m);
            expect(inverted).toBeNull();
        });

        it('should verify identity when multiplying by inverse', () => {
            const m: Mat2d = [2, 1, 1, 1, 5, 3];
            const inverse = mat2d.create();
            const identity = mat2d.create();

            mat2d.invert(inverse, m);
            mat2d.multiply(identity, m, inverse);

            expect(identity[0]).toBeCloseTo(1);
            expect(identity[1]).toBeCloseTo(0);
            expect(identity[2]).toBeCloseTo(0);
            expect(identity[3]).toBeCloseTo(1);
            expect(identity[4]).toBeCloseTo(0);
            expect(identity[5]).toBeCloseTo(0);
        });
    });

    describe('determinant', () => {
        it('should calculate determinant', () => {
            const m: Mat2d = [1, 2, 3, 4, 5, 6];
            const det = mat2d.determinant(m);

            expect(det).toBe(-2);
        });

        it('should return 0 for singular matrix', () => {
            const m: Mat2d = [1, 2, 2, 4, 0, 0];
            const det = mat2d.determinant(m);

            expect(det).toBe(0);
        });
    });

    describe('multiply', () => {
        it('should multiply two matrices', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [2, 0, 0, 2, 1, 1];
            const result = mat2d.create();

            mat2d.multiply(result, a, b);
            expect(result[0]).toBeCloseTo(2);
            expect(result[1]).toBeCloseTo(4);
            expect(result[2]).toBeCloseTo(6);
            expect(result[3]).toBeCloseTo(8);
            expect(result[4]).toBeCloseTo(9);
            expect(result[5]).toBeCloseTo(12);
        });

        it('should work with identity matrix', () => {
            const m: Mat2d = [1, 2, 3, 4, 5, 6];
            const identity = mat2d.identity(mat2d.create());
            const result = mat2d.create();

            mat2d.multiply(result, m, identity);
            expect(result).toEqual([1, 2, 3, 4, 5, 6]);
        });
    });

    describe('rotate', () => {
        it('should rotate matrix by given angle', () => {
            const m = mat2d.identity(mat2d.create());
            const result = mat2d.create();
            const angle = Math.PI / 2; // 90 degrees

            mat2d.rotate(result, m, angle);

            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(1, 5);
            expect(result[2]).toBeCloseTo(-1, 5);
            expect(result[3]).toBeCloseTo(0, 5);
            expect(result[4]).toBe(0); // Translation unchanged
            expect(result[5]).toBe(0);
        });

        it('should preserve translation when rotating', () => {
            const m: Mat2d = [1, 0, 0, 1, 5, 3];
            const result = mat2d.create();
            const angle = Math.PI / 4;

            mat2d.rotate(result, m, angle);

            expect(result[4]).toBe(5); // Translation preserved
            expect(result[5]).toBe(3);
        });
    });

    describe('scale', () => {
        it('should scale matrix by vector', () => {
            const m = mat2d.identity(mat2d.create());
            const scale: Vec2 = [2, 3];
            const result = mat2d.create();

            mat2d.scale(result, m, scale);
            expect(result[0]).toBe(2);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(3);
            expect(result[4]).toBe(0); // Translation unchanged
            expect(result[5]).toBe(0);
        });
    });

    describe('translate', () => {
        it('should translate matrix by vector', () => {
            const m = mat2d.identity(mat2d.create());
            const translation: Vec2 = [5, 3];
            const result = mat2d.create();

            mat2d.translate(result, m, translation);
            expect(result[0]).toBe(1);
            expect(result[1]).toBe(0);
            expect(result[2]).toBe(0);
            expect(result[3]).toBe(1);
            expect(result[4]).toBe(5);
            expect(result[5]).toBe(3);
        });

        it('should accumulate translations', () => {
            const m: Mat2d = [1, 0, 0, 1, 2, 1];
            const translation: Vec2 = [3, 2];
            const result = mat2d.create();

            mat2d.translate(result, m, translation);
            expect(result[4]).toBe(5); // 2 + 3
            expect(result[5]).toBe(3); // 1 + 2
        });
    });

    describe('fromRotation', () => {
        it('should create rotation matrix from angle', () => {
            const result = mat2d.create();
            const angle = Math.PI / 4; // 45 degrees

            mat2d.fromRotation(result, angle);

            const cos45 = Math.cos(angle);
            const sin45 = Math.sin(angle);
            expect(result[0]).toBeCloseTo(cos45);
            expect(result[1]).toBeCloseTo(sin45);
            expect(result[2]).toBeCloseTo(-sin45);
            expect(result[3]).toBeCloseTo(cos45);
            expect(result[4]).toBe(0);
            expect(result[5]).toBe(0);
        });
    });

    describe('fromScaling', () => {
        it('should create scaling matrix from vector', () => {
            const result = mat2d.create();
            const scale: Vec2 = [2, 3];

            mat2d.fromScaling(result, scale);
            expect(result).toEqual([2, 0, 0, 3, 0, 0]);
        });
    });

    describe('fromTranslation', () => {
        it('should create translation matrix from vector', () => {
            const result = mat2d.create();
            const translation: Vec2 = [5, 3];

            mat2d.fromTranslation(result, translation);
            expect(result).toEqual([1, 0, 0, 1, 5, 3]);
        });
    });

    describe('str', () => {
        it('should return string representation', () => {
            const m: Mat2d = [1, 2, 3, 4, 5, 6];
            const result = mat2d.str(m);

            expect(result).toBe('mat2d(1, 2, 3, 4, 5, 6)');
        });
    });

    describe('frob', () => {
        it('should calculate Frobenius norm', () => {
            const m: Mat2d = [1, 2, 3, 4, 5, 6];
            const norm = mat2d.frob(m);

            expect(norm).toBeCloseTo(Math.sqrt(92)); // sqrt(1+4+9+16+25+36+1)
        });
    });

    describe('add', () => {
        it('should add two matrices', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [1, 1, 1, 1, 1, 1];
            const result = mat2d.create();

            mat2d.add(result, a, b);
            expect(result).toEqual([2, 3, 4, 5, 6, 7]);
        });
    });

    describe('subtract', () => {
        it('should subtract second matrix from first', () => {
            const a: Mat2d = [5, 6, 7, 8, 9, 10];
            const b: Mat2d = [1, 2, 3, 4, 5, 6];
            const result = mat2d.create();

            mat2d.subtract(result, a, b);
            expect(result).toEqual([4, 4, 4, 4, 4, 4]);
        });
    });

    describe('multiplyScalar', () => {
        it('should multiply matrix by scalar', () => {
            const m: Mat2d = [1, 2, 3, 4, 5, 6];
            const result = mat2d.create();

            mat2d.multiplyScalar(result, m, 2);
            expect(result).toEqual([2, 4, 6, 8, 10, 12]);
        });
    });

    describe('multiplyScalarAndAdd', () => {
        it('should multiply second matrix by scalar and add to first', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [1, 1, 1, 1, 1, 1];
            const result = mat2d.create();

            mat2d.multiplyScalarAndAdd(result, a, b, 2);
            expect(result).toEqual([3, 4, 5, 6, 7, 8]);
        });
    });

    describe('exactEquals', () => {
        it('should return true for identical matrices', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [1, 2, 3, 4, 5, 6];

            expect(mat2d.exactEquals(a, b)).toBe(true);
        });

        it('should return false for different matrices', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [1, 2, 3, 4, 5, 7];

            expect(mat2d.exactEquals(a, b)).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for nearly equal matrices', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [1.0000001, 2.0000001, 3.0000001, 4.0000001, 5.0000001, 6.0000001];

            expect(mat2d.equals(a, b)).toBe(true);
        });

        it('should return false for significantly different matrices', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [1, 2, 3, 4, 5, 7];

            expect(mat2d.equals(a, b)).toBe(false);
        });
    });

    describe('aliases', () => {
        it('mul should be alias for multiply', () => {
            const a: Mat2d = [1, 2, 3, 4, 5, 6];
            const b: Mat2d = [2, 0, 0, 2, 1, 1];
            const result1 = mat2d.create();
            const result2 = mat2d.create();

            mat2d.multiply(result1, a, b);
            mat2d.mul(result2, a, b);

            expect(result1).toEqual(result2);
        });

        it('sub should be alias for subtract', () => {
            const a: Mat2d = [5, 6, 7, 8, 9, 10];
            const b: Mat2d = [1, 2, 3, 4, 5, 6];
            const result1 = mat2d.create();
            const result2 = mat2d.create();

            mat2d.subtract(result1, a, b);
            mat2d.sub(result2, a, b);

            expect(result1).toEqual(result2);
        });
    });

    describe('transformation composition', () => {
        it('should combine translation, rotation, and scaling correctly', () => {
            const translate = mat2d.fromTranslation(mat2d.create(), [5, 3]);
            const rotate = mat2d.fromRotation(mat2d.create(), Math.PI / 4);
            const scale = mat2d.fromScaling(mat2d.create(), [2, 1.5]);

            const composed = mat2d.create();
            mat2d.multiply(composed, translate, rotate);
            mat2d.multiply(composed, composed, scale);

            // Should be a valid transformation matrix
            expect(mat2d.determinant(composed)).not.toBe(0);

            // Should preserve structure of 2D transformation
            expect(composed.length).toBe(6);
        });
    });
});
