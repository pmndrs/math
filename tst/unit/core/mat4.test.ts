import { describe, expect, it } from 'vitest';
import type { Mat4, Vec3 } from '../../../src';
import { mat4, quat } from '../../../src';

describe('mat4', () => {
    describe('create', () => {
        it('should create identity matrix', () => {
            const result = mat4.create();
            expect(result).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        });
    });

    describe('clone', () => {
        it('should clone matrix', () => {
            const m: Mat4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            const result = mat4.clone(m);

            expect(result).toEqual(m);
            expect(result).not.toBe(m);
        });
    });

    describe('copy', () => {
        it('should copy values from one matrix to another', () => {
            const src: Mat4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            const dst: Mat4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            const result = mat4.copy(dst, src);
            expect(result).toEqual(src);
            expect(result).toBe(dst);
        });
    });

    describe('fromValues', () => {
        it('should create matrix from values', () => {
            const result = mat4.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
            expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
        });
    });

    describe('set', () => {
        it('should set matrix values', () => {
            const m: Mat4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            const result = mat4.set(m, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

            expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
            expect(result).toBe(m);
        });
    });

    describe('identity', () => {
        it('should set matrix to identity', () => {
            const m: Mat4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            const result = mat4.identity(m);

            expect(result).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(result).toBe(m);
        });
    });

    describe('transpose', () => {
        it('should transpose matrix', () => {
            const m: Mat4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            const result = mat4.create();

            mat4.transpose(result, m);
            expect(result).toEqual([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);
        });

        it('should transpose in place', () => {
            const m: Mat4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

            mat4.transpose(m, m);
            expect(m).toEqual([1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);
        });
    });

    describe('invert', () => {
        it('should invert identity matrix', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.create();

            const inverted = mat4.invert(result, m);
            expect(inverted).not.toBeNull();
            expect(result).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        });

        it('should return null for non-invertible matrix', () => {
            const m: Mat4 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; // Zero row
            const result = mat4.create();

            const inverted = mat4.invert(result, m);
            expect(inverted).toBeNull();
        });

        it('should verify identity when multiplying by inverse', () => {
            const m = mat4.create();
            mat4.translate(m, m, [2, 3, 4]);
            mat4.rotateZ(m, m, Math.PI / 4);

            const inverse = mat4.create();
            const identity = mat4.create();

            mat4.invert(inverse, m);
            mat4.multiply(identity, m, inverse);

            // Should be approximately identity
            expect(identity[0]).toBeCloseTo(1);
            expect(identity[5]).toBeCloseTo(1);
            expect(identity[10]).toBeCloseTo(1);
            expect(identity[15]).toBeCloseTo(1);
            expect(identity[1]).toBeCloseTo(0);
            expect(identity[2]).toBeCloseTo(0);
        });
    });

    describe('determinant', () => {
        it('should calculate determinant of identity', () => {
            const m = mat4.identity(mat4.create());
            const det = mat4.determinant(m);

            expect(det).toBe(1);
        });

        it('should return 0 for singular matrix', () => {
            const m: Mat4 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
            const det = mat4.determinant(m);

            expect(det).toBe(0);
        });
    });

    describe('multiply', () => {
        it('should multiply two matrices', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());
            mat4.translate(b, b, [1, 2, 3]);
            const result = mat4.create();

            mat4.multiply(result, a, b);
            expect(result[12]).toBe(1);
            expect(result[13]).toBe(2);
            expect(result[14]).toBe(3);
        });

        it('should work with identity matrix', () => {
            const m = mat4.fromValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
            const identity = mat4.identity(mat4.create());
            const result = mat4.create();

            mat4.multiply(result, m, identity);
            expect(result).toEqual(m);
        });
    });

    describe('translate', () => {
        it('should translate matrix by vector', () => {
            const m = mat4.identity(mat4.create());
            const translation: Vec3 = [5, 3, 2];
            const result = mat4.create();

            mat4.translate(result, m, translation);
            expect(result[12]).toBe(5);
            expect(result[13]).toBe(3);
            expect(result[14]).toBe(2);
        });

        it('should accumulate translations', () => {
            const m = mat4.identity(mat4.create());
            mat4.translate(m, m, [1, 2, 3]);
            mat4.translate(m, m, [4, 5, 6]);

            expect(m[12]).toBe(5); // 1 + 4
            expect(m[13]).toBe(7); // 2 + 5
            expect(m[14]).toBe(9); // 3 + 6
        });
    });

    describe('scale', () => {
        it('should scale matrix by vector', () => {
            const m = mat4.identity(mat4.create());
            const scale: Vec3 = [2, 3, 4];
            const result = mat4.create();

            mat4.scale(result, m, scale);
            expect(result[0]).toBe(2);
            expect(result[5]).toBe(3);
            expect(result[10]).toBe(4);
        });
    });

    describe('rotate', () => {
        it('should rotate matrix around axis', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.create();
            const axis: Vec3 = [0, 0, 1];
            const angle = Math.PI / 2;

            const rotated = mat4.rotate(result, m, angle, axis);
            expect(rotated).not.toBeNull();
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(1, 5);
            expect(result[4]).toBeCloseTo(-1, 5);
            expect(result[5]).toBeCloseTo(0, 5);
        });

        it('should return null for zero-length axis', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.create();
            const axis: Vec3 = [0, 0, 0];

            const rotated = mat4.rotate(result, m, Math.PI / 2, axis);
            expect(rotated).toBeNull();
        });
    });

    describe('rotateX', () => {
        it('should rotate matrix around X axis', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.create();
            const angle = Math.PI / 2;

            mat4.rotateX(result, m, angle);
            expect(result[5]).toBeCloseTo(0, 5);
            expect(result[6]).toBeCloseTo(1, 5);
            expect(result[9]).toBeCloseTo(-1, 5);
            expect(result[10]).toBeCloseTo(0, 5);
        });
    });

    describe('rotateY', () => {
        it('should rotate matrix around Y axis', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.create();
            const angle = Math.PI / 2;

            mat4.rotateY(result, m, angle);
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[2]).toBeCloseTo(-1, 5);
            expect(result[8]).toBeCloseTo(1, 5);
            expect(result[10]).toBeCloseTo(0, 5);
        });
    });

    describe('rotateZ', () => {
        it('should rotate matrix around Z axis', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.create();
            const angle = Math.PI / 2;

            mat4.rotateZ(result, m, angle);
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(1, 5);
            expect(result[4]).toBeCloseTo(-1, 5);
            expect(result[5]).toBeCloseTo(0, 5);
        });
    });

    describe('fromTranslation', () => {
        it('should create translation matrix from vector', () => {
            const result = mat4.create();
            const translation: Vec3 = [5, 3, 2];

            mat4.fromTranslation(result, translation);
            expect(result[12]).toBe(5);
            expect(result[13]).toBe(3);
            expect(result[14]).toBe(2);
            expect(result[15]).toBe(1);
        });
    });

    describe('fromScaling', () => {
        it('should create scaling matrix from vector', () => {
            const result = mat4.create();
            const scale: Vec3 = [2, 3, 4];

            mat4.fromScaling(result, scale);
            expect(result[0]).toBe(2);
            expect(result[5]).toBe(3);
            expect(result[10]).toBe(4);
            expect(result[15]).toBe(1);
        });
    });

    describe('fromRotation', () => {
        it('should create rotation matrix from axis and angle', () => {
            const result = mat4.create();
            const axis: Vec3 = [0, 0, 1];
            const angle = Math.PI / 2;

            const rotated = mat4.fromRotation(result, angle, axis);
            expect(rotated).not.toBeNull();
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(1, 5);
            expect(result[4]).toBeCloseTo(-1, 5);
            expect(result[5]).toBeCloseTo(0, 5);
        });
    });

    describe('fromXRotation', () => {
        it('should create X rotation matrix', () => {
            const result = mat4.create();
            const angle = Math.PI / 2;

            mat4.fromXRotation(result, angle);
            expect(result[5]).toBeCloseTo(0, 5);
            expect(result[6]).toBeCloseTo(1, 5);
            expect(result[9]).toBeCloseTo(-1, 5);
            expect(result[10]).toBeCloseTo(0, 5);
        });
    });

    describe('fromYRotation', () => {
        it('should create Y rotation matrix', () => {
            const result = mat4.create();
            const angle = Math.PI / 2;

            mat4.fromYRotation(result, angle);
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[2]).toBeCloseTo(-1, 5);
            expect(result[8]).toBeCloseTo(1, 5);
            expect(result[10]).toBeCloseTo(0, 5);
        });
    });

    describe('fromZRotation', () => {
        it('should create Z rotation matrix', () => {
            const result = mat4.create();
            const angle = Math.PI / 2;

            mat4.fromZRotation(result, angle);
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(1, 5);
            expect(result[4]).toBeCloseTo(-1, 5);
            expect(result[5]).toBeCloseTo(0, 5);
        });
    });

    describe('fromRotationTranslation', () => {
        it('should create matrix from quaternion and translation', () => {
            const result = mat4.create();
            const q = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const v: Vec3 = [5, 3, 2];

            mat4.fromRotationTranslation(result, q, v);

            // Should have rotation
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(1, 5);

            // Should have translation
            expect(result[12]).toBe(5);
            expect(result[13]).toBe(3);
            expect(result[14]).toBe(2);
        });
    });

    describe('getTranslation', () => {
        it('should extract translation from matrix', () => {
            const m = mat4.identity(mat4.create());
            mat4.translate(m, m, [5, 3, 2]);

            const result: Vec3 = [0, 0, 0];
            mat4.getTranslation(result, m);

            expect(result).toEqual([5, 3, 2]);
        });
    });

    describe('getScaling', () => {
        it('should extract scaling from matrix', () => {
            const m = mat4.identity(mat4.create());
            mat4.scale(m, m, [2, 3, 4]);

            const result: Vec3 = [0, 0, 0];
            mat4.getScaling(result, m);

            expect(result[0]).toBeCloseTo(2);
            expect(result[1]).toBeCloseTo(3);
            expect(result[2]).toBeCloseTo(4);
        });
    });

    describe('getRotation', () => {
        it('should extract rotation quaternion from matrix', () => {
            const q = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 4);
            const m = mat4.fromQuat(mat4.create(), q);

            const result = quat.create();
            mat4.getRotation(result, m);

            // Should be approximately the same quaternion
            const dotProduct = Math.abs(quat.dot(q, result));
            expect(dotProduct).toBeCloseTo(1, 4);
        });
    });

    describe('decompose', () => {
        it('should decompose matrix into rotation, translation, and scale', () => {
            const originalQ = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 4);
            const originalT: Vec3 = [5, 3, 2];
            const originalS: Vec3 = [2, 1.5, 0.8];

            const m = mat4.fromRotationTranslationScale(mat4.create(), originalQ, originalT, originalS);

            const resultQ = quat.create();
            const resultT: Vec3 = [0, 0, 0];
            const resultS: Vec3 = [0, 0, 0];

            mat4.decompose(resultQ, resultT, resultS, m);

            expect(resultT[0]).toBeCloseTo(originalT[0]);
            expect(resultT[1]).toBeCloseTo(originalT[1]);
            expect(resultT[2]).toBeCloseTo(originalT[2]);

            expect(resultS[0]).toBeCloseTo(originalS[0]);
            expect(resultS[1]).toBeCloseTo(originalS[1]);
            expect(resultS[2]).toBeCloseTo(originalS[2]);
        });
    });

    describe('fromRotationTranslationScale', () => {
        it('should create matrix from rotation, translation, and scale', () => {
            const q = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const t: Vec3 = [5, 3, 2];
            const s: Vec3 = [2, 1.5, 0.8];

            const result = mat4.create();
            mat4.fromRotationTranslationScale(result, q, t, s);

            // Should have translation
            expect(result[12]).toBe(5);
            expect(result[13]).toBe(3);
            expect(result[14]).toBe(2);

            // Should have scaling incorporated into rotation
            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(2, 5); // scaled by 2
        });
    });

    describe('fromQuat', () => {
        it('should create rotation matrix from quaternion', () => {
            const q = quat.setAxisAngle(quat.create(), [0, 0, 1], Math.PI / 2);
            const result = mat4.create();

            mat4.fromQuat(result, q);

            expect(result[0]).toBeCloseTo(0, 5);
            expect(result[1]).toBeCloseTo(1, 5);
            expect(result[4]).toBeCloseTo(-1, 5);
            expect(result[5]).toBeCloseTo(0, 5);
            expect(result[15]).toBe(1);
        });
    });

    describe('frustumNO', () => {
        it('should create frustum projection matrix', () => {
            const result = mat4.create();

            mat4.frustumNO(result, -1, 1, -1, 1, 1, 100);

            expect(result[0]).toBe(1);
            expect(result[5]).toBe(1);
            expect(result[10]).toBeCloseTo(-1.0202020202020203);
            expect(result[14]).toBe(-2.0202020202020203);
        });
    });

    describe('perspectiveNO', () => {
        it('should create perspective projection matrix', () => {
            const result = mat4.create();
            const fovy = Math.PI / 4;
            const aspect = 16 / 9;
            const near = 0.1;
            const far = 100;

            mat4.perspectiveNO(result, fovy, aspect, near, far);

            expect(result[5]).toBeCloseTo(1 / Math.tan(fovy / 2));
            expect(result[0]).toBeCloseTo(1 / Math.tan(fovy / 2) / aspect);
            expect(result[15]).toBe(0);
        });
    });

    describe('orthoNO', () => {
        it('should create orthographic projection matrix', () => {
            const result = mat4.create();

            mat4.orthoNO(result, -10, 10, -10, 10, 0.1, 100);

            expect(result[0]).toBeCloseTo(0.1);
            expect(result[5]).toBeCloseTo(0.1);
            expect(result[10]).toBeCloseTo(-2 / 99.9);
            expect(result[15]).toBe(1);
        });
    });

    describe('lookAt', () => {
        it('should create look-at view matrix', () => {
            const result = mat4.create();
            const eye: Vec3 = [0, 0, 5];
            const center: Vec3 = [0, 0, 0];
            const up: Vec3 = [0, 1, 0];

            mat4.lookAt(result, eye, center, up);

            // Should translate eye to origin
            expect(result[14]).toBeCloseTo(-5);
            expect(result[15]).toBe(1);
        });
    });

    describe('targetTo', () => {
        it('should create target-to matrix', () => {
            const result = mat4.create();
            const eye: Vec3 = [0, 0, 5];
            const target: Vec3 = [0, 0, 0];
            const up: Vec3 = [0, 1, 0];

            mat4.targetTo(result, eye, target, up);

            // Should be positioned at eye
            expect(result[12]).toBe(0);
            expect(result[13]).toBe(0);
            expect(result[14]).toBe(5);
        });
    });

    describe('str', () => {
        it('should return string representation', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.str(m);

            expect(result).toBe('mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
        });
    });

    describe('frob', () => {
        it('should calculate Frobenius norm', () => {
            const m = mat4.identity(mat4.create());
            const norm = mat4.frob(m);

            expect(norm).toBe(2); // sqrt(4) for identity matrix
        });
    });

    describe('add', () => {
        it('should add two matrices', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());
            const result = mat4.create();

            mat4.add(result, a, b);
            expect(result[0]).toBe(2);
            expect(result[5]).toBe(2);
            expect(result[10]).toBe(2);
            expect(result[15]).toBe(2);
        });
    });

    describe('subtract', () => {
        it('should subtract second matrix from first', () => {
            const a = mat4.identity(mat4.create());
            mat4.multiplyScalar(a, a, 3);
            const b = mat4.identity(mat4.create());
            const result = mat4.create();

            mat4.subtract(result, a, b);
            expect(result[0]).toBe(2);
            expect(result[5]).toBe(2);
            expect(result[10]).toBe(2);
            expect(result[15]).toBe(2);
        });
    });

    describe('multiplyScalar', () => {
        it('should multiply matrix by scalar', () => {
            const m = mat4.identity(mat4.create());
            const result = mat4.create();

            mat4.multiplyScalar(result, m, 3);
            expect(result[0]).toBe(3);
            expect(result[5]).toBe(3);
            expect(result[10]).toBe(3);
            expect(result[15]).toBe(3);
        });
    });

    describe('multiplyScalarAndAdd', () => {
        it('should multiply second matrix by scalar and add to first', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());
            const result = mat4.create();

            mat4.multiplyScalarAndAdd(result, a, b, 2);
            expect(result[0]).toBe(3);
            expect(result[5]).toBe(3);
            expect(result[10]).toBe(3);
            expect(result[15]).toBe(3);
        });
    });

    describe('exactEquals', () => {
        it('should return true for identical matrices', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());

            expect(mat4.exactEquals(a, b)).toBe(true);
        });

        it('should return false for different matrices', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());
            b[0] = 2;

            expect(mat4.exactEquals(a, b)).toBe(false);
        });
    });

    describe('equals', () => {
        it('should return true for nearly equal matrices', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());
            b[0] = 1.0000001;

            expect(mat4.equals(a, b)).toBe(true);
        });

        it('should return false for significantly different matrices', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());
            b[0] = 2;

            expect(mat4.equals(a, b)).toBe(false);
        });
    });

    describe('aliases', () => {
        it('mul should be alias for multiply', () => {
            const a = mat4.identity(mat4.create());
            const b = mat4.identity(mat4.create());
            mat4.translate(b, b, [1, 2, 3]);
            const result1 = mat4.create();
            const result2 = mat4.create();

            mat4.multiply(result1, a, b);
            mat4.mul(result2, a, b);

            expect(result1).toEqual(result2);
        });

        it('sub should be alias for subtract', () => {
            const a = mat4.identity(mat4.create());
            mat4.multiplyScalar(a, a, 3);
            const b = mat4.identity(mat4.create());
            const result1 = mat4.create();
            const result2 = mat4.create();

            mat4.subtract(result1, a, b);
            mat4.sub(result2, a, b);

            expect(result1).toEqual(result2);
        });
    });

    describe('perspective variants', () => {
        it('perspectiveZO should create zero-to-one depth range perspective', () => {
            const result = mat4.create();
            mat4.perspectiveZO(result, Math.PI / 4, 16 / 9, 0.1, 100);

            expect(result[15]).toBe(0);
            expect(result[10]).not.toBe(mat4.perspectiveNO(mat4.create(), Math.PI / 4, 16 / 9, 0.1, 100)[10]);
        });

        it('orthoZO should create zero-to-one depth range orthographic', () => {
            const result = mat4.create();
            mat4.orthoZO(result, -1, 1, -1, 1, 0.1, 100);

            expect(result[15]).toBe(1);
            expect(result[10]).not.toBe(mat4.orthoNO(mat4.create(), -1, 1, -1, 1, 0.1, 100)[10]);
        });

        it('frustumZO should create zero-to-one depth range frustum', () => {
            const result = mat4.create();
            mat4.frustumZO(result, -1, 1, -1, 1, 1, 100);

            expect(result[15]).toBe(0);
            expect(result[10]).toBeCloseTo(100 / (1 - 100));
            expect(result[14]).toBeCloseTo((100 * 1) / (1 - 100));
            expect(result[10]).not.toBe(mat4.frustumNO(mat4.create(), -1, 1, -1, 1, 1, 100)[10]);
        });

        it('perspectiveFromFieldOfViewNO should create negative-one-to-one depth range projection', () => {
            const result = mat4.create();
            const fov = { upDegrees: 30, downDegrees: 30, leftDegrees: 40, rightDegrees: 40 };
            mat4.perspectiveFromFieldOfViewNO(result, fov, 0.1, 100);

            expect(result[15]).toBe(0);
            expect(result[11]).toBe(-1);
            expect(result[10]).toBeCloseTo((100 + 0.1) / (0.1 - 100));
            expect(result[14]).toBeCloseTo((2 * 100 * 0.1) / (0.1 - 100));
        });

        it('perspectiveFromFieldOfViewZO should create zero-to-one depth range projection', () => {
            const result = mat4.create();
            const fov = { upDegrees: 30, downDegrees: 30, leftDegrees: 40, rightDegrees: 40 };
            mat4.perspectiveFromFieldOfViewZO(result, fov, 0.1, 100);

            expect(result[15]).toBe(0);
            expect(result[11]).toBe(-1);
            expect(result[10]).toBeCloseTo(100 / (0.1 - 100));
            expect(result[14]).toBeCloseTo((100 * 0.1) / (0.1 - 100));
            expect(result[10]).not.toBe(
                mat4.perspectiveFromFieldOfViewNO(mat4.create(), fov, 0.1, 100)[10],
            );
        });
    });

    describe('transformation composition', () => {
        it('should correctly compose translate, rotate, and scale', () => {
            const translate = mat4.fromTranslation(mat4.create(), [5, 3, 2]);
            const rotate = mat4.fromZRotation(mat4.create(), Math.PI / 4);
            const scale = mat4.fromScaling(mat4.create(), [2, 1.5, 0.8]);

            const composed = mat4.create();
            mat4.multiply(composed, translate, rotate);
            mat4.multiply(composed, composed, scale);

            // Should be a valid transformation matrix
            expect(mat4.determinant(composed)).not.toBe(0);

            // Should preserve translation
            expect(composed[12]).toBe(5);
            expect(composed[13]).toBe(3);
            expect(composed[14]).toBe(2);
        });

        it('should handle complex transformation chains', () => {
            const m = mat4.identity(mat4.create());

            // Build a complex transformation
            mat4.translate(m, m, [10, 5, 3]);
            mat4.rotateX(m, m, Math.PI / 6);
            mat4.rotateY(m, m, Math.PI / 4);
            mat4.rotateZ(m, m, Math.PI / 3);
            mat4.scale(m, m, [2, 1.5, 0.5]);

            // Should still be a valid matrix
            expect(mat4.determinant(m)).not.toBe(0);
            expect(m[15]).toBe(1);
        });
    });
});
