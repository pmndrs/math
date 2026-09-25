import { describe, expect, it } from 'vitest';
import { binomial, lagrange, smootherstep, smoothstep } from '../../../src';

describe('scalar', () => {
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
    });
});
