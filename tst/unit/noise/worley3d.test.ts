import { describe, expect, it } from 'vitest';
import { worley3d } from '../../../src/noise';

describe('worley3d', () => {
    it('returns non-negative distances that use the [0, ~1] range', () => {
        const gen = worley3d.create(42);
        let min = Infinity;
        let max = -Infinity;
        for (let a = 0; a < 14; a++) {
            for (let b = 0; b < 14; b++) {
                for (let c = 0; c < 14; c++) {
                    const v = worley3d.sample(gen, a * 0.33 - 2, b * 0.29 + 1, c * 0.41 - 3);
                    expect(v).toBeGreaterThanOrEqual(0);
                    expect(Number.isFinite(v)).toBe(true);
                    if (v < min) min = v;
                    if (v > max) max = v;
                }
            }
        }
        expect(min).toBeLessThan(0.3);
        expect(max).toBeGreaterThan(0.6);
        expect(max).toBeLessThan(1.8);
    });

    it('is deterministic for a given seed', () => {
        const a = worley3d.create(7);
        const b = worley3d.create(7);
        expect(worley3d.sample(a, 2.3, -4.1, 0.9)).toBe(worley3d.sample(b, 2.3, -4.1, 0.9));
    });

    it('produces different fields for different seeds', () => {
        const a = worley3d.create(1);
        const b = worley3d.create(2);
        let anyDifferent = false;
        for (let i = 0; i < 30; i++) {
            if (worley3d.sample(a, i * 0.5, i * 0.3, i * 0.2) !== worley3d.sample(b, i * 0.5, i * 0.3, i * 0.2)) {
                anyDifferent = true;
                break;
            }
        }
        expect(anyDifferent).toBe(true);
    });

    it('handles negative coordinates without NaN', () => {
        const gen = worley3d.create(3);
        const v = worley3d.sample(gen, -12.7, -33.2, -8.4);
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
    });
});
