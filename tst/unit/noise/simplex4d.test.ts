import { describe, expect, it } from 'vitest';
import { simplex4d } from '../../../src/noise';

describe('simplex4d', () => {
    it('returns values within [-1, 1]', () => {
        const gen = simplex4d.create(42);
        let min = Infinity;
        let max = -Infinity;
        // sweep a wide, irrationally-stepped region to hit many simplex cells
        for (let a = 0; a < 12; a++) {
            for (let b = 0; b < 12; b++) {
                for (let c = 0; c < 12; c++) {
                    for (let d = 0; d < 12; d++) {
                        const v = simplex4d.sample(gen, a * 0.37, b * 0.53 - 3, c * 0.71 + 1.5, d * 0.29 - 2);
                        expect(v).toBeGreaterThanOrEqual(-1);
                        expect(v).toBeLessThanOrEqual(1);
                        if (v < min) min = v;
                        if (v > max) max = v;
                    }
                }
            }
        }
        // the field should actually use its range, not sit near zero
        expect(max).toBeGreaterThan(0.2);
        expect(min).toBeLessThan(-0.2);
    });

    it('is deterministic for a given seed', () => {
        const a = simplex4d.create(7);
        const b = simplex4d.create(7);
        expect(simplex4d.sample(a, 1.5, -2.3, 0.7, 4.1)).toBe(simplex4d.sample(b, 1.5, -2.3, 0.7, 4.1));
    });

    it('produces different fields for different seeds', () => {
        const a = simplex4d.create(1);
        const b = simplex4d.create(2);
        let anyDifferent = false;
        for (let i = 0; i < 20; i++) {
            const t = i * 0.6;
            if (simplex4d.sample(a, t, t + 1, t - 1, t * 0.5) !== simplex4d.sample(b, t, t + 1, t - 1, t * 0.5)) {
                anyDifferent = true;
                break;
            }
        }
        expect(anyDifferent).toBe(true);
    });

    it('actually varies along the w (4th) axis', () => {
        const gen = simplex4d.create(3);
        const v0 = simplex4d.sample(gen, 0.2, 0.3, 0.4, 0.0);
        const v1 = simplex4d.sample(gen, 0.2, 0.3, 0.4, 0.9);
        expect(v0).not.toBe(v1);
    });

    it('is continuous (small steps produce small changes)', () => {
        const gen = simplex4d.create(11);
        let prev = simplex4d.sample(gen, 0, 0, 0, 0);
        for (let i = 1; i <= 300; i++) {
            const t = i * 0.01;
            const v = simplex4d.sample(gen, t, t * 0.5, -t * 0.3, t * 0.2);
            expect(Math.abs(v - prev)).toBeLessThan(0.1);
            prev = v;
        }
    });
});
