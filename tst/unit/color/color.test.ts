import { describe, expect, it } from 'vitest';
import { color } from '../../../src/color';

describe('color', () => {
    it('create / set / fromValues', () => {
        expect(color.create()).toEqual([0, 0, 0]);
        expect(color.fromValues(0.1, 0.2, 0.3)).toEqual([0.1, 0.2, 0.3]);
        const c = color.create();
        expect(color.set(c, 1, 0.5, 0)).toBe(c);
        expect(c).toEqual([1, 0.5, 0]);
        expect(color.setScalar(color.create(), 0.5)).toEqual([0.5, 0.5, 0.5]);
    });

    it('parses hex / integer / named to linear', () => {
        // pure red: sRGB 1 -> linear 1, others 0
        expect(color.fromColorInput('#ff0000')).toEqual([1, 0, 0]);
        expect(color.fromColorInput('#f00')).toEqual([1, 0, 0]);
        expect(color.fromColorInput(0xff0000)).toEqual([1, 0, 0]);
        expect(color.fromColorInput('red')).toEqual([1, 0, 0]);
        // an array input is treated as already-linear
        expect(color.fromColorInput([0.25, 0.5, 0.75])).toEqual([0.25, 0.5, 0.75]);
    });

    it('returns null for unrecognised input', () => {
        expect(color.fromColorInput('not-a-color')).toBeNull();
    });

    it('sRGB round-trips (fromSRGB <-> toSRGB)', () => {
        const srgb: [number, number, number] = [0.2, 0.5, 0.8];
        const back = color.toSRGB([0, 0, 0], color.fromSRGB(srgb));
        expect(back[0]).toBeCloseTo(srgb[0], 6);
        expect(back[1]).toBeCloseTo(srgb[1], 6);
        expect(back[2]).toBeCloseTo(srgb[2], 6);
    });

    it('hex output round-trips', () => {
        const c = color.fromColorInput(0xff8800) as color.Color;
        expect(color.toHex(c)).toBe(0xff8800);
        expect(color.toHexString(c)).toBe('ff8800');
    });

    it('toCSS clamps and gamma-encodes', () => {
        expect(color.toCSS([1, 0, 0])).toBe('rgb(255, 0, 0)');
        // out-of-range channels are clamped, not wrapped
        expect(color.toCSS([2, -1, 0])).toBe('rgb(255, 0, 0)');
    });

    it('arithmetic + blending', () => {
        expect(color.add(color.create(), [0.1, 0.2, 0.3], [0.4, 0, 0.1])).toEqual([0.5, 0.2, expect.closeTo(0.4, 6)]);
        expect(color.multiplyScalar(color.create(), [0.2, 0.4, 0.6], 0.5)).toEqual([0.1, 0.2, 0.3]);
        expect(color.lerp(color.create(), [0, 0, 0], [1, 1, 1], 0.5)).toEqual([0.5, 0.5, 0.5]);
        expect(color.clamp(color.create(), [2, -1, 0.5])).toEqual([1, 0, 0.5]);
    });

    it('equals with optional epsilon', () => {
        expect(color.equals([0.1, 0.2, 0.3], [0.1, 0.2, 0.3])).toBe(true);
        expect(color.equals([0.1, 0.2, 0.3], [0.1, 0.2, 0.31])).toBe(false);
        expect(color.equals([0.1, 0.2, 0.3], [0.1, 0.2, 0.31], 0.02)).toBe(true);
    });

    it('luminance uses Rec.709 weights on linear light', () => {
        expect(color.luminance([0, 0, 0])).toBe(0);
        expect(color.luminance([1, 1, 1])).toBeCloseTo(1, 6);
        expect(color.luminance([0, 1, 0])).toBeCloseTo(0.7152, 6);
        // green reads brighter than red, red brighter than blue
        expect(color.luminance([0, 1, 0])).toBeGreaterThan(color.luminance([1, 0, 0]));
        expect(color.luminance([1, 0, 0])).toBeGreaterThan(color.luminance([0, 0, 1]));
    });
});
