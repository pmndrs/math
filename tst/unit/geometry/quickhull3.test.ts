import { describe, expect, it } from 'vitest';
import { quickhull3 } from '../../../src/geometry';

const EPS = 1e-6;

function flattenPoints(points: number[][]): number[] {
    const result: number[] = [];
    for (const p of points) {
        result.push(p[0], p[1], p[2]);
    }
    return result;
}

function isConvexHull(points: number[], faces: number[]): boolean {
    const n = points.length / 3;
    let nError = 0;

    for (let i = 0; i < faces.length; i += 3) {
        const v0 = faces[i];
        const v1 = faces[i + 1];
        const v2 = faces[i + 2];

        // Compute plane normal
        const p0x = points[v0 * 3];
        const p0y = points[v0 * 3 + 1];
        const p0z = points[v0 * 3 + 2];
        const p1x = points[v1 * 3];
        const p1y = points[v1 * 3 + 1];
        const p1z = points[v1 * 3 + 2];
        const p2x = points[v2 * 3];
        const p2y = points[v2 * 3 + 1];
        const p2z = points[v2 * 3 + 2];

        const e1x = p1x - p0x;
        const e1y = p1y - p0y;
        const e1z = p1z - p0z;
        const e2x = p2x - p0x;
        const e2y = p2y - p0y;
        const e2z = p2z - p0z;

        const nx = e1y * e2z - e1z * e2y;
        const ny = e1z * e2x - e1x * e2z;
        const nz = e1x * e2y - e1y * e2x;

        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len < EPS) continue;

        const normalX = nx / len;
        const normalY = ny / len;
        const normalZ = nz / len;

        const offset = normalX * p0x + normalY * p0y + normalZ * p0z;

        // Check all points are on or behind this face
        for (let j = 0; j < n; j++) {
            if (j === v0 || j === v1 || j === v2) continue;

            const px = points[j * 3];
            const py = points[j * 3 + 1];
            const pz = points[j * 3 + 2];
            const dist = normalX * px + normalY * py + normalZ * pz - offset;

            if (dist > EPS) {
                nError++;
            }
        }
    }

    return nError === 0;
}

