import type { Vec2 } from '../core/vec2';

/**
 * A 2D polygon is represented as a flat array of vertex coordinates laid out as
 * `[x0, y0, x1, y1, ...]`, together with an explicit vertex count `n`.
 *
 * The count is passed separately (rather than derived from `verts.length`) so a
 * single scratch buffer can be reused across polygons of different sizes: only
 * the first `n` vertices are read, and any trailing slots are ignored. Vertices
 * are assumed to be ordered (clockwise or counter-clockwise) around the polygon.
 */

/**
 * Returns the signed area of the polygon using the shoelace formula.
 * The result is positive when the vertices wind counter-clockwise and negative
 * when they wind clockwise, so the sign can be used to determine winding order.
 *
 * @param verts polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `verts`
 * @returns the signed area
 */
export function signedArea(verts: number[], n: number): number {
    let area = 0;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = verts[i * 2];
        const yi = verts[i * 2 + 1];
        const xj = verts[j * 2];
        const yj = verts[j * 2 + 1];
        area += xj * yi - xi * yj;
    }
    return area / 2;
}

/**
 * Returns the (non-negative) area of the polygon.
 *
 * @param verts polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `verts`
 * @returns the absolute area
 */
export function area(verts: number[], n: number): number {
    return Math.abs(signedArea(verts, n));
}

/**
 * Tests whether a point lies inside the polygon. Works for both convex and
 * concave polygons. Points exactly on an edge or vertex are considered inside.
 *
 * @param verts polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `verts`
 * @param point the point to test
 * @returns true if the point is inside (or on the boundary of) the polygon
 */
export function containsPoint(verts: number[], n: number, point: Vec2): boolean {
    let inside = false;
    const x = point[0];
    const y = point[1];

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = verts[i * 2];
        const yi = verts[i * 2 + 1];
        const xj = verts[j * 2];
        const yj = verts[j * 2 + 1];

        // Signed area of the triangle (j, i, point): zero when the point lies on
        // the edge, sign tells which side it is on.
        const where = (yi - yj) * (x - xi) - (xi - xj) * (y - yi);

        if (yj < yi) {
            // Upward edge: count a crossing when the point's y is within [yj, yi).
            if (y >= yj && y < yi) {
                if (where === 0) return true; // on edge
                if (where > 0) {
                    if (y === yj) {
                        // Ray passes exactly through vertex j; only toggle when the
                        // previous vertex is below, to avoid double-counting.
                        if (y > verts[(j === 0 ? n - 1 : j - 1) * 2 + 1]) inside = !inside;
                    } else {
                        inside = !inside;
                    }
                }
            }
        } else if (yi < yj) {
            // Downward edge: count a crossing when the point's y is within (yi, yj].
            if (y > yi && y <= yj) {
                if (where === 0) return true; // on edge
                if (where < 0) {
                    if (y === yj) {
                        if (y < verts[(j === 0 ? n - 1 : j - 1) * 2 + 1]) inside = !inside;
                    } else {
                        inside = !inside;
                    }
                }
            }
        } else if (y === yi && ((x >= xj && x <= xi) || (x >= xi && x <= xj))) {
            // Point lies on a horizontal edge.
            return true;
        }
    }

    return inside;
}

/**
 * Computes the area-weighted centroid (center of mass) of the polygon.
 * For a degenerate (zero-area) polygon this falls back to the average of the
 * vertices.
 *
 * @param out the vector to store the centroid
 * @param verts polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `verts`
 * @returns out
 */
export function centroid(out: Vec2, verts: number[], n: number): Vec2 {
    let cx = 0;
    let cy = 0;
    let a2 = 0; // twice the signed area

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = verts[i * 2];
        const yi = verts[i * 2 + 1];
        const xj = verts[j * 2];
        const yj = verts[j * 2 + 1];
        const cross = xj * yi - xi * yj;
        a2 += cross;
        cx += (xj + xi) * cross;
        cy += (yj + yi) * cross;
    }

    if (a2 === 0) {
        // Degenerate polygon (collinear vertices): use the vertex average.
        let sx = 0;
        let sy = 0;
        for (let i = 0; i < n; i++) {
            sx += verts[i * 2];
            sy += verts[i * 2 + 1];
        }
        out[0] = sx / n;
        out[1] = sy / n;
        return out;
    }

    const inv = 1 / (3 * a2);
    out[0] = cx * inv;
    out[1] = cy * inv;
    return out;
}

/**
 * Returns the perimeter (sum of edge lengths) of the polygon.
 *
 * @param verts polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `verts`
 * @returns the perimeter
 */
export function perimeter(verts: number[], n: number): number {
    let total = 0;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const dx = verts[i * 2] - verts[j * 2];
        const dy = verts[i * 2 + 1] - verts[j * 2 + 1];
        total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
}

/**
 * Returns the winding order of the polygon from the sign of its signed area:
 * `1` for counter-clockwise, `-1` for clockwise, and `0` for a degenerate
 * (zero-area) polygon.
 *
 * @param verts polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `verts`
 * @returns 1 (CCW), -1 (CW), or 0 (degenerate)
 */
export function winding(verts: number[], n: number): number {
    const a = signedArea(verts, n);
    if (a > 0) return 1;
    if (a < 0) return -1;
    return 0;
}

/**
 * Tests whether the polygon is convex. Works for both winding orders. Assumes a
 * simple (non-self-intersecting) polygon; collinear vertices are allowed.
 *
 * @param verts polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `verts`
 * @returns true if the polygon is convex
 */
export function isConvex(verts: number[], n: number): boolean {
    if (n < 3) return false;

    let sign = 0;
    for (let i = 0; i < n; i++) {
        const p = ((i - 1 + n) % n) * 2;
        const c = i * 2;
        const q = ((i + 1) % n) * 2;

        // Cross product of the incoming and outgoing edges at vertex i.
        const ax = verts[c] - verts[p];
        const ay = verts[c + 1] - verts[p + 1];
        const bx = verts[q] - verts[c];
        const by = verts[q + 1] - verts[c + 1];
        const cross = ax * by - ay * bx;

        if (cross !== 0) {
            const s = cross > 0 ? 1 : -1;
            if (sign === 0) sign = s;
            else if (s !== sign) return false;
        }
    }

    return true;
}
