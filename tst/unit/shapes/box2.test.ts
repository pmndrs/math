import { describe, expect, it } from 'vitest';
import type { Box2, Circle, Vec2 } from '../../../src/shapes';
import { box2 } from '../../../src/shapes';

describe('box2', () => {
    describe('create', () => {
        it('should create an empty box with correct infinity values', () => {
            const box = box2.create();

            expect(box[0]).toBe(Number.POSITIVE_INFINITY);
            expect(box[1]).toBe(Number.POSITIVE_INFINITY);
            expect(box[2]).toBe(Number.NEGATIVE_INFINITY);
            expect(box[3]).toBe(Number.NEGATIVE_INFINITY);
        });
    });

    describe('setFromCenterAndSize', () => {
        it('should build min/max from a center and size', () => {
            const box = box2.create();
            box2.setFromCenterAndSize(box, [1, 2], [4, 2]);

            expect(box).toEqual([-1, 1, 3, 3]);
        });
    });

    describe('center / size / extents / area', () => {
        it('should compute derived quantities', () => {
            const box: Box2 = [0, 0, 4, 2];

            expect(box2.center([0, 0], box)).toEqual([2, 1]);
            expect(box2.size([0, 0], box)).toEqual([4, 2]);
            expect(box2.extents([0, 0], box)).toEqual([2, 1]);
            expect(box2.area(box)).toBe(8);
        });
    });

    describe('expandByPoint / union', () => {
        it('should expand to include a point', () => {
            const box: Box2 = [0, 0, 1, 1];
            box2.expandByPoint(box, box, [3, -2]);

            expect(box).toEqual([0, -2, 3, 1]);
        });

        it('should union two boxes', () => {
            const out = box2.create();
            box2.union(out, [0, 0, 1, 1], [-1, 2, 2, 3]);

            expect(out).toEqual([-1, 0, 2, 3]);
        });
    });

    describe('containsPoint', () => {
        it('should return true when the point is inside', () => {
            const box: Box2 = [0, 0, 2, 2];

            expect(box2.containsPoint(box, [1, 1])).toBe(true);
            expect(box2.containsPoint(box, [2, 0])).toBe(true); // on boundary
            expect(box2.containsPoint(box, [3, 1])).toBe(false);
        });
    });

    describe('containsBox2', () => {
        it('should detect full containment', () => {
            const outer: Box2 = [0, 0, 4, 4];

            expect(box2.containsBox2(outer, [1, 1, 3, 3])).toBe(true);
            expect(box2.containsBox2(outer, [1, 1, 5, 3])).toBe(false);
        });
    });

    describe('intersectsBox2', () => {
        it('should detect overlap and separation', () => {
            expect(box2.intersectsBox2([0, 0, 2, 2], [1, 1, 3, 3])).toBe(true);
            expect(box2.intersectsBox2([0, 0, 2, 2], [3, 3, 4, 4])).toBe(false);
            expect(box2.intersectsBox2([0, 0, 2, 2], [2, 2, 4, 4])).toBe(true); // touching
        });
    });

    describe('intersectsCircle', () => {
        it('should detect a circle overlapping the box', () => {
            const box: Box2 = [0, 0, 2, 2];

            const inside: Circle = { center: [1, 1], radius: 0.5 };
            expect(box2.intersectsCircle(box, inside)).toBe(true);

            const nearCorner: Circle = { center: [3, 3], radius: 1.5 };
            expect(box2.intersectsCircle(box, nearCorner)).toBe(true);

            const away: Circle = { center: [5, 5], radius: 1 };
            expect(box2.intersectsCircle(box, away)).toBe(false);
        });
    });
});
