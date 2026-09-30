import { describe, expect, it } from 'vitest';
import { binomial, lagrange, repeat, smootherstep, smoothstep, wrap } from '../../../src';

describe('scalar', () => {
    describe('wrap', () => {
        it('should wrap values into [min, max)', () => {
            expect(wrap(370, 0, 360)).toBe(10);
            expect(wrap(-10, 0, 360)).toBe(350);
            expect(wrap(5, 1, 2)).toBe(1);
            expect(wrap(2, 1, 2)).toBe(1);
            expect(wrap(1, 1, 2)).toBe(1);
        });

        it('should wrap into a negative range', () => {
            expect(wrap(4, -Math.PI, Math.PI)).toBeCloseTo(4 - 2 * Math.PI);
            expect(wrap(-15, -10, 10)).toBe(5);
        });

        it('should never return max itself', () => {
            // min + repeat(...) rounds up to exactly max for values 1 ulp below min
            expect(wrap(0.9999999999999999, 1, 2)).toBe(1);
        });

        it('should return NaN for an empty range and non-finite inputs', () => {
            expect(wrap(5, 3, 3)).toBeNaN();
            expect(wrap(Infinity, 0, 1)).toBeNaN();
        });
    });

    describe('repeat', () => {
        it('should wrap values into [0, length)', () => {
            expect(repeat(5, 3)).toBe(2);
            expect(repeat(5.5, 2)).toBe(1.5);
            expect(repeat(3, 3)).toBe(0);
        });

        it('should wrap negative values to positive ones', () => {
            expect(repeat(-1, 3)).toBe(2);
            expect(repeat(-6, 3)).toBe(0);
            expect(repeat(-0.1, 1)).toBeCloseTo(0.9);
        });

        it('should never return length itself', () => {
            // the floor-divide form rounded this up to exactly `length`
            expect(repeat(-1e-17, 1)).toBe(0);
        });

        it('should stay exact for integers beyond 2^53', () => {
            // the floor-divide form lost the remainder to fp rounding
            expect(repeat(1e16, 3)).toBe(1);
        });

        it('should return NaN for length 0 and non-finite inputs', () => {
            expect(repeat(7, 0)).toBeNaN();
            expect(repeat(Infinity, 3)).toBeNaN();
            expect(repeat(7, Infinity)).toBeNaN();
        });
    });

    describe('lagrange', () => {
        it('should return the first value at t=0', () => {
            expect(lagrange(1, 5, 2, 0)).toBeCloseTo(1);
        });

        it('should return the middle value at t=0.5', () => {
            expect(lagrange(1, 5, 2, 0.5)).toBeCloseTo(5);
        });

        it('should return the last value at t=1', () => {
            expect(lagrange(1, 5, 2, 1)).toBeCloseTo(2);
        });

        it('should match linear interpolation when the points are colinear', () => {
            // 0, 1, 2 sampled at t=0, 0.5, 1 -> the parabola degenerates to a line
            expect(lagrange(0, 1, 2, 0.25)).toBeCloseTo(0.5);
            expect(lagrange(0, 1, 2, 0.75)).toBeCloseTo(1.5);
        });
    });

    describe('binomial', () => {
        it('should return 1 for the edges of a row', () => {
            expect(binomial(5, 0)).toBe(1);
            expect(binomial(5, 5)).toBe(1);
            expect(binomial(0, 0)).toBe(1);
        });

        it('should compute binomial coefficients', () => {
            expect(binomial(5, 2)).toBe(10);
            expect(binomial(10, 3)).toBe(120);
            expect(binomial(6, 3)).toBe(20);
        });

        it('should be symmetric: C(n, k) === C(n, n - k)', () => {
            expect(binomial(10, 7)).toBe(binomial(10, 3));
        });

        it('should return exact integers for large coefficients', () => {
            expect(binomial(52, 5)).toBe(2598960);
        });

        it('should return 0 when k is out of range', () => {
            expect(binomial(3, 5)).toBe(0);
            expect(binomial(5, -1)).toBe(0);
        });
    });

    describe('smoothstep', () => {
        it('should ease from 0 to 1 between the edges', () => {
            expect(smoothstep(10, 20, 10)).toBe(0);
            expect(smoothstep(10, 20, 12.5)).toBeCloseTo(0.15625);
            expect(smoothstep(10, 20, 15)).toBeCloseTo(0.5);
            expect(smoothstep(10, 20, 20)).toBe(1);
        });

        it('should clamp outside the edges', () => {
            expect(smoothstep(10, 20, 5)).toBe(0);
            expect(smoothstep(10, 20, 25)).toBe(1);
        });

        it('should step at the edge when the edges are equal', () => {
            expect(smoothstep(10, 10, 9)).toBe(0);
            expect(smoothstep(10, 10, 10)).toBe(0);
            expect(smoothstep(10, 10, 11)).toBe(1);
        });
    });

    describe('smootherstep', () => {
        it('should ease from 0 to 1 between the edges', () => {
            expect(smootherstep(10, 20, 10)).toBe(0);
            expect(smootherstep(10, 20, 12.5)).toBeCloseTo(0.103515625);
            expect(smootherstep(10, 20, 15)).toBeCloseTo(0.5);
            expect(smootherstep(10, 20, 20)).toBe(1);
        });

        it('should clamp outside the edges', () => {
            expect(smootherstep(10, 20, 5)).toBe(0);
            expect(smootherstep(10, 20, 25)).toBe(1);
        });

        it('should step at the edge when the edges are equal', () => {
            expect(smootherstep(10, 10, 9)).toBe(0);
            expect(smootherstep(10, 10, 10)).toBe(0);
            expect(smootherstep(10, 10, 11)).toBe(1);
        });
    });
});
