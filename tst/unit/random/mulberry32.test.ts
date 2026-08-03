import { describe, expect, it } from 'vitest';
import { mulberry32, random } from '../../../src/random';

// reference: the canonical closure-based Mulberry32, to pin exact output parity
function referenceMulberry32(seed: number): () => number {
    let a = seed;
    return () => {
        a += 0x6d2b79f5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

describe('mulberry32', () => {
    describe('create', () => {
        it('should return inspectable state, not a function', () => {
            const state = mulberry32.create(42);
            expect(typeof state).toBe('object');
            expect(state).toEqual({ a: 42 });
        });
    });

    describe('sample', () => {
        it('should return values in [0, 1) and advance the state', () => {
            const state = mulberry32.create(1);
            for (let i = 0; i < 1000; i++) {
                const v = mulberry32.sample(state);
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThan(1);
            }
            expect(state.a).not.toBe(1); // advanced
        });

        it('should be deterministic for a given seed', () => {
            const a = mulberry32.create(12345);
            const b = mulberry32.create(12345);
            for (let i = 0; i < 100; i++) {
                expect(mulberry32.sample(a)).toBe(mulberry32.sample(b));
            }
        });

        it('should match the canonical Mulberry32 sequence exactly', () => {
            const state = mulberry32.create(0xdeadbeef);
            const ref = referenceMulberry32(0xdeadbeef);
            for (let i = 0; i < 100; i++) {
                expect(mulberry32.sample(state)).toBe(ref());
            }
        });
    });

    describe('cloning state forks the stream', () => {
        it('should let a shallow copy continue an identical sequence', () => {
            const state = mulberry32.create(7);
            for (let i = 0; i < 10; i++) mulberry32.sample(state);
            const fork = { ...state };
            // both continue independently from the same point → same numbers
            for (let i = 0; i < 20; i++) {
                expect(mulberry32.sample(fork)).toBe(mulberry32.sample(state));
            }
        });
    });

    describe('seed', () => {
        it('should return a 32-bit unsigned integer', () => {
            for (let i = 0; i < 50; i++) {
                const s = mulberry32.seed();
                expect(Number.isInteger(s)).toBe(true);
                expect(s).toBeGreaterThanOrEqual(0);
                expect(s).toBeLessThan(2 ** 32);
            }
        });
    });

    describe('composition with random.* helpers', () => {
        it('should feed a sampler thunk into the distribution helpers', () => {
            const state = mulberry32.create(99);
            const next = () => mulberry32.sample(state); // RandomGenerator bridge
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
