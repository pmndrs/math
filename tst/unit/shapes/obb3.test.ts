import { describe, expect, it } from 'vitest';
import * as euler from '../../../src/core/euler';
import * as mat3 from '../../../src/core/mat3';
import * as mat4 from '../../../src/core/mat4';
import * as quat from '../../../src/core/quat';
import * as vec3 from '../../../src/core/vec3';
import * as box3 from '../../../src/shapes/box3';
import * as obb3 from '../../../src/shapes/obb3';

describe('obb3', () => {
    describe('setFromBox3', () => {
        it('converts AABB to OBB with identity rotation', () => {
            const aabb = box3.create();
            box3.set(aabb, -1, -2, -3, 1, 2, 3);
            const obb = obb3.create();
            obb3.setFromBox3(obb, aabb);

            // Center should be at origin
            expect(obb.center[0]).toBeCloseTo(0);
            expect(obb.center[1]).toBeCloseTo(0);
            expect(obb.center[2]).toBeCloseTo(0);

            // Half extents should be half of the box dimensions
            expect(obb.halfExtents[0]).toBeCloseTo(1);
            expect(obb.halfExtents[1]).toBeCloseTo(2);
            expect(obb.halfExtents[2]).toBeCloseTo(3);

            // Should have identity rotation
            const identity = mat3.create();
            for (let i = 0; i < 9; i++) {
                expect(obb.rotation[i]).toBeCloseTo(identity[i]);
            }
        });
    });

    describe('containsPoint', () => {
        it('returns true for point inside axis-aligned OBB', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            expect(obb3.containsPoint(obb, [0, 0, 0])).toBe(true);
            expect(obb3.containsPoint(obb, [0.5, 0.5, 0.5])).toBe(true);
            expect(obb3.containsPoint(obb, [-0.5, -0.5, -0.5])).toBe(true);
        });

        it('returns false for point outside axis-aligned OBB', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            expect(obb3.containsPoint(obb, [2, 0, 0])).toBe(false);
            expect(obb3.containsPoint(obb, [0, 2, 0])).toBe(false);
            expect(obb3.containsPoint(obb, [0, 0, 2])).toBe(false);
        });

        it('returns true for point inside rotated OBB', () => {
            const obb = obb3.create();
            const rotation = quat.create();
            const eulerAngles = euler.fromValues(0, Math.PI / 4, 0, 'xyz'); // Rotate 45° around Y axis
            quat.fromEuler(rotation, eulerAngles);
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], rotation);

            expect(obb3.containsPoint(obb, [0, 0, 0])).toBe(true);
        });
    });

    describe('clampPoint', () => {
        it('clamps point to OBB surface', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const result = vec3.create();
            obb3.clampPoint(result, obb, [2, 0, 0]);

            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(0);
        });

        it('returns point if inside OBB', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const result = vec3.create();
            obb3.clampPoint(result, obb, [0.5, 0.5, 0.5]);

            expect(result[0]).toBeCloseTo(0.5);
            expect(result[1]).toBeCloseTo(0.5);
            expect(result[2]).toBeCloseTo(0.5);
        });

        it('clamps along a rotated axis (90° about Z, long side along world +Y)', () => {
            const obb = obb3.create();
            const rot = quat.create();
            quat.fromEuler(rot, euler.fromValues(0, 0, Math.PI / 2, 'xyz'));
            // half extents (2,1,1): after +90° about Z the "2" axis points along world +Y
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [2, 1, 1], rot);

            const result = vec3.create();
            obb3.clampPoint(result, obb, [0, 5, 0]);

            // projection onto the long (first) axis is 5, clamped to 2, back in world space → (0,2,0)
            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(2);
            expect(result[2]).toBeCloseTo(0);
        });

        it('does not corrupt the result when out === point (reads offset first)', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const p = vec3.fromValues(2, 0, 0);
            obb3.clampPoint(p, obb, p); // aliased out/point
            expect(p[0]).toBeCloseTo(1);
            expect(p[1]).toBeCloseTo(0);
            expect(p[2]).toBeCloseTo(0);
        });
    });

    describe('intersectsOBB', () => {
        it('returns true for overlapping axis-aligned OBBs', () => {
            const obb1 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb1, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const obb2 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb2, [0.5, 0.5, 0.5], [1, 1, 1], [0, 0, 0, 1]);

            expect(obb3.intersectsOBB3(obb1, obb2)).toBe(true);
        });

        it('returns false for non-overlapping axis-aligned OBBs', () => {
            const obb1 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb1, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const obb2 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb2, [3, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            expect(obb3.intersectsOBB3(obb1, obb2)).toBe(false);
        });

        it('returns true for touching OBBs', () => {
            const obb1 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb1, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const obb2 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb2, [2, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            expect(obb3.intersectsOBB3(obb1, obb2)).toBe(true);
        });

        it('returns true for overlapping rotated OBBs', () => {
            const obb1 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb1, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const rotation = quat.create();
            const eulerAngles = euler.fromValues(0, Math.PI / 4, 0, 'xyz');
            quat.fromEuler(rotation, eulerAngles);
            const obb2 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb2, [0, 0, 0], [1, 1, 1], rotation);

            expect(obb3.intersectsOBB3(obb1, obb2)).toBe(true);
        });

        it('returns false for two rotated OBBs separated by a large gap', () => {
            // both tilted 45° about Z so the R/AbsR/tInA path runs fully on a false result
            const rot = quat.create();
            quat.fromEuler(rot, euler.fromValues(0, 0, Math.PI / 4, 'xyz'));
            const obb1 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb1, [0, 0, 0], [1, 1, 1], rot);
            const obb2 = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb2, [10, 0, 0], [1, 1, 1], rot);

            expect(obb3.intersectsOBB3(obb1, obb2)).toBe(false);
        });
    });

    describe('intersectsBox3', () => {
        it('returns true for overlapping OBB and AABB', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const aabb = box3.create();
            box3.set(aabb, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5);

            expect(obb3.intersectsBox3(obb, aabb)).toBe(true);
        });

        it('returns false for non-overlapping OBB and AABB', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], [0, 0, 0, 1]);

            const aabb = box3.create();
            box3.set(aabb, 3, 3, 3, 4, 4, 4);

            expect(obb3.intersectsBox3(obb, aabb)).toBe(false);
        });
    });

    describe('applyMatrix4', () => {
        it('transforms center correctly with rotation', () => {
            // OBB at [1, 0, 0] with identity rotation
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [1, 0, 0], [0.5, 0.5, 0.5], [0, 0, 0, 1]);

            // 90° rotation around Z axis: (1,0,0) -> (0,1,0)
            const matrix = mat4.create();
            const rotation = quat.create();
            quat.fromEuler(rotation, euler.fromValues(0, 0, Math.PI / 2, 'xyz'));
            mat4.fromRotationTranslation(matrix, rotation, [0, 0, 0]);

            const result = obb3.create();
            obb3.applyMatrix4(result, obb, matrix);

            // Center should rotate from [1,0,0] to [0,1,0]
            expect(result.center[0]).toBeCloseTo(0);
            expect(result.center[1]).toBeCloseTo(1);
            expect(result.center[2]).toBeCloseTo(0);
        });

        it('transforms center correctly with translation', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [1, 2, 3], [0.5, 0.5, 0.5], [0, 0, 0, 1]);

            // Pure translation
            const matrix = mat4.create();
            mat4.fromTranslation(matrix, [10, 20, 30]);

            const result = obb3.create();
            obb3.applyMatrix4(result, obb, matrix);

            expect(result.center[0]).toBeCloseTo(11);
            expect(result.center[1]).toBeCloseTo(22);
            expect(result.center[2]).toBeCloseTo(33);
        });

        it('applies rotation in correct order', () => {
            // OBB rotated 90° around Y (X-axis points toward +Z)
            const obb = obb3.create();
            const obbRotation = quat.create();
            quat.fromEuler(obbRotation, euler.fromValues(0, Math.PI / 2, 0, 'xyz'));
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 1, 1], obbRotation);

            // Matrix: 90° rotation around Z (Y-axis points toward -X)
            const matrix = mat4.create();
            const matRotation = quat.create();
            quat.fromEuler(matRotation, euler.fromValues(0, 0, Math.PI / 2, 'xyz'));
            mat4.fromRotationTranslation(matrix, matRotation, [0, 0, 0]);

            const result = obb3.create();
            obb3.applyMatrix4(result, obb, matrix);

            // Combined rotation: first Y then Z
            // Original X-axis [1,0,0] -> after Y rot -> [0,0,-1] -> after Z rot -> [0,0,-1]
            // Original Y-axis [0,1,0] -> after Y rot -> [0,1,0] -> after Z rot -> [-1,0,0]
            // Original Z-axis [0,0,1] -> after Y rot -> [1,0,0] -> after Z rot -> [0,1,0]
            const r = result.rotation;
            expect(r[0]).toBeCloseTo(0); // X-axis x
            expect(r[1]).toBeCloseTo(0); // X-axis y
            expect(r[2]).toBeCloseTo(-1); // X-axis z
            expect(r[3]).toBeCloseTo(-1); // Y-axis x
            expect(r[4]).toBeCloseTo(0); // Y-axis y
            expect(r[5]).toBeCloseTo(0); // Y-axis z
        });

        it('scales half extents correctly', () => {
            const obb = obb3.create();
            obb3.setFromCenterHalfExtentsQuaternion(obb, [0, 0, 0], [1, 2, 3], [0, 0, 0, 1]);

            const matrix = mat4.create();
            mat4.fromScaling(matrix, [2, 3, 4]);

            const result = obb3.create();
            obb3.applyMatrix4(result, obb, matrix);

            expect(result.halfExtents[0]).toBeCloseTo(2);
            expect(result.halfExtents[1]).toBeCloseTo(6);
            expect(result.halfExtents[2]).toBeCloseTo(12);
        });
    });
});
