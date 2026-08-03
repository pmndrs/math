import { describe, expect, it } from 'vitest';
import { easing } from '../../../src/time';

describe('easing', () => {
    // in/out families should pin the unit interval endpoints
    const unitInterval: [string, (t: number) => number][] = [
        ['linear', easing.linear],
        ['sineIn', easing.sineIn],
        ['sineOut', easing.sineOut],
        ['sineInOut', easing.sineInOut],
        ['cubicIn', easing.cubicIn],
        ['cubicOut', easing.cubicOut],
        ['cubicInOut', easing.cubicInOut],
        ['quintIn', easing.quintIn],
        ['quintOut', easing.quintOut],
        ['quintInOut', easing.quintInOut],
        ['circIn', easing.circIn],
        ['circOut', easing.circOut],
        ['circInOut', easing.circInOut],
        ['quartIn', easing.quartIn],
        ['quartOut', easing.quartOut],
        ['quartInOut', easing.quartInOut],
        ['expoIn', easing.expoIn],
        ['expoOut', easing.expoOut],
        ['expoInOut', easing.expoInOut],
    ];

    for (const [name, fn] of unitInterval) {
        describe(name, () => {
            it('should map 0 -> 0 and 1 -> 1', () => {
                expect(fn(0)).toBeCloseTo(0, 6);
                expect(fn(1)).toBeCloseTo(1, 6);
            });
        });
    }

    describe('linear', () => {
        it('should be the identity', () => {
            expect(easing.linear(0.37)).toBe(0.37);
        });
    });

    describe('exp', () => {
        it('should equal 1 at t = 0', () => {
            expect(easing.exp(0)).toBe(1);
        });

        it('should decay monotonically', () => {
            expect(easing.exp(1)).toBeLessThan(easing.exp(0));
            expect(easing.exp(2)).toBeLessThan(easing.exp(1));
        });
    });

    describe('rsqw', () => {
        it('should stay within the amplitude', () => {
            for (let t = 0; t <= 1; t += 0.1) {
                expect(Math.abs(easing.rsqw(t))).toBeLessThanOrEqual(1);
            }
        });
    });
});
