import { describe, expect, it } from 'vitest';
import { triangle2 } from '../../../src/shapes';

describe('triangle2', () => {
    // CCW right triangle with legs 4 and 3 (area 6).
    const a: [number, number] = [0, 0];
    const b: [number, number] = [4, 0];
    const c: [number, number] = [0, 3];

    describe('signedArea', () => {
        it('is positive for counter-clockwise winding', () => {
            expect(triangle2.signedArea(a, b, c)).toBeCloseTo(6);
        });

        it('is negative for clockwise winding', () => {
            expect(triangle2.signedArea(a, c, b)).toBeCloseTo(-6);
        });

        it('is zero for collinear points', () => {
            expect(triangle2.signedArea([0, 0], [1, 1], [2, 2])).toBeCloseTo(0);
        });
    });

    describe('area', () => {
        it('is non-negative regardless of winding', () => {
            expect(triangle2.area(a, b, c)).toBeCloseTo(6);
            expect(triangle2.area(a, c, b)).toBeCloseTo(6);
        });
    });

    describe('centroid', () => {
        it('averages the three vertices', () => {
            const out: [number, number] = [0, 0];
            triangle2.centroid(out, a, b, c);
            expect(out[0]).toBeCloseTo(4 / 3);
            expect(out[1]).toBeCloseTo(1);
        });

        it('returns out', () => {
            const out: [number, number] = [0, 0];
            expect(triangle2.centroid(out, a, b, c)).toBe(out);
        });
    });

    describe('bounds', () => {
        it('computes the AABB', () => {
            const out: [number, number, number, number] = [0, 0, 0, 0];
            triangle2.bounds(out, a, b, c);
            expect(out).toEqual([0, 0, 4, 3]);
        });
    });

    describe('containsPoint', () => {
        it('returns true for an interior point', () => {
            expect(triangle2.containsPoint(a, b, c, [1, 1])).toBe(true);
        });

        it('returns false for an exterior point', () => {
            expect(triangle2.containsPoint(a, b, c, [4, 4])).toBe(false);
            expect(triangle2.containsPoint(a, b, c, [-1, -1])).toBe(false);
        });

        it('treats boundary points as inside', () => {
            expect(triangle2.containsPoint(a, b, c, [2, 0])).toBe(true); // on edge ab
            expect(triangle2.containsPoint(a, b, c, [0, 0])).toBe(true); // on vertex
        });

        it('works for clockwise winding too', () => {
            expect(triangle2.containsPoint(a, c, b, [1, 1])).toBe(true);
            expect(triangle2.containsPoint(a, c, b, [4, 4])).toBe(false);
        });
    });
});
