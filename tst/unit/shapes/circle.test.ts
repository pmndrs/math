import { describe, expect, it } from 'vitest';
import type { Circle } from '../../../src/shapes';
import { circle } from '../../../src/shapes';

describe('circle', () => {
    describe('clone / copy / set', () => {
        it('should clone into a separate circle', () => {
            const source: Circle = { center: [1, 2], radius: 3 };
            const result = circle.clone(source);

            expect(result).toEqual(source);
            expect(result.center).not.toBe(source.center);
        });

        it('should copy into and return the output circle', () => {
            const out = circle.create();

            expect(circle.copy(out, { center: [1, 2], radius: 3 })).toBe(out);
            expect(out).toEqual({ center: [1, 2], radius: 3 });
        });

        it('should set the center and radius', () => {
            const out = circle.create();

            expect(circle.set(out, [1, 2], 3)).toBe(out);
            expect(out).toEqual({ center: [1, 2], radius: 3 });
        });
    });

    describe('exactEquals / equals', () => {
        it('should compare exactly or within epsilon', () => {
            const a: Circle = { center: [1, 2], radius: 3 };
            const b: Circle = { center: [1, 2], radius: 3 + 1e-9 };

            expect(circle.exactEquals(a, { center: [1, 2], radius: 3 })).toBe(true);
            expect(circle.exactEquals(a, b)).toBe(false);
            expect(circle.equals(a, b)).toBe(true);
            expect(circle.equals(a, { center: [1, 2], radius: 4 })).toBe(false);
        });
    });

    describe('setFromPoints', () => {
        it('should center on the bounding box and reach the farthest point', () => {
            const out = circle.create();
            circle.setFromPoints(out, [1, 1, 5, 1, 1, 3], 3);

            expect(out.center).toEqual([3, 2]);
            expect(out.radius).toBeCloseTo(Math.sqrt(5));
        });

        it('should enclose the farthest point despite sqrt rounding down', () => {
            // sqrt(3.25) squared is just under 3.25
            const out = circle.setFromPoints(circle.create(), [0, 0, 3, 2], 2);

            expect(out.radius * out.radius).toBeGreaterThanOrEqual(3.25);
        });

        it('should read only the first n points', () => {
            const out: Circle = { center: [9, 9], radius: 9 };

            expect(circle.setFromPoints(out, [0, 0, 2, 0, 100, 100], 2)).toBe(out);
            expect(out.center).toEqual([1, 0]);
            expect(out.radius).toBe(1);
        });

        it('should set the origin with radius 0 for no points', () => {
            const out: Circle = { center: [9, 9], radius: 9 };
            circle.setFromPoints(out, [], 0);

            expect(out.center).toEqual([0, 0]);
            expect(out.radius).toBe(0);
        });
    });

    describe('expandByPoint / union', () => {
        it('should grow toward a point outside the circle', () => {
            const out = circle.create();
            circle.expandByPoint(out, { center: [0, 0], radius: 1 }, [3, 0]);

            expect(out).toEqual({ center: [1, 0], radius: 2 });
        });

        it('should leave the circle unchanged when the point is inside', () => {
            const out = circle.create();
            circle.expandByPoint(out, { center: [0, 0], radius: 2 }, [1, 1]);

            expect(out).toEqual({ center: [0, 0], radius: 2 });
        });

        it('should contain the point despite rounding', () => {
            const out = circle.expandByPoint(circle.create(), { center: [0, 0], radius: 0 }, [-3, -2]);

            expect(circle.containsPoint(out, [-3, -2])).toBe(true);
        });

        it('should union two circles', () => {
            const out = circle.create();
            circle.union(out, { center: [0, 0], radius: 1 }, { center: [4, 0], radius: 1 });

            expect(out).toEqual({ center: [2, 0], radius: 3 });
        });

        it('should return the outer circle when one encloses the other', () => {
            const out = circle.create();
            circle.union(out, { center: [0, 0], radius: 1 }, { center: [1, 0], radius: 5 });

            expect(out).toEqual({ center: [1, 0], radius: 5 });
        });
    });

    describe('containsPoint', () => {
        it('should return true when the point is inside', () => {
            const c: Circle = { center: [1, 0], radius: 2 };

            expect(circle.containsPoint(c, [2, 1])).toBe(true);
            expect(circle.containsPoint(c, [3, 0])).toBe(true); // on boundary
            expect(circle.containsPoint(c, [3, 1])).toBe(false);
        });
    });

    describe('intersectsCircle', () => {
        it('should detect overlap and separation', () => {
            const a: Circle = { center: [0, 0], radius: 1 };

            expect(circle.intersectsCircle(a, { center: [1.5, 0], radius: 1 })).toBe(true);
            expect(circle.intersectsCircle(a, { center: [3, 0], radius: 1 })).toBe(false);
            expect(circle.intersectsCircle(a, { center: [2, 0], radius: 1 })).toBe(true); // touching
        });
    });
});
