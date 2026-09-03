import { describe, expect, it } from 'vitest';
import { simplex2d } from '../../../src/noise';

describe('simplex2d', () => {
    it('matches reference values for seed 42', () => {
        // golden values captured from the reference implementation; a change here
        // means the field itself changed, not just its performance
        const gen = simplex2d.create(42);
        expect(simplex2d.sample(gen, 0.5, 0.25)).toBeCloseTo(-0.7342936161846805, 10);
        expect(simplex2d.sample(gen, 1.5, -2.3)).toBeCloseTo(-0.7492767136225353, 10);
        expect(simplex2d.sample(gen, -12.7, -33.2)).toBeCloseTo(0.7723940183137258, 10);
        expect(simplex2d.sample(gen, 100.125, 7.875)).toBeCloseTo(0.43002661159519967, 10);
        expect(simplex2d.sample(gen, 3.1, 3.1)).toBeCloseTo(0.07754558499478206, 10);
        expect(simplex2d.sample(gen, -0.01, 0.99)).toBeCloseTo(0.3755076175204971, 10);
    });

    it('returns values within [-1, 1] that use the range', () => {
        const gen = simplex2d.create(42);
        let min = Infinity;
        let max = -Infinity;
        for (let a = 0; a < 60; a++) {
            for (let b = 0; b < 60; b++) {
                const v = simplex2d.sample(gen, a * 0.37 - 6, b * 0.53 + 2);
                expect(v).toBeGreaterThanOrEqual(-1);
                expect(v).toBeLessThanOrEqual(1);
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }
        expect(max).toBeGreaterThan(0.5);
        expect(min).toBeLessThan(-0.5);
    });

    it('is deterministic for a given seed', () => {
        const a = simplex2d.create(7);
        const b = simplex2d.create(7);
        expect(simplex2d.sample(a, 2.3, -4.1)).toBe(simplex2d.sample(b, 2.3, -4.1));
    });

    it('produces different fields for different seeds', () => {
        const a = simplex2d.create(1);
        const b = simplex2d.create(2);
        let anyDifferent = false;
        for (let i = 0; i < 30; i++) {
            if (simplex2d.sample(a, i * 0.5 + 0.25, i * 0.3 + 0.1) !== simplex2d.sample(b, i * 0.5 + 0.25, i * 0.3 + 0.1)) {
                anyDifferent = true;
                break;
            }
        }
        expect(anyDifferent).toBe(true);
    });

    it('is continuous across simplex boundaries', () => {
        const gen = simplex2d.create(3);
        const eps = 1e-6;
        // the diagonal x === y is the boundary between the two triangles of a cell
        const before = simplex2d.sample(gen, 2.37 - eps, 2.37);
        const after = simplex2d.sample(gen, 2.37 + eps, 2.37);
        expect(Math.abs(after - before)).toBeLessThan(1e-4);
    });

    it('handles negative coordinates without NaN', () => {
        const gen = simplex2d.create(3);
        const v = simplex2d.sample(gen, -12.7, -33.2);
        expect(Number.isFinite(v)).toBe(true);
    });
});
