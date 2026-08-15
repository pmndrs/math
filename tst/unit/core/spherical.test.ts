import { describe, expect, it } from 'vitest';
import { spherical } from '../../../src';
import type { Spherical, Vec2, Vec3 } from '../../../src';
import { EPSILON } from '../../../src/core/scalar';

const PI = Math.PI;

describe('spherical', () => {
    it('create returns the unit spherical [1, 0, 0]', () => {
        expect(spherical.create()).toEqual([1, 0, 0]);
    });

    it('fromValues / set / copy / clone', () => {
        expect(spherical.fromValues(2, 0.5, 1.2)).toEqual([2, 0.5, 1.2]);

        const out: Spherical = [0, 0, 0];
        expect(spherical.set(out, 3, 1, 2)).toBe(out);
        expect(out).toEqual([3, 1, 2]);

        const dst: Spherical = [0, 0, 0];
        expect(spherical.copy(dst, out)).toBe(dst);
        expect(dst).toEqual([3, 1, 2]);

        const cloned = spherical.clone(out);
        expect(cloned).toEqual(out);
        expect(cloned).not.toBe(out);
    });

    it('normalize sets r=1 and preserves the angles', () => {
        const out: Spherical = [0, 0, 0];
        spherical.normalize(out, [5, 0.7, 1.3]);
        expect(out).toEqual([1, 0.7, 1.3]);
    });

    it('scale multiplies r only', () => {
        const out: Spherical = [0, 0, 0];
        spherical.scale(out, [2, 0.7, 1.3], 3);
        expect(out).toEqual([6, 0.7, 1.3]);
    });

    describe('toVec3 (Three.js convention)', () => {
        const cases: [string, Spherical, Vec3][] = [
            ['north pole (phi=0) -> +Y', [1, 0, 0], [0, 1, 0]],
            ['south pole (phi=pi) -> -Y', [2, 0, PI], [0, -2, 0]],
            ['equator theta=0 -> +Z', [1, 0, PI / 2], [0, 0, 1]],
            ['equator theta=pi/2 -> +X', [1, PI / 2, PI / 2], [1, 0, 0]],
        ];
        it.each(cases)('%s', (_l, s, expected) => {
            const out: Vec3 = [0, 0, 0];
            spherical.toVec3(out, s);
            expect(out[0]).toBeCloseTo(expected[0]);
            expect(out[1]).toBeCloseTo(expected[1]);
            expect(out[2]).toBeCloseTo(expected[2]);
        });
    });

    describe('setFromVec3', () => {
        it('inverts toVec3 for a variety of directions', () => {
            const src: Vec3[] = [
                [0, 1, 0],
                [0, 0, 1],
                [1, 0, 0],
                [3, -4, 5],
                [-2, 7, -1],
            ];
            const s: Spherical = [0, 0, 0];
            const v: Vec3 = [0, 0, 0];
            for (const p of src) {
                spherical.setFromVec3(s, p);
                spherical.toVec3(v, s);
                expect(v[0]).toBeCloseTo(p[0]);
                expect(v[1]).toBeCloseTo(p[1]);
                expect(v[2]).toBeCloseTo(p[2]);
            }
        });

        it('is guarded at the origin (r=0 -> theta=phi=0)', () => {
            const s: Spherical = [9, 9, 9];
            spherical.setFromVec3(s, [0, 0, 0]);
            expect(s).toEqual([0, 0, 0]);
        });
    });

    describe('makeSafe', () => {
        it('clamps phi away from the poles, leaving r and theta', () => {
            const out: Spherical = [0, 0, 0];
            spherical.makeSafe(out, [2, 1.5, 0]);
            expect(out[0]).toBe(2);
            expect(out[1]).toBe(1.5);
            expect(out[2]).toBe(EPSILON);

            spherical.makeSafe(out, [2, 1.5, PI]);
            expect(out[2]).toBe(PI - EPSILON);
        });

        it('leaves an already-safe phi unchanged', () => {
            const out: Spherical = [0, 0, 0];
            spherical.makeSafe(out, [1, 0, PI / 2]);
            expect(out[2]).toBe(PI / 2);
        });
    });

    describe('fromVec2 / toVec2 (XZ plane)', () => {
        it('fromVec2 places the point on the equator (phi = pi/2)', () => {
            const out: Spherical = [0, 0, 0];
            spherical.fromVec2(out, [1, 0]);
            expect(out[0]).toBeCloseTo(1);
            expect(out[1]).toBeCloseTo(PI / 2); // atan2(x=1, z=0)
            expect(out[2]).toBeCloseTo(PI / 2);
        });

        it('roundtrips a Vec2 through spherical', () => {
            const s: Spherical = [0, 0, 0];
            const out: Vec2 = [0, 0];
            for (const v of [
                [1, 0],
                [0, 1],
                [3, 4],
                [-2, 5],
            ] as Vec2[]) {
                spherical.fromVec2(s, v);
                spherical.toVec2(out, s);
                expect(out[0]).toBeCloseTo(v[0]);
                expect(out[1]).toBeCloseTo(v[1]);
            }
        });
    });

    describe('lerp', () => {
        it('linearly interpolates r', () => {
            const out: Spherical = [0, 0, 0];
            spherical.lerp(out, [1, 0, 0], [3, 0, 0], 0.5);
            expect(out[0]).toBeCloseTo(2);
        });

        it('takes the shortest angular path across the +/-pi seam', () => {
            const out: Spherical = [0, 0, 0];
            // 3.0 and -3.0 are ~0.28 rad apart the short way (through +/-pi), not ~6 rad
            spherical.lerp(out, [1, 3.0, PI / 2], [1, -3.0, PI / 2], 0.5);
            expect(Math.abs(out[1])).toBeCloseTo(PI); // midpoint sits at the seam, not near 0
        });

        it('interpolates the midpoint for a simple theta delta', () => {
            const out: Spherical = [0, 0, 0];
            spherical.lerp(out, [1, 0, 0.4], [1, 1, 1.4], 0.5);
            expect(out[1]).toBeCloseTo(0.5);
            expect(out[2]).toBeCloseTo(0.9);
        });
    });

    describe('angleTo (great-circle central angle)', () => {
        it('is 0 for identical directions', () => {
            expect(spherical.angleTo([1, 0.7, 1.1], [5, 0.7, 1.1])).toBeCloseTo(0);
        });

        it('is pi between the two poles', () => {
            expect(spherical.angleTo([1, 0, 0], [1, 0, PI])).toBeCloseTo(PI);
        });

        it('is pi/2 between pole and equator', () => {
            expect(spherical.angleTo([1, 0, 0], [1, 0, PI / 2])).toBeCloseTo(PI / 2);
        });

        it('is pi/2 for equator points a quarter turn apart', () => {
            expect(spherical.angleTo([1, 0, PI / 2], [1, PI / 2, PI / 2])).toBeCloseTo(PI / 2);
        });

        it('ignores r', () => {
            expect(spherical.angleTo([1, 0.3, 1.0], [100, 0.9, 2.0])).toBeCloseTo(
                spherical.angleTo([1, 0.3, 1.0], [0.01, 0.9, 2.0]),
            );
        });
    });

    describe('equality & str', () => {
        it('equals is tolerant, exactEquals is strict', () => {
            expect(spherical.equals([1, 2, 3], [1 + EPSILON / 2, 2, 3])).toBe(true);
            expect(spherical.exactEquals([1, 2, 3], [1, 2, 3])).toBe(true);
            expect(spherical.exactEquals([1, 2, 3], [1 + EPSILON / 2, 2, 3])).toBe(false);
        });

        it('str formats the components', () => {
            expect(spherical.str([1, 2, 3])).toBe('Spherical(1, 2, 3)');
        });
    });
});
