import { describe, expect, it } from 'vitest';
import { triangulatePolygon2 } from '../../../src/geometry';
import { polygon2, triangle2, type Vec2 } from '../../../src/shapes';

describe('triangulatePolygon2', () => {
    const square = [0, 0, 1, 0, 1, 1, 0, 1];
    // L-shape (one reflex vertex), CCW, area 6.
    const lShape = [0, 0, 4, 0, 4, 1, 1, 1, 1, 3, 0, 3];
    // Plus/cross (four reflex vertices), area 5.
    const plus = [1, 0, 2, 0, 2, 1, 3, 1, 3, 2, 2, 2, 2, 3, 1, 3, 1, 2, 0, 2, 0, 1, 1, 1];

    // Verifies a fan of `count` triangles fully tiles the polygon: right count,
    // valid non-degenerate triangles, and areas summing to the polygon area.
    const checkTriangulation = (out: number[], count: number, vertices: number[], n: number) => {
        expect(count).toBe(n - 2);

        let sum = 0;
        for (let t = 0; t < count; t++) {
            const i0 = out[t * 3];
            const i1 = out[t * 3 + 1];
            const i2 = out[t * 3 + 2];

            for (const idx of [i0, i1, i2]) {
                expect(idx).toBeGreaterThanOrEqual(0);
                expect(idx).toBeLessThan(n);
            }

            const a: Vec2 = [vertices[i0 * 2], vertices[i0 * 2 + 1]];
            const b: Vec2 = [vertices[i1 * 2], vertices[i1 * 2 + 1]];
            const c: Vec2 = [vertices[i2 * 2], vertices[i2 * 2 + 1]];

            const area = triangle2.area(a, b, c);
            expect(area).toBeGreaterThan(0); // non-degenerate
            sum += area;
        }

        expect(sum).toBeCloseTo(polygon2.area(vertices, n));
    };

    it('triangulates a convex quad into two triangles', () => {
        const out: number[] = [];
        const count = triangulatePolygon2(out, square, 4);
        checkTriangulation(out, count, square, 4);
    });

    it('triangulates a concave L-shape', () => {
        const out: number[] = [];
        const count = triangulatePolygon2(out, lShape, 6);
        checkTriangulation(out, count, lShape, 6);
    });

    it('triangulates a plus shape', () => {
        const out: number[] = [];
        const count = triangulatePolygon2(out, plus, 12);
        checkTriangulation(out, count, plus, 12);
    });

    it('triangulates a regular polygon', () => {
        const hexagon: number[] = [];
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            hexagon.push(Math.cos(a), Math.sin(a));
        }
        const out: number[] = [];
        const count = triangulatePolygon2(out, hexagon, 6);
        checkTriangulation(out, count, hexagon, 6);
    });

    it('accepts clockwise input (normalises winding)', () => {
        const cw: number[] = [];
        for (let i = 5; i >= 0; i--) cw.push(lShape[i * 2], lShape[i * 2 + 1]);
        const out: number[] = [];
        const count = triangulatePolygon2(out, cw, 6);
        checkTriangulation(out, count, cw, 6);
    });

    it('returns 0 for degenerate input (fewer than 3 vertices)', () => {
        expect(triangulatePolygon2([], [0, 0, 1, 1], 2)).toBe(0);
    });

    it('ignores trailing vertices beyond n (scratch buffer)', () => {
        const scratch = [0, 0, 1, 0, 1, 1, 0, 1, 999, 999, -999, -999];
        const out: number[] = [];
        const count = triangulatePolygon2(out, scratch, 4);
        checkTriangulation(out, count, scratch, 4);
    });
});
