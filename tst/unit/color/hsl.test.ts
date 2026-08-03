import { describe, expect, it } from 'vitest';
import { color, hsl } from '../../../src/color';

describe('hsl', () => {
    it('create / set / clone', () => {
        expect(hsl.create()).toEqual([0, 0, 0]);
        expect(hsl.fromValues(0.5, 0.6, 0.7)).toEqual([0.5, 0.6, 0.7]);
        const h = hsl.set(hsl.create(), 0.1, 0.2, 0.3);
        expect(hsl.clone(h)).toEqual([0.1, 0.2, 0.3]);
    });

    it('Color <-> HSL round-trips', () => {
        const cases: [number, number, number][] = [
            [1, 0, 0], // red
            [0, 1, 0], // green
            [0.2, 0.5, 0.8], // arbitrary
            [0.05, 0.9, 0.4],
        ];
        for (const linear of cases) {
            const h = hsl.fromColor(hsl.create(), linear);
            const back = hsl.toColor(color.create(), h);
            expect(back[0]).toBeCloseTo(linear[0], 6);
            expect(back[1]).toBeCloseTo(linear[1], 6);
            expect(back[2]).toBeCloseTo(linear[2], 6);
        }
    });

    it('grayscale has zero saturation and round-trips', () => {
        const gray = color.setScalar(color.create(), 0.5);
        const h = hsl.fromColor(hsl.create(), gray);
        expect(h[1]).toBe(0);
        const back = hsl.toColor(color.create(), h);
        expect(back[0]).toBeCloseTo(0.5, 6);
        expect(back[1]).toBeCloseTo(0.5, 6);
        expect(back[2]).toBeCloseTo(0.5, 6);
    });

    it('lerp takes the shortest path around the hue wheel', () => {
        // 0.95 -> 0.05 should wrap through 0.0, not sweep back to 0.5
        const out = hsl.lerp(hsl.create(), [0.95, 1, 0.5], [0.05, 1, 0.5], 0.5);
        expect(out[0]).toBeCloseTo(0, 6);
        expect(out[1]).toBeCloseTo(1, 6);
        expect(out[2]).toBeCloseTo(0.5, 6);

        // within-range hue interpolates normally
        const mid = hsl.lerp(hsl.create(), [0.1, 0, 0], [0.3, 0, 0], 0.5);
        expect(mid[0]).toBeCloseTo(0.2, 6);
    });

    it('offset wraps hue and clamps s/l', () => {
        const out = hsl.offset(hsl.create(), [0.9, 0.5, 0.5], 0.2, 0.8, -1);
        expect(out[0]).toBeCloseTo(0.1, 6); // 0.9 + 0.2 -> 1.1 -> 0.1
        expect(out[1]).toBe(1); // 0.5 + 0.8 clamped
        expect(out[2]).toBe(0); // 0.5 - 1 clamped
    });
});
