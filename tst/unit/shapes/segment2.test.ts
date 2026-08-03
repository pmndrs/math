import { describe, expect, it } from 'vitest';
import { segment2, type Vec2 } from '../../../src/shapes';

describe('segment2.closestPoint', () => {
    it('returns the closest point for a point inside the segment', () => {
        const out: Vec2 = [0, 0];
        const point: Vec2 = [0.5, 0];
        const p: Vec2 = [0, 0];
        const q: Vec2 = [1, 0];
        segment2.closestPoint(out, point, p, q);
        expect(out[0]).toBeCloseTo(0.5);
        expect(out[1]).toBeCloseTo(0);
    });

    it('returns the closest endpoint for a point before the segment', () => {
        const out: Vec2 = [0, 0];
        const point: Vec2 = [-1, 0];
        const p: Vec2 = [0, 0];
        const q: Vec2 = [1, 0];
        segment2.closestPoint(out, point, p, q);
        expect(out[0]).toBeCloseTo(0);
        expect(out[1]).toBeCloseTo(0);
    });

    it('returns the closest endpoint for a point after the segment', () => {
        const out: Vec2 = [0, 0];
        const point: Vec2 = [2, 0];
        const p: Vec2 = [0, 0];
        const q: Vec2 = [1, 0];
        segment2.closestPoint(out, point, p, q);
        expect(out[0]).toBeCloseTo(1);
        expect(out[1]).toBeCloseTo(0);
    });

    it('works for vertical segments', () => {
        const out: Vec2 = [0, 0];
        const point: Vec2 = [0, 2];
        const p: Vec2 = [0, 0];
        const q: Vec2 = [0, 1];
        segment2.closestPoint(out, point, p, q);
        expect(out[0]).toBeCloseTo(0);
        expect(out[1]).toBeCloseTo(1);
    });

    it('works for diagonal segments', () => {
        const out: Vec2 = [0, 0];
        const point: Vec2 = [1, 1];
        const p: Vec2 = [0, 0];
        const q: Vec2 = [2, 2];
        segment2.closestPoint(out, point, p, q);
        expect(out[0]).toBeCloseTo(1);
        expect(out[1]).toBeCloseTo(1);
    });
});
