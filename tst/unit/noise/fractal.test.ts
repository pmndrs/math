import { describe, expect, it } from 'vitest';
import { billow, curl2, curl3, domainWarp2, domainWarp3, fbm, ridged, simplex2d, simplex3d } from '../../../src/noise';

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

    describe('curl2', () => {
        it('gives (d psi/dy, -d psi/dx) for linear potentials', () => {
            const out: [number, number] = [0, 0];
            // psi = x -> gradient (1, 0) -> curl (0, -1)
            curl2(out, (x) => x, 1.5, 2.5);
            expect(out[0]).toBeCloseTo(0);
            expect(out[1]).toBeCloseTo(-1);
            // psi = y -> gradient (0, 1) -> curl (1, 0)
            curl2(out, (_x, y) => y, 1.5, 2.5);
            expect(out[0]).toBeCloseTo(1);
            expect(out[1]).toBeCloseTo(0);
        });

        it('is perpendicular to the potential gradient', () => {
            const gen = simplex2d.create(9);
            const s = (x: number, y: number) => simplex2d.sample(gen, x, y);
            const out: [number, number] = [0, 0];
            const eps = 1e-4;
            for (let i = 0; i < 50; i++) {
                const x = i * 0.37;
                const y = i * 0.21 + 1;
                curl2(out, s, x, y);
                const gx = (s(x + eps, y) - s(x - eps, y)) / (2 * eps);
                const gy = (s(x, y + eps) - s(x, y - eps)) / (2 * eps);
                expect(Math.abs(out[0] * gx + out[1] * gy)).toBeLessThan(1e-6);
            }
        });

        it('is divergence-free (incompressible)', () => {
            const gen = simplex2d.create(4);
            const s = (x: number, y: number) => simplex2d.sample(gen, x, y);
            const a: [number, number] = [0, 0];
            const b: [number, number] = [0, 0];
            const h = 0.01;
            for (let i = 0; i < 20; i++) {
                const x = i * 0.5 + 0.3;
                const y = i * 0.3 - 0.7;
                curl2(a, s, x + h, y);
                curl2(b, s, x - h, y);
                const dvxdx = (a[0] - b[0]) / (2 * h);
                curl2(a, s, x, y + h);
                curl2(b, s, x, y - h);
                const dvydy = (a[1] - b[1]) / (2 * h);
                expect(Math.abs(dvxdx + dvydy)).toBeLessThan(0.02);
            }
        });
    });

    describe('curl3', () => {
        it('gives the curl of the vector potential for linear fields', () => {
            const out: [number, number, number] = [0, 0, 0];
            curl3(out, (x) => x, 1.5, 2.5, -0.5);
            expect(out[0]).toBeCloseTo(0);
            expect(out[1]).toBeCloseTo(-1);
            expect(out[2]).toBeCloseTo(1);
        });

        it('is divergence-free (incompressible)', () => {
            const gen = simplex3d.create(6);
            const s = (x: number, y: number, z: number) => simplex3d.sample(gen, x, y, z);
            const a: [number, number, number] = [0, 0, 0];
            const b: [number, number, number] = [0, 0, 0];
            const h = 0.01;
            for (let i = 0; i < 20; i++) {
                const x = i * 0.4 + 0.2;
                const y = i * 0.3 - 0.5;
                const z = i * 0.2 + 0.1;
                curl3(a, s, x + h, y, z);
                curl3(b, s, x - h, y, z);
                const dvxdx = (a[0] - b[0]) / (2 * h);
                curl3(a, s, x, y + h, z);
                curl3(b, s, x, y - h, z);
                const dvydy = (a[1] - b[1]) / (2 * h);
                curl3(a, s, x, y, z + h);
                curl3(b, s, x, y, z - h);
                const dvzdz = (a[2] - b[2]) / (2 * h);
                expect(Math.abs(dvxdx + dvydy + dvzdz)).toBeLessThan(0.05);
            }
        });
    });
});
