import { describe, expect, it } from 'vitest';
import { perlin2d } from '../../../src/noise';

describe('perlin2d', () => {
    it('matches reference values for seed 42', () => {
        // golden values captured from the reference implementation; a change here
        // means the field itself changed, not just its performance
        const gen = perlin2d.create(42);
        expect(perlin2d.sample(gen, 0.5, 0.25)).toBeCloseTo(-0.663818359375, 10);
        expect(perlin2d.sample(gen, 1.5, -2.3)).toBeCloseTo(-0.11200399999999981, 10);
        expect(perlin2d.sample(gen, -12.7, -33.2)).toBeCloseTo(-0.18465255935999855, 10);
        expect(perlin2d.sample(gen, 100.125, 7.875)).toBeCloseTo(-0.0916297915391624, 10);
        expect(perlin2d.sample(gen, 3.1, 3.1)).toBeCloseTo(0.08380194624000006, 10);
        expect(perlin2d.sample(gen, -0.01, 0.99)).toBeCloseTo(-0.01001920838374947, 10);
    });

    it('is exactly zero on integer lattice points', () => {
        const gen = perlin2d.create(42);
        expect(Math.abs(perlin2d.sample(gen, 3, -7))).toBe(0);
        expect(Math.abs(perlin2d.sample(gen, 0, 0))).toBe(0);
        expect(Math.abs(perlin2d.sample(gen, -255, 512))).toBe(0);
    });

    it('returns values within [-1, 1] that use the range', () => {
        const gen = perlin2d.create(42);
        let min = Infinity;
        let max = -Infinity;
        for (let a = 0; a < 60; a++) {
            for (let b = 0; b < 60; b++) {
                const v = perlin2d.sample(gen, a * 0.37 - 6, b * 0.53 + 2);
                expect(v).toBeGreaterThanOrEqual(-1);
                expect(v).toBeLessThanOrEqual(1);
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }
        expect(max).toBeGreaterThan(0.3);
        expect(min).toBeLessThan(-0.3);
    });

    it('is deterministic for a given seed', () => {
        const a = perlin2d.create(7);
        const b = perlin2d.create(7);
        expect(perlin2d.sample(a, 2.3, -4.1)).toBe(perlin2d.sample(b, 2.3, -4.1));
    });

    it('produces different fields for different seeds', () => {
        const a = perlin2d.create(1);
        const b = perlin2d.create(2);
        let anyDifferent = false;
        for (let i = 0; i < 30; i++) {
            if (perlin2d.sample(a, i * 0.5 + 0.25, i * 0.3 + 0.1) !== perlin2d.sample(b, i * 0.5 + 0.25, i * 0.3 + 0.1)) {
                anyDifferent = true;
                break;
            }
        }
        expect(anyDifferent).toBe(true);
    });

    it('is continuous across cell boundaries', () => {
        const gen = perlin2d.create(3);
        const eps = 1e-6;
        const before = perlin2d.sample(gen, 5 - eps, 2.37);
        const after = perlin2d.sample(gen, 5 + eps, 2.37);
        expect(Math.abs(after - before)).toBeLessThan(1e-4);
    });
});
