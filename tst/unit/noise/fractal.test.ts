import { describe, expect, it } from 'vitest';
import { billow, domainWarp2, domainWarp3, fbm, ridged, simplex2d } from '../../../src/noise';

describe('fractal', () => {
    describe('fbm', () => {
        it('passes increasing octave frequencies to the sampler', () => {
            const freqs: number[] = [];
            fbm(
                (f) => {
                    freqs.push(f);
                    return 0;
                },
                { octaves: 4, frequency: 1, lacunarity: 2 },
            );
            expect(freqs).toEqual([1, 2, 4, 8]);
        });

        it('normalizes a constant source back to that constant', () => {
            expect(fbm(() => 1)).toBeCloseTo(1);
            expect(fbm(() => 0)).toBe(0);
            expect(fbm(() => -1)).toBeCloseTo(-1);
        });

        it('stays within [-1, 1] for a bounded source', () => {
            const gen = simplex2d.create(3);
            for (let i = 0; i < 500; i++) {
                const v = fbm((f) => simplex2d.sample(gen, i * 0.1 * f, i * 0.13 * f), { octaves: 5 });
                expect(v).toBeGreaterThanOrEqual(-1);
                expect(v).toBeLessThanOrEqual(1);
            }
        });

        it('changes with octave count', () => {
            const gen = simplex2d.create(3);
            const s = (f: number) => simplex2d.sample(gen, 1.5 * f, 2.5 * f);
            expect(fbm(s, { octaves: 1 })).not.toBe(fbm(s, { octaves: 4 }));
        });
    });

    describe('ridged', () => {
        it('folds each octave to 1 - abs(noise)', () => {
            expect(ridged(() => 0)).toBeCloseTo(1);
            expect(ridged(() => 1)).toBeCloseTo(0);
            expect(ridged(() => -1)).toBeCloseTo(0);
        });

        it('stays within [0, 1]', () => {
            const gen = simplex2d.create(5);
            for (let i = 0; i < 300; i++) {
                const v = ridged((f) => simplex2d.sample(gen, i * 0.2 * f, i * 0.1 * f), { octaves: 4 });
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('billow', () => {
        it('folds each octave to 2*abs(noise) - 1', () => {
            expect(billow(() => 0)).toBeCloseTo(-1);
            expect(billow(() => 1)).toBeCloseTo(1);
            expect(billow(() => -1)).toBeCloseTo(1);
        });

        it('stays within [-1, 1]', () => {
            const gen = simplex2d.create(5);
            for (let i = 0; i < 300; i++) {
                const v = billow((f) => simplex2d.sample(gen, i * 0.15 * f, i * 0.11 * f), { octaves: 4 });
                expect(v).toBeGreaterThanOrEqual(-1);
                expect(v).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('domainWarp2', () => {
        it('returns the input point when amount is 0', () => {
            const out: [number, number] = [0, 0];
            domainWarp2(out, () => 5, 3, 7, 0);
            expect(out).toEqual([3, 7]);
        });

        it('offsets both axes by the warp noise', () => {
            const out: [number, number] = [0, 0];
            domainWarp2(out, () => 1, 3, 7, 2);
            expect(out).toEqual([5, 9]);
        });
    });

    describe('domainWarp3', () => {
        it('returns the input when amount is 0 and offsets otherwise', () => {
            const out: [number, number, number] = [0, 0, 0];
            domainWarp3(out, () => 1, 1, 2, 3, 0);
            expect(out).toEqual([1, 2, 3]);
            domainWarp3(out, () => 1, 1, 2, 3, 2);
            expect(out).toEqual([3, 4, 5]);
        });
    });
});
