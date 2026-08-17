import { describe, expect, it } from 'vitest';
import { worley2d } from '../../../src/noise';

describe('worley2d', () => {
    it('returns non-negative distances that use the [0, ~1] range', () => {
        const gen = worley2d.create(42);
        let min = Infinity;
        let max = -Infinity;
        for (let a = 0; a < 40; a++) {
            for (let b = 0; b < 40; b++) {
                const v = worley2d.sample(gen, a * 0.31 - 6, b * 0.27 + 2);
                expect(v).toBeGreaterThanOrEqual(0);
                expect(Number.isFinite(v)).toBe(true);
                if (v < min) min = v;
                if (v > max) max = v;
            }
        }
        expect(min).toBeLessThan(0.25); // some samples land near a feature point
        expect(max).toBeGreaterThan(0.5); // and some land well between them
        expect(max).toBeLessThan(1.6); // one feature point per cell bounds F1
    });

    it('is deterministic for a given seed', () => {
        const a = worley2d.create(7);
        const b = worley2d.create(7);
        expect(worley2d.sample(a, 2.3, -4.1)).toBe(worley2d.sample(b, 2.3, -4.1));
    });

    it('produces different fields for different seeds', () => {
        const a = worley2d.create(1);
        const b = worley2d.create(2);
        let anyDifferent = false;
        for (let i = 0; i < 30; i++) {
            if (worley2d.sample(a, i * 0.5, i * 0.3) !== worley2d.sample(b, i * 0.5, i * 0.3)) {
                anyDifferent = true;
                break;
            }
        }
        expect(anyDifferent).toBe(true);
    });

    it('handles negative coordinates without NaN', () => {
        const gen = worley2d.create(3);
        const v = worley2d.sample(gen, -12.7, -33.2);
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
    });
});
