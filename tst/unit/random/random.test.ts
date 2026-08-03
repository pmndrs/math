import { describe, expect, it } from 'vitest';
import type { Quat, Vec2, Vec3, Vec4 } from '../../../src';
import { mulberry32, random } from '../../../src/random';

// deterministic sampler thunk for repeatable tests
const sampler = (seed = 1) => {
    const state = mulberry32.create(seed);
    return () => mulberry32.sample(state);
};

const length = (v: number[]) => Math.hypot(...v);

describe('random', () => {
    describe('scalar helpers', () => {
        it('float should stay within [min, max)', () => {
            const next = sampler();
            for (let i = 0; i < 500; i++) {
                const v = random.float(next, -3, 7);
                expect(v).toBeGreaterThanOrEqual(-3);
                expect(v).toBeLessThan(7);
            }
        });

        it('int should stay within [min, max] inclusive', () => {
            const next = sampler();
            for (let i = 0; i < 500; i++) {
                const v = random.int(next, 1, 6);
                expect(Number.isInteger(v)).toBe(true);
                expect(v).toBeGreaterThanOrEqual(1);
                expect(v).toBeLessThanOrEqual(6);
            }
        });

        it('choice should return an element of the array', () => {
            const next = sampler();
            const items = ['a', 'b', 'c'];
            for (let i = 0; i < 100; i++) expect(items).toContain(random.choice(next, items));
        });
    });

    describe('out-param vectors', () => {
        it('vec2 should take out first, write unit length, and return out', () => {
            const out: Vec2 = [0, 0];
            const result = random.vec2(out, sampler());
            expect(result).toBe(out);
            expect(length(out)).toBeCloseTo(1, 6);
        });

        it('vec3 should write a unit-length vector into out', () => {
            const out: Vec3 = [0, 0, 0];
            random.vec3(out, sampler());
            expect(length(out)).toBeCloseTo(1, 6);
        });

        it('vec4 should write a unit-length vector into out', () => {
            const out: Vec4 = [0, 0, 0, 0];
            random.vec4(out, sampler());
            expect(length(out)).toBeCloseTo(1, 6);
        });

        it('quat should write a unit-length quaternion into out', () => {
            const out: Quat = [0, 0, 0, 0];
            random.quat(out, sampler());
            expect(length(out)).toBeCloseTo(1, 6);
        });

        it('should be deterministic for a given seed', () => {
            const a: Vec3 = [0, 0, 0];
            const b: Vec3 = [0, 0, 0];
            random.vec3(a, sampler(42));
            random.vec3(b, sampler(42));
            expect(a).toEqual(b);
        });
    });
});
