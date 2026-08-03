import { describe, expect, it } from 'vitest';
import { vec3 } from '../../../src';
import type { Box3, Vec3 } from '../../../src/geometry';
import { raycast3 } from '../../../src/geometry';

describe('raycast3', () => {
    describe('intersectsTriangle', () => {
        it('DdN == 0 (ray parallel to triangle)', () => {
            const origin: Vec3 = [0, 0, 0];
            const direction: Vec3 = [0, 0, 0];

            const a: Vec3 = [1, 1, 0];
            const b: Vec3 = [0, 1, 1];
            const c: Vec3 = [1, 0, 1];

            const result = { hit: false, fraction: 0, frontFacing: false };
            raycast3.intersectsTriangle(result, origin, direction, 10, a, b, c, false);

            expect(result.hit).toBe(false);
        });

        it('DdN > 0, backfaceCulling = true (no intersection with backside)', () => {
            const origin: Vec3 = [0, 0, 0];
            const direction = vec3.normalize(vec3.create(), [1, 1, 1]);

            const a: Vec3 = [1, 1, 0];
            const b: Vec3 = [0, 1, 1];
            const c: Vec3 = [1, 0, 1];

            const result = { hit: false, fraction: 0, frontFacing: false };
            raycast3.intersectsTriangle(result, origin, direction, 10, a, b, c, true);

            expect(result.hit).toBe(false);
        });

        it('DdN > 0, backfaceCulling = false (successful backface intersection)', () => {
            const origin: Vec3 = [0, 0, 0];
            const direction = vec3.normalize(vec3.create(), [1, 1, 1]);

            const a: Vec3 = [1, 1, 0];
            const b: Vec3 = [0, 1, 1];
            const c: Vec3 = [1, 0, 1];

            const result = { hit: false, fraction: 0, frontFacing: false };
            raycast3.intersectsTriangle(result, origin, direction, 10, a, b, c, false);

            expect(result.hit).toBe(true);
            expect(result.frontFacing).toBe(false);
        });

        it('DdN > 0, DdQxE2 < 0 (no intersection)', () => {
            const origin: Vec3 = [0, 0, 0];
            const direction = vec3.normalize(vec3.create(), [1, 1, 1]);

            const a: Vec3 = [1, 1, 0];
            const b: Vec3 = [0, -1, -1];
            const c: Vec3 = [1, 0, 1];

            const result = { hit: false, fraction: 0, frontFacing: false };
            raycast3.intersectsTriangle(result, origin, direction, 10, a, b, c, false);

            expect(result.hit).toBe(false);
        });

        it('DdN > 0, DdE1xQ < 0 (no intersection)', () => {
            const origin: Vec3 = [0, 0, 0];
            const direction = vec3.normalize(vec3.create(), [1, 1, 1]);

            const a: Vec3 = [-1, -1, 0];
            const b: Vec3 = [0, -1, -1];
            const c: Vec3 = [1, 0, 1];

            const result = { hit: false, fraction: 0, frontFacing: false };
            raycast3.intersectsTriangle(result, origin, direction, 10, a, b, c, false);

            expect(result.hit).toBe(false);
        });

        it('DdN > 0, DdQxE2 + DdE1xQ > DdN (no intersection)', () => {
            const origin: Vec3 = [0, 0, 0];
            const direction = vec3.normalize(vec3.create(), [1, 1, 1]);

            const a: Vec3 = [-1, -1, 0];
            const b: Vec3 = [0, 1, 1];
            const c: Vec3 = [1, 0, 1];

            const result = { hit: false, fraction: 0, frontFacing: false };
            raycast3.intersectsTriangle(result, origin, direction, 10, a, b, c, false);

            expect(result.hit).toBe(false);
        });

        it('DdN < 0, QdN < 0 (no intersection when looking in wrong direction)', () => {
            const origin: Vec3 = [0, 0, 0];
            const direction = vec3.normalize(vec3.create(), [-1, -1, -1]);

            const a: Vec3 = [-1, -1, 0];
            const b: Vec3 = [0, -1, -1];
            const c: Vec3 = [1, 0, 1];

            const result = { hit: false, fraction: 0, frontFacing: false };
            raycast3.intersectsTriangle(result, origin, direction, 10, a, b, c, false);

            expect(result.hit).toBe(false);
        });
    });

    describe('intersectsBox3', () => {
        it('detects intersection with axis-aligned box in front of ray', () => {
            const box: Box3 = [-1, -1, 2, 1, 1, 4];

            expect(raycast3.intersectsBox3([0, 0, 0], [0, 0, 1], 10, box)).toBe(true);
        });

        it('returns false when box is behind ray origin', () => {
            const box: Box3 = [-1, -1, 0, 1, 1, 2];

            expect(raycast3.intersectsBox3([0, 0, 5], [0, 0, 1], 5, box)).toBe(false);
        });

        it('returns false when box is beyond ray length', () => {
            const box: Box3 = [-1, -1, 5, 1, 1, 7];

            expect(raycast3.intersectsBox3([0, 0, 0], [0, 0, 1], 2, box)).toBe(false);
        });

        it('detects intersection when ray origin is inside box', () => {
            const box: Box3 = [-1, -1, -1, 1, 1, 1];

            expect(raycast3.intersectsBox3([0, 0, 0], [0, 0, 1], 10, box)).toBe(true);
        });

        it('handles ray parallel to box faces (moving along x-axis)', () => {
            const box: Box3 = [-2, -1, -1, 2, 1, 1];

            expect(raycast3.intersectsBox3([0, 0, 0], [1, 0, 0], 10, box)).toBe(true);
        });

        it('returns false for ray parallel to box outside slab', () => {
            const box: Box3 = [-1, -1, -1, 1, 1, 1];

            expect(raycast3.intersectsBox3([0, 2, 0], [1, 0, 0], 10, box)).toBe(false);
        });

        it('detects intersection with diagonal ray through box', () => {
            const box: Box3 = [-1, -1, -1, 1, 1, 1];

            expect(raycast3.intersectsBox3([0, 0, 0], [1, 1, 1], 10, box)).toBe(true);
        });

        it('detects intersection when ray grazes box corner', () => {
            const box: Box3 = [-1, -1, -1, 1, 1, 1];

            expect(raycast3.intersectsBox3([-2, -2, -2], [1, 1, 1], 10, box)).toBe(true);
        });

        it('handles ray with negative direction components', () => {
            const box: Box3 = [-1, -1, -1, 1, 1, 1];

            expect(raycast3.intersectsBox3([2, 2, 2], [-1, -1, -1], 10, box)).toBe(true);
        });

        it('returns false when ray misses box entirely (x-axis)', () => {
            const box: Box3 = [0, -1, -1, 2, 1, 1];

            expect(raycast3.intersectsBox3([0, 2, 0], [1, 0, 0], 10, box)).toBe(false);
        });

        it('detects intersection at box boundary', () => {
            const box: Box3 = [-1, -1, -1, 1, 1, 1];

            expect(raycast3.intersectsBox3([-2, 0, 0], [1, 0, 0], 5, box)).toBe(true);
        });

        it('handles narrow boxes (line-like)', () => {
            const box: Box3 = [0, 0, 2, 0.1, 0.1, 4];

            expect(raycast3.intersectsBox3([0.2, 0.2, 0], [0, 0, 1], 10, box)).toBe(false);
        });
    });
});
