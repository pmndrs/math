import { describe, expect, it } from 'vitest';
import { binomial, lagrange, repeat } from '../../../src';

describe('scalar', () => {
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
});
