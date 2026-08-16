import { describe, expect, it } from 'vitest';
import { isaac64, random } from '../../../src/random';

// Reference: the unseeded ISAAC64 output, as published in Zig's
// std/Random/Isaac64.zig test vectors (which follow Bob Jenkins' reference).
// https://github.com/ziglang/zig/blob/master/lib/std/Random/Isaac64.zig
const REFERENCE_SEED0 = [
    0xf67dfba498e4937cn,
    0x84a5066a9204f380n,
    0xfee34bd5f5514dbbn,
    0x4d1664739b8f80d6n,
    0x8607459ab52a14aan,
    0x0e78bc5a98529e49n,
    0xfe5332822ad13777n,
    0x556c27525e33d01an,
    0x08643ca615f3149fn,
    0xd0771faf3cb04714n,
    0x30e86f68a37b008dn,
    0x3074ebc0488a3adfn,
    0x270645ea7a2790bcn,
    0x5601a0a8d3763c6an,
    0x2f83071f53f325ddn,
    0xb9090f3d42d2d2ean,
];

describe('isaac64', () => {
    describe('create', () => {
        it('should return inspectable state, not a function', () => {
            const state = isaac64.create(42n);
            expect(typeof state).toBe('object');
            expect(state.mHi).toBeInstanceOf(Uint32Array);
            expect(state.mLo).toBeInstanceOf(Uint32Array);
            expect(state.rHi).toBeInstanceOf(Uint32Array);
            expect(state.rLo).toBeInstanceOf(Uint32Array);
            expect(state.i).toBe(256); // batch spent, refills on first draw
        });

        it('should default to seed 0n', () => {
            const a = isaac64.create();
            const b = isaac64.create(0n);
            for (let i = 0; i < 100; i++) expect(isaac64.next(a)).toBe(isaac64.next(b));
        });
    });

    describe('next', () => {
        it('should match the reference unseeded ISAAC64 sequence exactly', () => {
            const state = isaac64.create(0n);
            for (const expected of REFERENCE_SEED0) {
                expect(isaac64.next(state)).toBe(expected);
            }
        });

        it('should return unsigned 64-bit integers', () => {
            const state = isaac64.create(1n);
            for (let i = 0; i < 1000; i++) {
                const v = isaac64.next(state);
                expect(typeof v).toBe('bigint');
                expect(v).toBeGreaterThanOrEqual(0n);
                expect(v).toBeLessThan(1n << 64n);
            }
        });

        it('should refill correctly across the 256-word batch boundary', () => {
            const a = isaac64.create(123n);
            const b = isaac64.create(123n);
            const seen: bigint[] = [];
            for (let i = 0; i < 600; i++) seen.push(isaac64.next(a));
            for (let i = 0; i < 600; i++) expect(isaac64.next(b)).toBe(seen[i]);
        });
    });

    describe('sample', () => {
        it('should return values in [0, 1) and advance the state', () => {
            const state = isaac64.create(1n);
            for (let i = 0; i < 1000; i++) {
                const v = isaac64.sample(state);
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThan(1);
            }
        });

        it('should be deterministic for a given seed', () => {
            const a = isaac64.create(12345n);
            const b = isaac64.create(12345n);
            for (let i = 0; i < 100; i++) {
                expect(isaac64.sample(a)).toBe(isaac64.sample(b));
            }
        });

        it('should equal the top-53-bit conversion of the raw word', () => {
            // sample() reads the lanes directly; pin it to the bigint definition
            const viaNext = isaac64.create(777n);
            const viaSample = isaac64.create(777n);
            for (let i = 0; i < 600; i++) {
                const expected = Number(isaac64.next(viaNext) >> 11n) / 9007199254740992;
                expect(isaac64.sample(viaSample)).toBe(expected);
            }
        });
    });

    describe('cloning state forks the stream', () => {
        it('should let a structural copy continue an identical sequence', () => {
            const state = isaac64.create(7n);
            for (let i = 0; i < 300; i++) isaac64.next(state); // cross a refill
            const fork = structuredClone(state);
            for (let i = 0; i < 300; i++) {
                expect(isaac64.next(fork)).toBe(isaac64.next(state));
            }
        });
    });

    describe('seed', () => {
        it('should return a 64-bit unsigned integer', () => {
            for (let i = 0; i < 50; i++) {
                const s = isaac64.seed();
                expect(typeof s).toBe('bigint');
                expect(s).toBeGreaterThanOrEqual(0n);
                expect(s).toBeLessThan(1n << 64n);
            }
        });
    });

    describe('composition with random.* helpers', () => {
        it('should feed a sampler thunk into the distribution helpers', () => {
            const state = isaac64.create(99n);
            const next = () => isaac64.sample(state); // RandomGenerator bridge
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
