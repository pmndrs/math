import { describe, expect, it } from 'vitest';
import { color, oklab } from '../../../src/color';

describe('oklab', () => {
    it('create / set / clone', () => {
        expect(oklab.create()).toEqual([0, 0, 0]);
        expect(oklab.fromValues(0.5, 0.1, -0.1)).toEqual([0.5, 0.1, -0.1]);
        const a = oklab.set(oklab.create(), 0.6, 0.2, 0.1);
        expect(oklab.clone(a)).toEqual([0.6, 0.2, 0.1]);
    });

    it('converts reference colors', () => {
        // white is L = 1 with no chroma
        const white = oklab.fromColor(oklab.create(), [1, 1, 1]);
        expect(white[0]).toBeCloseTo(1, 6);
        expect(white[1]).toBeCloseTo(0, 6);
        expect(white[2]).toBeCloseTo(0, 6);

        // sRGB red, as in the CSS Color 4 spec: oklab(0.628 0.2249 0.1258)
        const red = oklab.fromColor(oklab.create(), [1, 0, 0]);
        expect(red[0]).toBeCloseTo(0.628, 3);
        expect(red[1]).toBeCloseTo(0.2249, 3);
        expect(red[2]).toBeCloseTo(0.1258, 3);
    });

    it('Color <-> Oklab round-trips, including out-of-gamut colors', () => {
        const cases: [number, number, number][] = [
            [0.2, 0.5, 0.8],
            [0.05, 0.9, 0.4],
            [-0.1, 1.2, 0.3],
        ];
        for (const c of cases) {
            const back = color.fromOklab(color.create(), oklab.fromColor(oklab.create(), c));
            expect(back[0]).toBeCloseTo(c[0], 10);
            expect(back[1]).toBeCloseTo(c[1], 10);
            expect(back[2]).toBeCloseTo(c[2], 10);
        }
    });

    it('lerp is even in perceived lightness', () => {
        // black to white in linear RGB puts the midpoint far above perceptual mid gray
        const mid = oklab.lerp(oklab.create(), [0, 0, 0], [1, 0, 0], 0.5);
        expect(mid).toEqual([0.5, 0, 0]);
        const rgbMid = color.lerp(color.create(), [0, 0, 0], [1, 1, 1], 0.5);
        expect(oklab.fromColor(oklab.create(), rgbMid)[0]).toBeGreaterThan(0.75);
    });

    it('distance is deltaE OK', () => {
        expect(oklab.distance([0.5, 0, 0], [0.5, 0.03, 0.04])).toBeCloseTo(0.05, 12);
    });
});
