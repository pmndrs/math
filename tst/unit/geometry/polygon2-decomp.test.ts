import { describe, expect, it } from 'vitest';
import { decomposePolygon2Quality, decomposePolygon2Quick } from '../../../src/geometry';
import { polygon2 } from '../../../src/shapes';

describe('polygon2 decomposition', () => {
    // L-shape (one reflex vertex), CCW, area 6.
    const lShape = [0, 0, 4, 0, 4, 1, 1, 1, 1, 3, 0, 3];
    // Plus/cross (four reflex vertices), area 5.
    const plus = [1, 0, 2, 0, 2, 1, 3, 1, 3, 2, 2, 2, 2, 3, 1, 3, 1, 2, 0, 2, 0, 1, 1, 1];
    // Convex square.
    const square4 = [0, 0, 2, 0, 2, 2, 0, 2];

    // Asserts pieces are all convex and their areas sum to the original's area.
    const checkPieces = (pieces: number[][], expectedArea: number) => {
        expect(pieces.length).toBeGreaterThan(0);
        let sum = 0;
        for (const piece of pieces) {
            const count = piece.length / 2;
            expect(count).toBeGreaterThanOrEqual(3);
            expect(polygon2.isConvex(piece, count)).toBe(true);
            sum += polygon2.area(piece, count);
        }
        expect(sum).toBeCloseTo(expectedArea);
    };

    describe('decomposePolygon2Quick', () => {
        it('returns the polygon itself when already convex', () => {
            const pieces = decomposePolygon2Quick(square4, 4);
            expect(pieces.length).toBe(1);
            checkPieces(pieces, 4);
        });

        it('splits an L-shape into convex pieces covering the same area', () => {
            const pieces = decomposePolygon2Quick(lShape, 6);
            checkPieces(pieces, 6);
        });

        it('decomposes a plus shape into convex pieces', () => {
            const pieces = decomposePolygon2Quick(plus, 12);
            checkPieces(pieces, 5);
        });

        it('accepts clockwise input (normalises winding)', () => {
            // Reverse the L-shape to make it clockwise.
            const cw: number[] = [];
            for (let i = 5; i >= 0; i--) cw.push(lShape[i * 2], lShape[i * 2 + 1]);
            checkPieces(decomposePolygon2Quick(cw, 6), 6);
        });

        it('returns empty for degenerate input', () => {
            expect(decomposePolygon2Quick([0, 0, 1, 1], 2)).toEqual([]);
        });
    });

    describe('decomposePolygon2Quality', () => {
        it('returns the polygon itself when already convex', () => {
            const pieces = decomposePolygon2Quality(square4, 4);
            expect(pieces.length).toBe(1);
            checkPieces(pieces, 4);
        });

        it('splits an L-shape into exactly two convex pieces', () => {
            const pieces = decomposePolygon2Quality(lShape, 6);
            expect(pieces.length).toBe(2);
            checkPieces(pieces, 6);
        });

        it('decomposes a plus shape into convex pieces', () => {
            const pieces = decomposePolygon2Quality(plus, 12);
            checkPieces(pieces, 5);
        });

        it('uses no more pieces than the quick decomposition', () => {
            const quick = decomposePolygon2Quick(plus, 12);
            const quality = decomposePolygon2Quality(plus, 12);
            expect(quality.length).toBeLessThanOrEqual(quick.length);
        });
    });
});
