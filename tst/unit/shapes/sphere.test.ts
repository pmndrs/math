import { describe, expect, it } from 'vitest';
import type { Sphere, Vec3 } from '../../../src/shapes';
import { sphere } from '../../../src/shapes';

describe('sphere', () => {
    describe('create', () => {
        it('should create a unit sphere at the origin', () => {
            const s = sphere.create();

            expect(s.center).toEqual([0, 0, 0]);
            expect(s.radius).toBe(1);
        });
    });

    describe('containsPoint', () => {
        it('should return true when the point is inside the sphere', () => {
            const s: Sphere = { center: [0, 0, 0], radius: 2 };
            const point: Vec3 = [1, 1, 0];

            expect(sphere.containsPoint(s, point)).toBe(true);
        });

        it('should return true when the point is exactly on the surface', () => {
            const s: Sphere = { center: [0, 0, 0], radius: 2 };
            const point: Vec3 = [2, 0, 0];

            expect(sphere.containsPoint(s, point)).toBe(true);
        });

        it('should return false when the point is outside the sphere', () => {
            const s: Sphere = { center: [0, 0, 0], radius: 2 };
            const point: Vec3 = [2, 2, 2];

            expect(sphere.containsPoint(s, point)).toBe(false);
        });

        it('should respect a non-origin center', () => {
            const s: Sphere = { center: [5, 0, 0], radius: 1 };

            expect(sphere.containsPoint(s, [5.5, 0, 0])).toBe(true);
            expect(sphere.containsPoint(s, [0, 0, 0])).toBe(false);
        });
    });
});
