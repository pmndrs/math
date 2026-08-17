import { describe, expect, it } from 'vitest';
import { polygon2 } from '../../../src/shapes';

describe('polygon2', () => {
    // Counter-clockwise unit square [0,1]x[0,1]
    const square = [0, 0, 1, 0, 1, 1, 0, 1];
    // Same square wound clockwise
    const squareCW = [0, 0, 0, 1, 1, 1, 1, 0];
    // Concave chevron pointing right: big triangle (0,0),(4,2),(0,4) with the
    // vertex (2,2) pulled inward to carve a notch out of the left side.
    const concave = [0, 0, 4, 2, 0, 4, 2, 2];

    describe('signedArea', () => {
        it('is positive for counter-clockwise winding', () => {
            expect(polygon2.signedArea(square, 4)).toBeCloseTo(1);
        });

        it('is negative for clockwise winding', () => {
            expect(polygon2.signedArea(squareCW, 4)).toBeCloseTo(-1);
        });

        it('computes a triangle area', () => {
            const tri = [0, 0, 4, 0, 0, 3];
            expect(polygon2.signedArea(tri, 3)).toBeCloseTo(6);
        });

        it('ignores trailing vertices beyond n (scratch buffer)', () => {
            // Square in the first 4 vertices, garbage after.
            const scratch = [0, 0, 1, 0, 1, 1, 0, 1, 999, 999, -999, -999];
            expect(polygon2.signedArea(scratch, 4)).toBeCloseTo(1);
        });
    });

    describe('area', () => {
        it('is non-negative regardless of winding', () => {
            expect(polygon2.area(square, 4)).toBeCloseTo(1);
            expect(polygon2.area(squareCW, 4)).toBeCloseTo(1);
        });

        it('computes the area of a concave polygon', () => {
            expect(polygon2.area(concave, 4)).toBeCloseTo(4);
        });
    });

    describe('containsPoint', () => {
        it('returns true for an interior point', () => {
            expect(polygon2.containsPoint(square, 4, [0.5, 0.5])).toBe(true);
        });

        it('returns false for an exterior point', () => {
            expect(polygon2.containsPoint(square, 4, [1.5, 0.5])).toBe(false);
            expect(polygon2.containsPoint(square, 4, [-0.5, 0.5])).toBe(false);
            expect(polygon2.containsPoint(square, 4, [0.5, 2])).toBe(false);
        });

        it('treats boundary points as inside', () => {
            expect(polygon2.containsPoint(square, 4, [0, 0.5])).toBe(true); // on left edge
            expect(polygon2.containsPoint(square, 4, [0.5, 0])).toBe(true); // on bottom edge
            expect(polygon2.containsPoint(square, 4, [0, 0])).toBe(true); // on vertex
        });

        it('works for clockwise winding too', () => {
            expect(polygon2.containsPoint(squareCW, 4, [0.5, 0.5])).toBe(true);
            expect(polygon2.containsPoint(squareCW, 4, [1.5, 0.5])).toBe(false);
        });

        it('handles concave polygons (point in the notch is outside)', () => {
            expect(polygon2.containsPoint(concave, 4, [3, 2])).toBe(true); // solid body
            expect(polygon2.containsPoint(concave, 4, [1, 2])).toBe(false); // inside the notch
            expect(polygon2.containsPoint(concave, 4, [10, 2])).toBe(false); // exterior
        });

        it('ignores trailing vertices beyond n (scratch buffer)', () => {
            const scratch = [0, 0, 1, 0, 1, 1, 0, 1, 999, 999, -999, -999];
            expect(polygon2.containsPoint(scratch, 4, [0.5, 0.5])).toBe(true);
            expect(polygon2.containsPoint(scratch, 4, [500, 500])).toBe(false);
        });
    });
});
