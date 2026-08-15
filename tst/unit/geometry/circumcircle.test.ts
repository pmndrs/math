import { describe, expect, it } from 'vitest';
import { type Circle, circumcircle, type Vec2 } from '../../../src/geometry';
import * as mulberry32 from '../../../src/random/mulberry32';

const dist = (p: Vec2, q: Vec2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const makeCircle = (): Circle => ({ center: [0, 0], radius: 0 });

describe('circumcircle', () => {
    it('calculates circumcircle for a simple triangle', () => {
        const a: Vec2 = [0, 0];
        const b: Vec2 = [1, 0];
        const c: Vec2 = [0, 1];
        const result = circumcircle(makeCircle(), a, b, c);
        expect(result.center[0]).toBeCloseTo(0.5);
        expect(result.center[1]).toBeCloseTo(0.5);
        expect(result.radius).toBeCloseTo(Math.sqrt(0.5));
    });

    it('calculates circumcircle for an equilateral triangle', () => {
        const a: Vec2 = [0, 0];
        const b: Vec2 = [1, 0];
        const c: Vec2 = [0.5, Math.sqrt(3) / 2];
        const result = circumcircle(makeCircle(), a, b, c);
        expect(result.center[0]).toBeCloseTo(0.5);
        expect(result.center[1]).toBeCloseTo(Math.sqrt(3) / 6);
        expect(result.radius).toBeCloseTo(1 / Math.sqrt(3));
    });

    it('places a right triangle circumcenter at the hypotenuse midpoint', () => {
        // Thales: the hypotenuse is a diameter, so the circumcenter is its midpoint.
        const a: Vec2 = [0, 0];
        const b: Vec2 = [4, 0];
        const c: Vec2 = [0, 3];
        const result = circumcircle(makeCircle(), a, b, c);
        expect(result.center[0]).toBeCloseTo(2);
        expect(result.center[1]).toBeCloseTo(1.5);
        expect(result.radius).toBeCloseTo(2.5); // half the hypotenuse (5)
    });

    it('writes into and returns the provided out circle', () => {
        const out = makeCircle();
        const result = circumcircle(out, [0, 0], [1, 0], [0, 1]);
        expect(result).toBe(out);
    });

    it('is invariant under translation of the triangle', () => {
        const a: Vec2 = [1, 2];
        const b: Vec2 = [4, 1];
        const c: Vec2 = [2, 5];
        const base = circumcircle(makeCircle(), a, b, c);

        const t: Vec2 = [-100, 37];
        const moved = circumcircle(
            makeCircle(),
            [a[0] + t[0], a[1] + t[1]],
            [b[0] + t[0], b[1] + t[1]],
            [c[0] + t[0], c[1] + t[1]],
        );
        expect(moved.center[0]).toBeCloseTo(base.center[0] + t[0]);
        expect(moved.center[1]).toBeCloseTo(base.center[1] + t[1]);
        expect(moved.radius).toBeCloseTo(base.radius);
    });

    it('produces a circle passing through all three vertices (random triangles, multiple scales)', () => {
        const out = makeCircle();
        for (const scale of [1, 10, 1000]) {
            const rand = mulberry32.create(1);
            for (let i = 0; i < 2000; i++) {
                const a: Vec2 = [(mulberry32.sample(rand) - 0.5) * scale, (mulberry32.sample(rand) - 0.5) * scale];
                const b: Vec2 = [(mulberry32.sample(rand) - 0.5) * scale, (mulberry32.sample(rand) - 0.5) * scale];
                const c: Vec2 = [(mulberry32.sample(rand) - 0.5) * scale, (mulberry32.sample(rand) - 0.5) * scale];
                circumcircle(out, a, b, c);
                if (out.radius === 0) continue; // degenerate/near-collinear
                // the defining property: the center is equidistant (= radius) from every vertex
                const tol = out.radius * 1e-9;
                expect(Math.abs(dist(out.center, a) - out.radius)).toBeLessThanOrEqual(tol);
                expect(Math.abs(dist(out.center, b) - out.radius)).toBeLessThanOrEqual(tol);
                expect(Math.abs(dist(out.center, c) - out.radius)).toBeLessThanOrEqual(tol);
            }
        }
    });

    describe('degenerate input', () => {
        it.each([
            ['collinear horizontal', [0, 0], [1, 0], [2, 0]],
            ['collinear vertical', [0, 0], [0, 1], [0, 2]],
            ['collinear diagonal', [0, 0], [1, 1], [2, 2]],
            ['all points identical', [5, 5], [5, 5], [5, 5]],
            ['two points identical', [0, 0], [0, 0], [1, 0]],
        ] as [string, Vec2, Vec2, Vec2][])('returns radius 0 for %s', (_label, a, b, c) => {
            const result = circumcircle(makeCircle(), a, b, c);
            expect(result.radius).toBe(0);
            expect(result.center[0]).toBeCloseTo(a[0]);
            expect(result.center[1]).toBeCloseTo(a[1]);
        });
    });
});
