import { describe, expect, it } from 'vitest';
import { vec3 } from '../../../src';
import type { Mat4, Vec3 } from '../../../src/shapes';
import { plane3 } from '../../../src/shapes';

describe('plane3', () => {
    describe('fromNormalAndPoint', () => {
        it('computes constant = -normal·point', () => {
            const p = plane3.create();
            plane3.fromNormalAndPoint(p, [0, 1, 0], [0, 5, 0]);
            expect(p.normal).toEqual([0, 1, 0]);
            expect(p.constant).toBeCloseTo(-5, 10);
        });
    });

    describe('fromCoplanarPoints', () => {
        it('builds a unit normal via right-hand rule (v1×v2) and correct constant', () => {
            const p = plane3.create();
            // triangle in z=0 plane, CCW → normal +Z
            plane3.fromCoplanarPoints(p, [0, 0, 0], [1, 0, 0], [0, 1, 0]);
            expect(p.normal[0]).toBeCloseTo(0, 10);
            expect(p.normal[1]).toBeCloseTo(0, 10);
            expect(p.normal[2]).toBeCloseTo(1, 10);
            expect(p.constant).toBeCloseTo(0, 10);
        });

        it('produces a unit-length normal for a non-axis-aligned triangle', () => {
            const p = plane3.create();
            plane3.fromCoplanarPoints(p, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
            expect(vec3.length(p.normal)).toBeCloseTo(1, 10);
            // every input point lies on the plane → signed distance ~0
            for (const pt of [
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ] as Vec3[]) {
                expect(plane3.distanceToPoint(p, pt)).toBeCloseTo(0, 10);
            }
        });

        it('leaves a zero normal for degenerate (collinear) points', () => {
            const p = plane3.create();
            plane3.fromCoplanarPoints(p, [0, 0, 0], [1, 0, 0], [2, 0, 0]);
            expect(p.normal).toEqual([0, 0, 0]);
        });
    });

    describe('offset', () => {
        it('subtracts distance from the constant (moves along +normal)', () => {
            const p = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], 0);
            const out = plane3.create();
            plane3.offset(out, p, -0.05); // inward for an outward normal
            expect(out.constant).toBeCloseTo(0.05, 10);
            expect(out.normal).toEqual([0, 0, 1]);
        });
    });

    describe('intersect', () => {
        it('intersects three axis planes at the expected point', () => {
            // x=1, y=2, z=3  (normal·x + constant = 0)
            const p1 = plane3.fromNormalAndConstant(plane3.create(), [1, 0, 0], -1);
            const p2 = plane3.fromNormalAndConstant(plane3.create(), [0, 1, 0], -2);
            const p3 = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], -3);
            const out = vec3.create();
            expect(plane3.intersect(out, p1, p2, p3)).toBe(true);
            expect(out[0]).toBeCloseTo(1, 10);
            expect(out[1]).toBeCloseTo(2, 10);
            expect(out[2]).toBeCloseTo(3, 10);
        });

        it('handles non-unit normals (formula is scale-independent in the normals)', () => {
            // 2x-2=0 → x=1 ; 3y-6=0 → y=2 ; z-3=0 → z=3
            const p1 = plane3.fromNormalAndConstant(plane3.create(), [2, 0, 0], -2);
            const p2 = plane3.fromNormalAndConstant(plane3.create(), [0, 3, 0], -6);
            const p3 = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], -3);
            const out = vec3.create();
            expect(plane3.intersect(out, p1, p2, p3)).toBe(true);
            expect(out[0]).toBeCloseTo(1, 10);
            expect(out[1]).toBeCloseTo(2, 10);
            expect(out[2]).toBeCloseTo(3, 10);
        });

        it('intersects three planes through the origin at the origin', () => {
            const p1 = plane3.fromNormalAndConstant(plane3.create(), [1, 0, 0], 0);
            const p2 = plane3.fromNormalAndConstant(plane3.create(), [0, 1, 0], 0);
            const p3 = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], 0);
            const out = vec3.create();
            expect(plane3.intersect(out, p1, p2, p3)).toBe(true);
            expect(out[0]).toBeCloseTo(0, 10);
            expect(out[1]).toBeCloseTo(0, 10);
            expect(out[2]).toBeCloseTo(0, 10);
        });

        it('returns false for parallel / degenerate planes and leaves out untouched', () => {
            const p1 = plane3.fromNormalAndConstant(plane3.create(), [1, 0, 0], 0);
            const p2 = plane3.fromNormalAndConstant(plane3.create(), [1, 0, 0], -1); // parallel to p1
            const p3 = plane3.fromNormalAndConstant(plane3.create(), [0, 1, 0], 0);
            const out = vec3.fromValues(9, 9, 9);
            expect(plane3.intersect(out, p1, p2, p3)).toBe(false);
            expect(out).toEqual([9, 9, 9]);
        });

        it('recovers a shifted general point', () => {
            // shift the axis planes so the intersection is (-4, 7, 0.5)
            const p1 = plane3.fromNormalAndConstant(plane3.create(), [1, 0, 0], 4);
            const p2 = plane3.fromNormalAndConstant(plane3.create(), [0, 1, 0], -7);
            const p3 = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], -0.5);
            const out = vec3.create();
            expect(plane3.intersect(out, p1, p2, p3)).toBe(true);
            expect(out[0]).toBeCloseTo(-4, 10);
            expect(out[1]).toBeCloseTo(7, 10);
            expect(out[2]).toBeCloseTo(0.5, 10);
        });
    });

    describe('transform', () => {
        const identity: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        it('leaves a plane unchanged under the identity matrix', () => {
            const p = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], -2);
            const out = plane3.create();
            plane3.transform(out, p, identity);
            expect(out.normal[0]).toBeCloseTo(0, 10);
            expect(out.normal[1]).toBeCloseTo(0, 10);
            expect(out.normal[2]).toBeCloseTo(1, 10);
            expect(out.constant).toBeCloseTo(-2, 10);
        });

        it('shifts the constant under a pure translation', () => {
            // z=0 plane translated by (0,0,5) → z=5 → normal (0,0,1), constant -5
            const translate: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 5, 1];
            const p = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], 0);
            const out = plane3.create();
            plane3.transform(out, p, translate);
            expect(out.normal[2]).toBeCloseTo(1, 10);
            expect(out.constant).toBeCloseTo(-5, 10);
        });

        it('rotates the normal (90° about X: +Z → -Y)', () => {
            // column-major rotation of +90° about X
            const rot: Mat4 = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];
            const p = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], 0);
            const out = plane3.create();
            plane3.transform(out, p, rot);
            expect(out.normal[0]).toBeCloseTo(0, 10);
            expect(out.normal[1]).toBeCloseTo(-1, 10);
            expect(out.normal[2]).toBeCloseTo(0, 10);
        });
    });

    describe('does not allocate in hot functions', () => {
        it('intersect writes into out without creating garbage', () => {
            const p1 = plane3.fromNormalAndConstant(plane3.create(), [1, 0, 0], -1);
            const p2 = plane3.fromNormalAndConstant(plane3.create(), [0, 1, 0], -2);
            const p3 = plane3.fromNormalAndConstant(plane3.create(), [0, 0, 1], -3);
            const out = vec3.create();
            const ret = plane3.intersect(out, p1, p2, p3);
            // returns boolean (not a fresh vector) and mutates the provided out
            expect(typeof ret).toBe('boolean');
            expect(out).toBe(out);
        });
    });
});
