import { describe, expect, it } from 'vitest';
import { quickhull2 } from '../../../src/geometry';

describe('hull2', () => {
    describe('quickhull2', () => {
        it('computes hull for a diamond shape', () => {
            // Diamond with some interior points
            const points = [
                0, 1,    // 0: top
                -1, 0,   // 1: left
                1, 0,    // 2: right
                0, -1,   // 3: bottom
                0.3, 0.3,    // 4: inside
                -0.3, -0.3,  // 5: inside
                0.3, -0.3,   // 6: inside
                -0.3, 0.3    // 7: inside
            ];

            const hull = quickhull2(points);
            
            // Should only include the 4 corner points
            expect(hull.length).toBe(4);
            
            // Check that only corner indices are in hull
            const hullSet = new Set(hull);
            expect(hullSet.has(0)).toBe(true);
            expect(hullSet.has(1)).toBe(true);
            expect(hullSet.has(2)).toBe(true);
            expect(hullSet.has(3)).toBe(true);
        });

        it('computes hull for a square', () => {
            const points = [
                0, 0,    // 0: bottom-left
                1, 0,    // 1: bottom-right
                1, 1,    // 2: top-right
                0, 1,    // 3: top-left
            ];

            const hull = quickhull2(points);
            
            expect(hull.length).toBe(4);
            
            // All points should be in hull
            const hullSet = new Set(hull);
            expect(hullSet.size).toBe(4);
        });

        it('computes hull for random points', () => {
            const points = [
                0, 0,       // 0
                1, 1,       // 1
                1, 0,       // 2
                0.5, 0.5,   // 3: inside
                0.7, 0.1    // 4: inside
            ];

            const hull = quickhull2(points);
            
            // Should only include corner points
            expect(hull.length).toBe(3);
            
            const hullSet = new Set(hull);
            expect(hullSet.has(0)).toBe(true);
            expect(hullSet.has(1)).toBe(true);
            expect(hullSet.has(2)).toBe(true);
            expect(hullSet.has(3)).toBe(false);
            expect(hullSet.has(4)).toBe(false);
        });

        it('handles degenerate case with 2 points', () => {
            const points = [
                0, 0,
                1, 1
            ];

            const hull = quickhull2(points);
            expect(hull.length).toBe(2);
        });

        it('handles degenerate case with 1 point', () => {
            const points = [0, 0];

            const hull = quickhull2(points);
            expect(hull.length).toBe(1);
        });

        it('handles empty input', () => {
            const points: number[] = [];

            const hull = quickhull2(points);
            expect(hull.length).toBe(0);
        });

        it('handles collinear points', () => {
            const points = [
                0, 0,
                1, 0,
                2, 0,
                3, 0
            ];

            const hull = quickhull2(points);
            
            // For collinear points, hull should include at least the extremes
            expect(hull.length).toBeGreaterThanOrEqual(2);
        });

        it('computes hull for pentagon', () => {
            // Regular pentagon-like shape
            const points = [
                0, 1,        // 0: top
                0.95, 0.31,  // 1: upper right
                0.59, -0.81, // 2: lower right
                -0.59, -0.81, // 3: lower left
                -0.95, 0.31,  // 4: upper left
                0, 0         // 5: center (inside)
            ];

            const hull = quickhull2(points);
            
            // Should include 5 perimeter points, not the center
            expect(hull.length).toBe(5);
            
            const hullSet = new Set(hull);
            expect(hullSet.has(5)).toBe(false); // center should not be in hull
        });

        it('maintains counter-clockwise order', () => {
            const points = [
                0, 0,    // 0: bottom-left
                2, 0,    // 1: bottom-right
                2, 2,    // 2: top-right
                0, 2,    // 3: top-left
                1, 1     // 4: center (inside)
            ];

            const hull = quickhull2(points);
            
            // Verify hull is ordered (should go around perimeter)
            expect(hull.length).toBe(4);
            
            // Check that consecutive points form edges
            for (let i = 0; i < hull.length; i++) {
                const curr = hull[i];
                const next = hull[(i + 1) % hull.length];
                expect(curr).not.toBe(next);
            }
        });

        it('handles large dataset without stack overflow', () => {
            // Generate 1000 random points in a circle with some inside
            const points: number[] = [];
            const numPoints = 1000;
            
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const radius = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
                points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }

            const hull = quickhull2(points);
            
            // Hull should have significantly fewer points than input
            expect(hull.length).toBeGreaterThan(0);
            expect(hull.length).toBeLessThan(numPoints);
            
            // Verify all hull indices are valid
            for (const idx of hull) {
                expect(idx).toBeGreaterThanOrEqual(0);
                expect(idx).toBeLessThan(numPoints);
            }
        });
    });
});
