import { describe, expect, it } from 'vitest';
import { isaac32, random } from '../../../src/random';

// Reference: Bob Jenkins' readable.c run unseeded (randinit with flag=0). The
// 2-pass seeded variant of this same port reproduces the published randvect.txt
// byte-for-byte, so these unseeded values are a trustworthy external anchor.
// http://www.burtleburtle.net/bob/rand/isaacafa.html
const REFERENCE_SEED0 = [
    0x9fc09148, 0xf989e740, 0x0898e634, 0x6e4d10ef, 0xfee2d7e8, 0xecd81b8f, 0xcf5e308a, 0x1719f4fd, 0xab8fae88, 0xaec1b3cf,
    0x61cc2c63, 0xb656f150, 0xcb74716d, 0x90bb5ed4, 0xa72976af, 0x5cad2ed8,
];

describe('isaac32', () => {
    describe('create', () => {
        it('should return inspectable state, not a function', () => {
            const state = isaac32.create(42);
            expect(typeof state).toBe('object');
            expect(state.m).toBeInstanceOf(Uint32Array);
            expect(state.r).toBeInstanceOf(Uint32Array);
            expect(state.i).toBe(256); // batch spent, refills on first draw
        });

        it('should default to seed 0', () => {
            const a = isaac32.create();
            const b = isaac32.create(0);
            for (let i = 0; i < 100; i++) expect(isaac32.next(a)).toBe(isaac32.next(b));
        });
    });

    describe('next', () => {
        it('should match the reference unseeded ISAAC-32 sequence exactly', () => {
            const state = isaac32.create(0);
            for (const expected of REFERENCE_SEED0) {
                expect(isaac32.next(state)).toBe(expected);
            }
        });

        it('should return unsigned 32-bit integers', () => {
            const state = isaac32.create(1);
            for (let i = 0; i < 1000; i++) {
                const v = isaac32.next(state);
                expect(Number.isInteger(v)).toBe(true);
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThan(2 ** 32);
            }
        });

        it('should refill correctly across the 256-word batch boundary', () => {
            const a = isaac32.create(123);
            const b = isaac32.create(123);
            // draw past two full batches on a, then confirm b tracks it
            const seen: number[] = [];
            for (let i = 0; i < 600; i++) seen.push(isaac32.next(a));
            for (let i = 0; i < 600; i++) expect(isaac32.next(b)).toBe(seen[i]);
        });
    });

    describe('sample', () => {
        it('should return values in [0, 1) and advance the state', () => {
            const state = isaac32.create(1);
            for (let i = 0; i < 1000; i++) {
                const v = isaac32.sample(state);
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThan(1);
            }
        });

        it('should be deterministic for a given seed', () => {
            const a = isaac32.create(12345);
            const b = isaac32.create(12345);
            for (let i = 0; i < 100; i++) {
                expect(isaac32.sample(a)).toBe(isaac32.sample(b));
            }
        });
    });

    describe('cloning state forks the stream', () => {
        it('should let a structural copy continue an identical sequence', () => {
            const state = isaac32.create(7);
            for (let i = 0; i < 300; i++) isaac32.next(state); // cross a refill
            const fork = structuredClone(state);
            for (let i = 0; i < 300; i++) {
                expect(isaac32.next(fork)).toBe(isaac32.next(state));
            }
        });
    });

    describe('seed', () => {
        it('should return a 32-bit unsigned integer', () => {
            for (let i = 0; i < 50; i++) {
                const s = isaac32.seed();
                expect(Number.isInteger(s)).toBe(true);
                expect(s).toBeGreaterThanOrEqual(0);
                expect(s).toBeLessThan(2 ** 32);
            }
        });
    });

    describe('composition with random.* helpers', () => {
        it('should feed a sampler thunk into the distribution helpers', () => {
            const state = isaac32.create(99);
            const next = () => isaac32.sample(state); // RandomGenerator bridge
            for (let i = 0; i < 100; i++) {
                const f = random.float(next, -5, 5);
                expect(f).toBeGreaterThanOrEqual(-5);
                expect(f).toBeLessThan(5);
                const n = random.int(next, 1, 6);
                expect(n).toBeGreaterThanOrEqual(1);
                expect(n).toBeLessThanOrEqual(6);
            }
        });
    });
});
