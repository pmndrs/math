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

    describe('centroid', () => {
        it('finds the center of a square', () => {
            const out: [number, number] = [0, 0];
            polygon2.centroid(out, square, 4);
            expect(out[0]).toBeCloseTo(0.5);
            expect(out[1]).toBeCloseTo(0.5);
        });

        it('is winding-independent', () => {
            const out: [number, number] = [0, 0];
            polygon2.centroid(out, squareCW, 4);
            expect(out[0]).toBeCloseTo(0.5);
            expect(out[1]).toBeCloseTo(0.5);
        });

        it('is area-weighted, not the vertex average', () => {
            // Right triangle (0,0),(6,0),(0,6) with a redundant collinear vertex
            // (3,3) on the hypotenuse. The true centroid stays at (2,2), but the
            // naive vertex average is biased to (2.25, 2.25) by the extra vertex.
            const tri = [0, 0, 6, 0, 3, 3, 0, 6];
            const out: [number, number] = [0, 0];
            polygon2.centroid(out, tri, 4);
            expect(out[0]).toBeCloseTo(2);
            expect(out[1]).toBeCloseTo(2);
        });

        it('falls back to the vertex average for a degenerate polygon', () => {
            // Collinear points along the x-axis (zero area).
            const line = [0, 0, 2, 0, 4, 0];
            const out: [number, number] = [0, 0];
            polygon2.centroid(out, line, 3);
            expect(out[0]).toBeCloseTo(2);
            expect(out[1]).toBeCloseTo(0);
        });

        it('returns out', () => {
            const out: [number, number] = [0, 0];
            expect(polygon2.centroid(out, square, 4)).toBe(out);
        });
    });

    describe('perimeter', () => {
        it('sums edge lengths of a square', () => {
            expect(polygon2.perimeter(square, 4)).toBeCloseTo(4);
        });

        it('sums edge lengths of a 3-4-5 triangle', () => {
            const tri = [0, 0, 3, 0, 3, 4];
            expect(polygon2.perimeter(tri, 3)).toBeCloseTo(12);
        });

        it('ignores trailing vertices beyond n', () => {
            const scratch = [0, 0, 1, 0, 1, 1, 0, 1, 999, 999];
            expect(polygon2.perimeter(scratch, 4)).toBeCloseTo(4);
        });
    });

    describe('winding', () => {
        it('returns 1 for counter-clockwise', () => {
            expect(polygon2.winding(square, 4)).toBe(1);
        });

        it('returns -1 for clockwise', () => {
            expect(polygon2.winding(squareCW, 4)).toBe(-1);
        });

        it('returns 0 for a degenerate polygon', () => {
            expect(polygon2.winding([0, 0, 2, 0, 4, 0], 3)).toBe(0);
        });
    });

    describe('isConvex', () => {
        it('is true for a square', () => {
            expect(polygon2.isConvex(square, 4)).toBe(true);
            expect(polygon2.isConvex(squareCW, 4)).toBe(true);
        });

        it('is true for a regular polygon', () => {
            const hexagon: number[] = [];
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                hexagon.push(Math.cos(a), Math.sin(a));
            }
            expect(polygon2.isConvex(hexagon, 6)).toBe(true);
        });

        it('is false for a concave polygon', () => {
            expect(polygon2.isConvex(concave, 4)).toBe(false);
        });

        it('allows collinear vertices', () => {
            // Square with an extra vertex in the middle of the bottom edge.
            const withCollinear = [0, 0, 0.5, 0, 1, 0, 1, 1, 0, 1];
            expect(polygon2.isConvex(withCollinear, 5)).toBe(true);
        });

        it('is false for fewer than 3 vertices', () => {
            expect(polygon2.isConvex([0, 0, 1, 1], 2)).toBe(false);
        });
    });

    describe('isReflexVertex', () => {
        // CCW L-shape; vertex 3 = (1,1) is the single reflex corner.
        const lShape = [0, 0, 4, 0, 4, 1, 1, 1, 1, 3, 0, 3];

        it('is true at a reflex (concave) vertex', () => {
            expect(polygon2.isReflexVertex(lShape, 6, 3)).toBe(true);
        });

        it('is false at convex vertices', () => {
            for (const i of [0, 1, 2, 4, 5]) {
                expect(polygon2.isReflexVertex(lShape, 6, i)).toBe(false);
            }
        });

        it('is false for every vertex of a convex polygon', () => {
            const square = [0, 0, 1, 0, 1, 1, 0, 1];
            for (let i = 0; i < 4; i++) {
                expect(polygon2.isReflexVertex(square, 4, i)).toBe(false);
            }
        });
    });

    describe('reverse', () => {
        it('reverses winding into a separate buffer', () => {
            const square = [0, 0, 1, 0, 1, 1, 0, 1];
            const out = [0, 0, 0, 0, 0, 0, 0, 0];
            const result = polygon2.reverse(out, square, 4);
            expect(result).toBe(out);
            expect(out).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);
            // Source is untouched, and winding is flipped.
            expect(polygon2.winding(square, 4)).toBe(1);
            expect(polygon2.winding(out, 4)).toBe(-1);
        });

        it('reverses in place (out === vertices)', () => {
            const poly = [0, 0, 1, 0, 1, 1, 0, 1];
            polygon2.reverse(poly, poly, 4);
            expect(poly).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);
        });

        it('handles an odd vertex count into a separate buffer', () => {
            const tri = [0, 0, 4, 0, 0, 3];
            const out = [0, 0, 0, 0, 0, 0];
            polygon2.reverse(out, tri, 3);
            expect(out).toEqual([0, 3, 4, 0, 0, 0]);
        });
    });

    describe('bounds', () => {
        it('computes the AABB of a polygon', () => {
            const out: [number, number, number, number] = [0, 0, 0, 0];
            polygon2.bounds(out, concave, 4);
            expect(out).toEqual([0, 0, 4, 4]);
        });

        it('ignores trailing vertices beyond n', () => {
            const out: [number, number, number, number] = [0, 0, 0, 0];
            const scratch = [0, 0, 1, 0, 1, 1, 0, 1, 999, 999, -999, -999];
            polygon2.bounds(out, scratch, 4);
            expect(out).toEqual([0, 0, 1, 1]);
        });

        it('returns out', () => {
            const out: [number, number, number, number] = [0, 0, 0, 0];
            expect(polygon2.bounds(out, square, 4)).toBe(out);
        });
    });

    describe('closestPoint', () => {
        it('projects an exterior point onto the nearest edge', () => {
            const out: [number, number] = [0, 0];
            polygon2.closestPoint(out, square, 4, [2, 0.5]);
            expect(out[0]).toBeCloseTo(1);
            expect(out[1]).toBeCloseTo(0.5);
        });

        it('projects an interior point onto the nearest edge', () => {
            const out: [number, number] = [0, 0];
            polygon2.closestPoint(out, square, 4, [0.5, 0.2]);
            expect(out[0]).toBeCloseTo(0.5);
            expect(out[1]).toBeCloseTo(0);
        });

        it('works when out === point (aliased)', () => {
            const p: [number, number] = [2, 0.5];
            polygon2.closestPoint(p, square, 4, p);
            expect(p[0]).toBeCloseTo(1);
            expect(p[1]).toBeCloseTo(0.5);
        });
    });

    describe('signedDistance', () => {
        it('is positive outside', () => {
            expect(polygon2.signedDistance(square, 4, [2, 0.5])).toBeCloseTo(1);
        });

        it('is negative inside', () => {
            expect(polygon2.signedDistance(square, 4, [0.5, 0.2])).toBeCloseTo(-0.2);
            expect(polygon2.signedDistance(square, 4, [0.5, 0.5])).toBeCloseTo(-0.5);
        });

        it('is ~0 on the boundary', () => {
            expect(polygon2.signedDistance(square, 4, [0.5, 0])).toBeCloseTo(0);
        });
    });

    describe('overlapConvex', () => {
        const a = [0, 0, 2, 0, 2, 2, 0, 2];

        it('is true for overlapping polygons', () => {
            const b = [1, 1, 3, 1, 3, 3, 1, 3];
            expect(polygon2.overlapConvex(a, 4, b, 4)).toBe(true);
        });

        it('is false for disjoint polygons', () => {
            const b = [5, 5, 6, 5, 6, 6, 5, 6];
            expect(polygon2.overlapConvex(a, 4, b, 4)).toBe(false);
        });

        it('treats edge-touching polygons as overlapping', () => {
            const b = [2, 0, 4, 0, 4, 2, 2, 2];
            expect(polygon2.overlapConvex(a, 4, b, 4)).toBe(true);
        });

        it('detects containment (one inside the other)', () => {
            const inner = [0.5, 0.5, 1.5, 0.5, 1.5, 1.5, 0.5, 1.5];
            expect(polygon2.overlapConvex(a, 4, inner, 4)).toBe(true);
        });
    });

    describe('intersectsSegment', () => {
        it('is true when the segment crosses the polygon', () => {
            expect(polygon2.intersectsSegment(square, 4, [-1, 0.5], [2, 0.5])).toBe(true);
        });

        it('is true when the segment lies fully inside', () => {
            expect(polygon2.intersectsSegment(square, 4, [0.3, 0.3], [0.7, 0.7])).toBe(true);
        });

        it('is true when one endpoint is inside', () => {
            expect(polygon2.intersectsSegment(square, 4, [-1, 0.5], [0.5, 0.5])).toBe(true);
        });

        it('is false when the segment is fully outside', () => {
            expect(polygon2.intersectsSegment(square, 4, [2, 2], [3, 3])).toBe(false);
            expect(polygon2.intersectsSegment(square, 4, [-1, -1], [-2, -2])).toBe(false);
        });
    });
});
