import { describe, expect, it } from 'vitest';
import { simplex3d } from '../../../src/noise';

describe('simplex3d', () => {
    it('matches reference values for seed 42', () => {
        // golden values captured from the reference implementation; a change here
        // means the field itself changed, not just its performance
        const gen = simplex3d.create(42);
        expect(simplex3d.sample(gen, 0.5, 0.25, 0.75)).toBeCloseTo(-0.4209218749999994, 10);
        expect(simplex3d.sample(gen, 1.5, -2.3, 0.7)).toBeCloseTo(-0.05952802923456815, 10);
        expect(simplex3d.sample(gen, -12.7, -33.2, 4.4)).toBeCloseTo(0.07647495466667606, 10);
        expect(simplex3d.sample(gen, 100.125, 7.875, -0.5)).toBeCloseTo(0.601684800261823, 10);
        expect(simplex3d.sample(gen, 3.1, 3.1, 3.1)).toBeCloseTo(-0.005308416000000037, 10);
        expect(simplex3d.sample(gen, -0.01, 0.99, -1.01)).toBeCloseTo(0, 10);
    });

    it('returns values within [-1, 1] that use the range', () => {
        const gen = simplex3d.create(42);
        let min = Infinity;
        let max = -Infinity;
        for (let a = 0; a < 20; a++) {
            for (let b = 0; b < 20; b++) {
                for (let c = 0; c < 20; c++) {
                    const v = simplex3d.sample(gen, a * 0.37 - 6, b * 0.53 + 2, c * 0.71 - 1.5);
                    expect(v).toBeGreaterThanOrEqual(-1);
                    expect(v).toBeLessThanOrEqual(1);
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
        }
        expect(max).toBeGreaterThan(0.4);
        expect(min).toBeLessThan(-0.4);
    });

    it('is deterministic for a given seed', () => {
        const a = simplex3d.create(7);
        const b = simplex3d.create(7);
        expect(simplex3d.sample(a, 2.3, -4.1, 0.6)).toBe(simplex3d.sample(b, 2.3, -4.1, 0.6));
    });

    it('produces different fields for different seeds', () => {
        const a = simplex3d.create(1);
        const b = simplex3d.create(2);
        let anyDifferent = false;
        for (let i = 0; i < 30; i++) {
            const t = i * 0.5 + 0.25;
            if (simplex3d.sample(a, t, t * 0.6, -t) !== simplex3d.sample(b, t, t * 0.6, -t)) {
                anyDifferent = true;
                break;
            }
        }
        expect(anyDifferent).toBe(true);
    });

    it('is continuous across simplex boundaries', () => {
        const gen = simplex3d.create(3);
        const eps = 1e-6;
        // x === y === z is where all the tetrahedron orderings meet
        const before = simplex3d.sample(gen, 2.37 - eps, 2.37, 2.37);
        const after = simplex3d.sample(gen, 2.37 + eps, 2.37, 2.37);
        expect(Math.abs(after - before)).toBeLessThan(1e-4);
    });

    it('handles negative coordinates without NaN', () => {
        const gen = simplex3d.create(3);
        const v = simplex3d.sample(gen, -12.7, -33.2, -0.4);
        expect(Number.isFinite(v)).toBe(true);
    });
});
