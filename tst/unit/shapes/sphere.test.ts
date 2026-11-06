import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../../src';
import type { Sphere } from '../../../src/shapes';
import { sphere } from '../../../src/shapes';

describe('sphere', () => {
    describe('create', () => {
        it('should create a unit sphere at the origin', () => {
            const s = sphere.create();

            expect(s.center).toEqual([0, 0, 0]);
            expect(s.radius).toBe(1);
        });
    });

    describe('clone / copy / set', () => {
        it('should clone into a separate sphere', () => {
            const source: Sphere = { center: [1, 2, 3], radius: 4 };
            const result = sphere.clone(source);

            expect(result).toEqual(source);
            expect(result.center).not.toBe(source.center);
        });

        it('should copy into and return the output sphere', () => {
            const out = sphere.create();

            expect(sphere.copy(out, { center: [1, 2, 3], radius: 4 })).toBe(out);
            expect(out).toEqual({ center: [1, 2, 3], radius: 4 });
        });

        it('should set the center and radius', () => {
            const out = sphere.create();

            expect(sphere.set(out, [1, 2, 3], 4)).toBe(out);
            expect(out).toEqual({ center: [1, 2, 3], radius: 4 });
        });
    });

    describe('exactEquals / equals', () => {
        it('should compare exactly or within epsilon', () => {
            const a: Sphere = { center: [1, 2, 3], radius: 4 };
            const b: Sphere = { center: [1, 2, 3], radius: 4 + 1e-9 };

            expect(sphere.exactEquals(a, { center: [1, 2, 3], radius: 4 })).toBe(true);
            expect(sphere.exactEquals(a, b)).toBe(false);
            expect(sphere.equals(a, b)).toBe(true);
            expect(sphere.equals(a, { center: [1, 2, 3], radius: 5 })).toBe(false);
        });
    });

    describe('setFromPoints', () => {
        it('should center on the bounding box and reach the farthest point', () => {
            const out = sphere.create();
            sphere.setFromPoints(out, [1, 1, 1, 5, 1, 1, 1, 3, 1, 1, 1, 7], 4);

            expect(out.center).toEqual([3, 2, 4]);
            expect(out.radius).toBeCloseTo(Math.sqrt(14));
        });

        it('should contain the farthest point despite sqrt rounding down', () => {
            // sqrt(0.75) squared is just under 0.75
            const out = sphere.setFromPoints(sphere.create(), [0, 0, 0, 1, 1, 1], 2);

            expect(sphere.containsPoint(out, [0, 0, 0])).toBe(true);
            expect(sphere.containsPoint(out, [1, 1, 1])).toBe(true);
        });

        it('should set the origin with radius 0 for no points', () => {
            const out: Sphere = { center: [9, 9, 9], radius: 9 };
            sphere.setFromPoints(out, [], 0);

            expect(out.center).toEqual([0, 0, 0]);
            expect(out.radius).toBe(0);
        });
    });

    describe('expandByPoint / union', () => {
        it('should grow toward a point outside the sphere', () => {
            const out = sphere.create();
            sphere.expandByPoint(out, { center: [0, 0, 0], radius: 1 }, [0, 0, 3]);

            expect(out).toEqual({ center: [0, 0, 1], radius: 2 });
        });

        it('should leave the sphere unchanged when the point is inside', () => {
            const out = sphere.create();
            sphere.expandByPoint(out, { center: [0, 0, 0], radius: 2 }, [1, 1, 1]);

            expect(out).toEqual({ center: [0, 0, 0], radius: 2 });
        });

        it('should contain the point despite rounding', () => {
            const out = sphere.expandByPoint(sphere.create(), { center: [0, 0, 0], radius: 0 }, [-3, -2, 0]);

            expect(sphere.containsPoint(out, [-3, -2, 0])).toBe(true);
        });

        it('should union two spheres', () => {
            const out = sphere.create();
            sphere.union(out, { center: [0, 0, 0], radius: 1 }, { center: [0, 4, 0], radius: 1 });

            expect(out).toEqual({ center: [0, 2, 0], radius: 3 });
        });

        it('should return the outer sphere when one encloses the other', () => {
            const out = sphere.create();
            sphere.union(out, { center: [0, 0, 0], radius: 1 }, { center: [1, 0, 0], radius: 5 });

            expect(out).toEqual({ center: [1, 0, 0], radius: 5 });
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

    describe('intersectsSphere', () => {
        it('should detect overlap and separation', () => {
            const a: Sphere = { center: [0, 0, 0], radius: 1 };

            expect(sphere.intersectsSphere(a, { center: [1, 1, 0], radius: 1 })).toBe(true);
            expect(sphere.intersectsSphere(a, { center: [2, 2, 0], radius: 1 })).toBe(false);
            expect(sphere.intersectsSphere(a, { center: [0, 0, 2], radius: 1 })).toBe(true); // touching
        });
    });
});
