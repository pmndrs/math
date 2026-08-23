import { describe, expect, it } from 'vitest';
import { lagrange } from '../../../src';

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
});
