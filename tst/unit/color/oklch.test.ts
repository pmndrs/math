import { describe, expect, it } from 'vitest';
import { color, oklab, oklch } from '../../../src/color';

describe('oklch', () => {
    it('create / set / clone', () => {
        expect(oklch.create()).toEqual([0, 0, 0]);
        expect(oklch.fromValues(0.7, 0.1, 250)).toEqual([0.7, 0.1, 250]);
        const a = oklch.set(oklch.create(), 0.6, 0.2, 30);
        expect(oklch.clone(a)).toEqual([0.6, 0.2, 30]);
    });

    it('converts reference colors with hue in degrees', () => {
        // sRGB red, as in the CSS Color 4 spec: oklch(62.8% 0.2577 29.23)
        const red = oklch.fromColor(oklch.create(), [1, 0, 0]);
        expect(red[0]).toBeCloseTo(0.628, 3);
        expect(red[1]).toBeCloseTo(0.2577, 3);
        expect(red[2]).toBeCloseTo(29.23, 1);

        // sRGB blue has a hue past 180, still reported in [0, 360)
        expect(oklch.fromColor(oklch.create(), [0, 0, 1])[2]).toBeCloseTo(264.05, 1);
    });

    it('grays have zero chroma and zero hue', () => {
        expect(oklch.fromColor(oklch.create(), [0.5, 0.5, 0.5])[1]).toBe(0);
        expect(oklch.fromColor(oklch.create(), [0.5, 0.5, 0.5])[2]).toBe(0);
        expect(oklch.fromColor(oklch.create(), [1, 1, 1])[1]).toBe(0);
    });

    it('Color <-> Oklch and Oklab <-> Oklch round-trip', () => {
        const c: [number, number, number] = [0.2, 0.5, 0.8];
        const back = color.fromOklch(color.create(), oklch.fromColor(oklch.create(), c));
        expect(back[0]).toBeCloseTo(c[0], 10);
        expect(back[1]).toBeCloseTo(c[1], 10);
        expect(back[2]).toBeCloseTo(c[2], 10);

        const lab: [number, number, number] = [0.6, -0.1, 0.05];
        const labBack = oklch.toOklab(oklab.create(), oklch.fromOklab(oklch.create(), lab));
        expect(labBack[0]).toBeCloseTo(lab[0], 12);
        expect(labBack[1]).toBeCloseTo(lab[1], 12);
        expect(labBack[2]).toBeCloseTo(lab[2], 12);
    });

    it('lerp takes the shortest path around the hue circle', () => {
        const out = oklch.lerp(oklch.create(), [0.5, 0.1, 350], [0.7, 0.2, 10], 0.5);
        expect(out[0]).toBeCloseTo(0.6, 12);
        expect(out[1]).toBeCloseTo(0.15, 12);
        expect(out[2]).toBeCloseTo(0, 12);
    });

    it('lerp from a gray keeps the other endpoint hue', () => {
        // white to blue should stay blue, not sweep from hue 0 through red and magenta
        const white = oklch.fromColor(oklch.create(), [1, 1, 1]);
        const blue = oklch.fromColor(oklch.create(), [0, 0, 1]);
        for (const t of [0.25, 0.5, 0.75]) {
            expect(oklch.lerp(oklch.create(), white, blue, t)[2]).toBeCloseTo(blue[2], 12);
            expect(oklch.lerp(oklch.create(), blue, white, t)[2]).toBeCloseTo(blue[2], 12);
        }
    });

    it('fromOklchInGamut leaves in-gamut colors unchanged', () => {
        const lch = oklch.fromColor(oklch.create(), [0.2, 0.5, 0.8]);
        const out = color.fromOklchInGamut(color.create(), lch);
        expect(out[0]).toBeCloseTo(0.2, 10);
        expect(out[1]).toBeCloseTo(0.5, 10);
        expect(out[2]).toBeCloseTo(0.8, 10);
    });

    it('fromOklchInGamut reduces chroma, keeping lightness and hue', () => {
        // reference values from the Color.js ray trace gamut mapper
        const cases: [[number, number, number], [number, number, number]][] = [
            [
                [0.7, 0.35, 150],
                [0, 0.513762016064672, 0.09701516425038281],
            ],
            [
                [0.5, 0.4, 264],
                [0.0008401832774847649, 0.04965918470497823, 1],
            ],
        ];
        for (const [lch, expected] of cases) {
            const out = color.fromOklchInGamut(color.create(), lch);
            expect(out[0]).toBeCloseTo(expected[0], 6);
            expect(out[1]).toBeCloseTo(expected[1], 6);
            expect(out[2]).toBeCloseTo(expected[2], 6);

            const mapped = oklch.fromColor(oklch.create(), out);
            expect(mapped[0]).toBeCloseTo(lch[0], 3);
            expect(mapped[1]).toBeLessThan(lch[1]);
            expect(mapped[2]).toBeCloseTo(lch[2], 0);
        }
    });

    it('fromOklchInGamut maps lightness past either end to white or black', () => {
        expect(color.fromOklchInGamut(color.create(), [1.2, 0.2, 30])).toEqual([1, 1, 1]);
        expect(color.fromOklchInGamut(color.create(), [-0.1, 0.2, 30])).toEqual([0, 0, 0]);
    });
});
