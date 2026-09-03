import { describe, expect, it } from 'vitest';
import { perlin3d } from '../../../src/noise';

describe('perlin3d', () => {
    it('matches reference values for seed 42', () => {
        // golden values captured from the reference implementation; a change here
        // means the field itself changed, not just its performance
        const gen = perlin3d.create(42);
        expect(perlin3d.sample(gen, 0.5, 0.25, 0.75)).toBeCloseTo(0.14544248580932617, 10);
        expect(perlin3d.sample(gen, 1.5, -2.3, 0.7)).toBeCloseTo(0.05244196543999996, 10);
        expect(perlin3d.sample(gen, -12.7, -33.2, 4.4)).toBeCloseTo(0.5846026004152299, 10);
        expect(perlin3d.sample(gen, 100.125, 7.875, -0.5)).toBeCloseTo(0.008026123046875, 10);
        expect(perlin3d.sample(gen, 3.1, 3.1, 3.1)).toBeCloseTo(-0.205091910395597, 10);
        expect(perlin3d.sample(gen, -0.01, 0.99, -1.01)).toBeCloseTo(0.000019701198058142305, 10);
    });

    it('is exactly zero on integer lattice points', () => {
        const gen = perlin3d.create(42);
        expect(Math.abs(perlin3d.sample(gen, 3, -7, 11))).toBe(0);
        expect(Math.abs(perlin3d.sample(gen, 0, 0, 0))).toBe(0);
        expect(Math.abs(perlin3d.sample(gen, -255, 512, 9))).toBe(0);
    });

    it('returns values within [-1, 1] that use the range', () => {
        const gen = perlin3d.create(42);
        let min = Infinity;
        let max = -Infinity;
        for (let a = 0; a < 20; a++) {
            for (let b = 0; b < 20; b++) {
                for (let c = 0; c < 20; c++) {
                    const v = perlin3d.sample(gen, a * 0.37 - 6, b * 0.53 + 2, c * 0.71 - 1.5);
                    expect(v).toBeGreaterThanOrEqual(-1);
                    expect(v).toBeLessThanOrEqual(1);
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
        }
        expect(max).toBeGreaterThan(0.3);
        expect(min).toBeLessThan(-0.3);
    });

    it('is deterministic for a given seed', () => {
        const a = perlin3d.create(7);
        const b = perlin3d.create(7);
        expect(perlin3d.sample(a, 2.3, -4.1, 0.6)).toBe(perlin3d.sample(b, 2.3, -4.1, 0.6));
    });

    it('produces different fields for different seeds', () => {
        const a = perlin3d.create(1);
        const b = perlin3d.create(2);
        let anyDifferent = false;
        for (let i = 0; i < 30; i++) {
            const t = i * 0.5 + 0.25;
            if (perlin3d.sample(a, t, t * 0.6, -t) !== perlin3d.sample(b, t, t * 0.6, -t)) {
                anyDifferent = true;
                break;
            }
        }
        expect(anyDifferent).toBe(true);
    });

    it('is continuous across cell boundaries', () => {
        const gen = perlin3d.create(3);
        const eps = 1e-6;
        const before = perlin3d.sample(gen, 5 - eps, 2.37, -1.41);
        const after = perlin3d.sample(gen, 5 + eps, 2.37, -1.41);
        expect(Math.abs(after - before)).toBeLessThan(1e-4);
    });
});
