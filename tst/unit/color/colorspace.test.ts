import { describe, expect, it } from 'vitest';
import { color, colorspace } from '../../../src/color';

describe('colorspace', () => {
    it('sRGB transfer functions round-trip and pin endpoints', () => {
        expect(colorspace.srgbToLinear(0)).toBe(0);
        expect(colorspace.srgbToLinear(1)).toBeCloseTo(1, 12);
        expect(colorspace.linearToSrgb(0)).toBe(0);
        expect(colorspace.linearToSrgb(1)).toBeCloseTo(1, 12);
        for (const v of [0.02, 0.18, 0.5, 0.9]) {
            expect(colorspace.linearToSrgb(colorspace.srgbToLinear(v))).toBeCloseTo(v, 12);
        }
    });

    it('sRGB <-> Display-P3 gamut round-trips', () => {
        const cases: [number, number, number][] = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
            [0.2, 0.5, 0.8],
        ];
        for (const c of cases) {
            const p3 = colorspace.linearSrgbToLinearDisplayP3(color.create(), c);
            const back = colorspace.linearDisplayP3ToLinearSrgb(color.create(), p3);
            expect(back[0]).toBeCloseTo(c[0], 5);
            expect(back[1]).toBeCloseTo(c[1], 5);
            expect(back[2]).toBeCloseTo(c[2], 5);
        }
    });

    it('white maps to white (gray axis preserved)', () => {
        const p3 = colorspace.linearSrgbToLinearDisplayP3(color.create(), [1, 1, 1]);
        expect(p3[0]).toBeCloseTo(1, 5);
        expect(p3[1]).toBeCloseTo(1, 5);
        expect(p3[2]).toBeCloseTo(1, 5);
    });

    it('sRGB primary sits inside the (wider) P3 gamut', () => {
        // pure sRGB red is less saturated expressed in the wider P3 primaries
        const p3 = colorspace.linearSrgbToLinearDisplayP3(color.create(), [1, 0, 0]);
        expect(p3[0]).toBeCloseTo(0.8224621, 6);
        expect(p3[1]).toBeCloseTo(0.0331941, 6);
        expect(p3[2]).toBeCloseTo(0.0170827, 6);
    });
});
