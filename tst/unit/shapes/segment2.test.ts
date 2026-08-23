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

describe('segment2.intersects', () => {
    it('is true for crossing segments', () => {
        expect(segment2.intersects([0, 0], [2, 0], [1, -1], [1, 1])).toBe(true);
    });

    it('is false for non-crossing segments', () => {
        expect(segment2.intersects([0, 0], [2, 0], [3, -1], [3, 1])).toBe(false);
    });

    it('counts endpoint contact as an intersection', () => {
        expect(segment2.intersects([0, 0], [2, 0], [2, 0], [2, 2])).toBe(true);
    });

    it('is false for parallel (collinear) segments', () => {
        expect(segment2.intersects([0, 0], [2, 0], [1, 0], [3, 0])).toBe(false);
    });
});

describe('segment2.intersection', () => {
    it('returns the crossing point', () => {
        const out: Vec2 = [0, 0];
        const result = segment2.intersection(out, [0, 0], [2, 0], [1, -1], [1, 1]);
        expect(result).toBe(out);
        expect(out[0]).toBeCloseTo(1);
        expect(out[1]).toBeCloseTo(0);
    });

    it('returns null when the segments do not intersect', () => {
        const out: Vec2 = [0, 0];
        expect(segment2.intersection(out, [0, 0], [2, 0], [3, -1], [3, 1])).toBeNull();
    });

    it('returns null for parallel segments', () => {
        const out: Vec2 = [0, 0];
        expect(segment2.intersection(out, [0, 0], [2, 0], [0, 1], [2, 1])).toBeNull();
    });
});