describe('quickhull3', () => {
    describe('fromPoints', () => {
        it('should return empty array for less than 4 points', () => {
            expect(quickhull3([])).toEqual([]);
            expect(quickhull3([0, 0, 0])).toEqual([]);
            expect(quickhull3([0, 0, 0, 1, 0, 0])).toEqual([]);
            expect(quickhull3([0, 0, 0, 1, 0, 0, 0, 1, 0])).toEqual([]);
        });

        it('case: tetrahedron', () => {
            const points = flattenPoints([
                [0, 1, 0],
                [1, -1, 1],
                [-1, -1, 1],
                [0, -1, -1],
            ]);

            const result = quickhull3(points);

            expect(result.length).toBe(12);
            expect(isConvexHull(points, result)).toBe(true);

            // All indices in valid range
            for (const idx of result) {
                expect(idx).toBeGreaterThanOrEqual(0);
                expect(idx).toBeLessThan(4);
            }
        });

        it('case: cube', () => {
            const points = flattenPoints([
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 0],
                [1, 0, 1],
                [0, 1, 1],
                [1, 1, 1],
            ]);

            const result = quickhull3(points);

            expect(result.length).toBe(36); // 12 triangles
            expect(isConvexHull(points, result)).toBe(true);
        });

        it('case: cube with interior points', () => {
            const points = flattenPoints([
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 0],
                [1, 0, 1],
                [0, 1, 1],
                [1, 1, 1],
            ]);

            const padding = 0.000001;
            for (let i = 0; i < 100; i++) {
                const x = padding + Math.random() * (1 - 2 * padding);
                const y = padding + Math.random() * (1 - 2 * padding);
                const z = padding + Math.random() * (1 - 2 * padding);
                points.push(x, y, z);
            }

            const result = quickhull3(points);

            // Should still be 12 triangles (interior points don't affect hull)
            expect(result.length).toBe(36);
            expect(isConvexHull(points, result)).toBe(true);

            // Only first 8 vertices should be in hull
            const uniqueIndices = new Set(result);
            for (const idx of uniqueIndices) {
                expect(idx).toBeLessThan(8);
            }
        });

        it('case: octahedron', () => {
            const points = flattenPoints([
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [-1, 0, 0],
                [0, -1, 0],
                [0, 0, -1],
            ]);

            const result = quickhull3(points);

            expect(result.length).toBe(24); // 8 triangles
            expect(isConvexHull(points, result)).toBe(true);
        });

        it('predefined set of points #1', () => {
            const points = flattenPoints([
                [104, 216, 53],
                [104, 217, 52],
                [105, 216, 52],
                [88, 187, 43],
                [89, 187, 44],
                [89, 188, 43],
                [90, 187, 43],
            ]);

            const result = quickhull3(points);

            expect(result.length).toBeGreaterThan(0);
            expect(isConvexHull(points, result)).toBe(true);
        });

        it('predefined set of points #2', () => {
            const points = flattenPoints([
                [-0.8592737372964621, 83.55000647716224, 99.76234347559512],
                [1.525216130539775, 82.31873814947903, 27.226063096895814],
                [-71.64689642377198, -9.807108994573355, -20.06765645928681],
                [-83.98330193012953, -24.196470947936177, 45.60143379494548],
                [58.33653616718948, -15.815680427476764, 15.342222386971116],
                [-47.025314485654235, 97.0465809572488, -65.528974076733],
                [18.024734454229474, -43.655246682465076, -82.13481092825532],
                [-37.32072818093002, 1.8377598840743303, -12.133228313177824],
                [-92.33389408327639, 5.605767108500004, -13.743493286892772],
                [64.9183395318687, 52.24619274958968, -61.14645302295685],
            ]);

            const result = quickhull3(points);

            expect(result.length).toBeGreaterThan(0);
            expect(isConvexHull(points, result)).toBe(true);
        });

        it('should handle tetrahedron with specific ordering', () => {
            const points = flattenPoints([
                [-2, 0, 0],
                [2, 0, 0],
                [0, 0, 1],
                [0, 0.5, 0],
            ]);

            const result = quickhull3(points);

            expect(result.length).toBe(12); // 4 faces
            expect(isConvexHull(points, result)).toBe(true);
        });

        it('should handle points with varying scales', () => {
            const points = flattenPoints([
                [-100, 0, 0],
                [100, 0, 0],
                [0, 0, 100],
                [0, 50, 0],
                [0, -1, 0],
                [0, 5, 0],
                [0, -3, 0],
            ]);

            const result = quickhull3(points);

            expect(result.length).toBeGreaterThan(0);
            expect(result.length % 3).toBe(0);
            expect(isConvexHull(points, result)).toBe(true);
        });

        it('should handle duplicate vertices', () => {
            const points = flattenPoints([
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0, 0, 0], // duplicate
                [1, 0, 0], // duplicate
            ]);

            const result = quickhull3(points);

            expect(result.length).toBe(12); // 4 faces (tetrahedron)
            expect(isConvexHull(points, result)).toBe(true);
        });

        it('should return empty for collinear points', () => {
            const points = flattenPoints([
                [0, 0, 0],
                [1, 0, 0],
                [2, 0, 0],
                [3, 0, 0],
            ]);

            const result = quickhull3(points);

            expect(result).toEqual([]);
        });

        it('should handle points very close together', () => {
            const points = flattenPoints([
                [0, 0, 0],
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
                [0.001, 0.001, 0.001], // very close to origin
            ]);

            const result = quickhull3(points);

            expect(result.length).toBeGreaterThan(0);
            expect(result.length % 3).toBe(0);
            expect(isConvexHull(points, result)).toBe(true);
        });
    });
});
