import { describe, expect, it } from 'vitest';
import { polar } from '../../../src';
import type { Polar, Vec2 } from '../../../src';

const PI = Math.PI;

describe('polar', () => {
    it('create returns the unit polar [1, 0]', () => {
        expect(polar.create()).toEqual([1, 0]);
    });

    it('fromValues / set / clone / copy', () => {
        expect(polar.fromValues(2, PI / 4)).toEqual([2, PI / 4]);

        const out: Polar = [0, 0];
        polar.set(out, 3, 1);
        expect(out).toEqual([3, 1]);

        const c = polar.clone(out);
        expect(c).toEqual([3, 1]);
        expect(c).not.toBe(out);

        const dst: Polar = [0, 0];
        polar.copy(dst, out);
        expect(dst).toEqual([3, 1]);
    });

    describe('Cartesian conversion (standard 2D convention: +X, CCW)', () => {
        it('toVec2 uses x = r*cos(theta), y = r*sin(theta)', () => {
            const out: Vec2 = [0, 0];
            polar.toVec2(out, [2, 0]);
            expect(out[0]).toBeCloseTo(2);
            expect(out[1]).toBeCloseTo(0);

            polar.toVec2(out, [2, PI / 2]);
            expect(out[0]).toBeCloseTo(0);
            expect(out[1]).toBeCloseTo(2);
        });

        it('setFromVec2 uses r = hypot, theta = atan2(y, x)', () => {
            const p: Polar = [0, 0];
            polar.setFromVec2(p, [0, 3]);
            expect(p[0]).toBeCloseTo(3);
            expect(p[1]).toBeCloseTo(PI / 2);
        });

        it('fromVec2 is an alias of setFromVec2', () => {
            expect(polar.fromVec2).toBe(polar.setFromVec2);
        });

        it('round-trips through Vec2', () => {
            const points: Vec2[] = [
                [1, 0],
                [-2, 3],
                [0.5, -4],
                [-1, -1],
            ];
            for (const v of points) {
                const p: Polar = [0, 0];
                const back: Vec2 = [0, 0];
                polar.setFromVec2(p, v);
                polar.toVec2(back, p);
                expect(back[0]).toBeCloseTo(v[0]);
                expect(back[1]).toBeCloseTo(v[1]);
            }
        });

        it('maps the origin to r=0, theta=0', () => {
            const p: Polar = [9, 9];
            polar.setFromVec2(p, [0, 0]);
            expect(p).toEqual([0, 0]);
        });
    });

    describe('operations', () => {
        it('normalize sets r=1 and keeps theta', () => {
            const out: Polar = [0, 0];
            polar.normalize(out, [5, 1.2]);
            expect(out).toEqual([1, 1.2]);
        });

        it('scale multiplies r only', () => {
            const out: Polar = [0, 0];
            polar.scale(out, [2, 1], 3);
            expect(out).toEqual([6, 1]);
        });

        it('rotate adds to theta and wraps into (-pi, pi]', () => {
            const out: Polar = [0, 0];
            polar.rotate(out, [1, (3 * PI) / 4], PI / 2);
            expect(out[0]).toBe(1);
            expect(out[1]).toBeCloseTo((3 * PI) / 4 + PI / 2 - 2 * PI); // wrapped
        });

        it('lerp takes the shortest angular path', () => {
            const out: Polar = [0, 0];
            // from -170 deg to 170 deg should cross +/-180 deg, not sweep the long way
            polar.lerp(out, [1, (-170 * PI) / 180], [3, (170 * PI) / 180], 0.5);
            expect(out[0]).toBeCloseTo(2);
            expect(Math.abs(out[1])).toBeCloseTo(PI); // midpoint at +/-180 deg, not 0 deg
        });
    });

    describe('queries', () => {
        it('angleTo returns the wrapped magnitude in [0, pi]', () => {
            expect(polar.angleTo([1, (-170 * PI) / 180], [1, (170 * PI) / 180])).toBeCloseTo((20 * PI) / 180);
            expect(polar.angleTo([1, 0], [2, PI / 2])).toBeCloseTo(PI / 2);
        });

        it('distance is the chord length (law of cosines)', () => {
            // two unit points 90 deg apart -> chord = sqrt(2)
            expect(polar.distance([1, 0], [1, PI / 2])).toBeCloseTo(Math.SQRT2);
            // same direction -> |r difference|
            expect(polar.distance([1, 0.7], [4, 0.7])).toBeCloseTo(3);
        });
    });

    describe('equality', () => {
        it('equals is approximate, exactEquals is strict', () => {
            expect(polar.equals([1, 1], [1 + 1e-9, 1])).toBe(true);
            expect(polar.exactEquals([1, 1], [1 + 1e-9, 1])).toBe(false);
            expect(polar.exactEquals([1, 1], [1, 1])).toBe(true);
        });
    });

    it('str formats the components', () => {
        expect(polar.str([2, 0.5])).toBe('Polar(2, 0.5)');
    });
});
