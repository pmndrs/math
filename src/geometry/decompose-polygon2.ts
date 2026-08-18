import { isReflexVertex, reverse, signedArea } from '../shapes/polygon2';

/*
 * Convex decomposition
 *
 * Splits a simple (non-self-intersecting) polygon into convex sub-polygons.
 * Polygons use the flat `[x0, y0, x1, y1, ...]` representation from math/shapes
 * (polygon2), with an explicit vertex count `n`.
 *
 * Ported to the flat representation from poly-decomp-es
 * (https://github.com/pmndrs/poly-decomp-es), MIT licensed, which itself is
 * based on Mark Bayazit's algorithm. Each returned sub-polygon is a fresh flat
 * `[x0, y0, ...]` array, wound counter-clockwise.
 */

const _decompIsect: [number, number] = [0, 0];

/**
 * Twice the signed area of the triangle (a, b, c); positive when
 * counter-clockwise. This is the inlined, coordinate-form counterpart of
 * `triangle2.signedArea` — kept local (and undivided) to avoid Vec2 allocations
 * in the hot decomposition loops, where only the sign and relative magnitude
 * matter.
 */
function triArea(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
    return (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
}

/** Cyclic x lookup: returns the x of vertex `i` (wrapping) in a flat polygon. */
function atX(poly: number[], i: number): number {
    const s = poly.length / 2;
    return poly[(i < 0 ? (i % s) + s : i % s) * 2];
}

/** Cyclic y lookup: returns the y of vertex `i` (wrapping) in a flat polygon. */
function atY(poly: number[], i: number): number {
    const s = poly.length / 2;
    return poly[(i < 0 ? (i % s) + s : i % s) * 2 + 1];
}

/** True if vertex `i` is reflex; delegates to the shared polygon2 primitive. */
function isReflex(poly: number[], i: number): boolean {
    return isReflexVertex(poly, poly.length / 2, i);
}

function sqDist(ax: number, ay: number, bx: number, by: number): number {
    const dx = bx - ax;
    const dy = by - ay;
    return dx * dx + dy * dy;
}

/** Intersection point of the two infinite lines (p1,p2) and (q1,q2); writes [0,0] if parallel. */
function lineIntersection(
    out: [number, number],
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
    q1x: number,
    q1y: number,
    q2x: number,
    q2y: number,
): [number, number] {
    const a1 = p2y - p1y;
    const b1 = p1x - p2x;
    const c1 = a1 * p1x + b1 * p1y;
    const a2 = q2y - q1y;
    const b2 = q1x - q2x;
    const c2 = a2 * q1x + b2 * q1y;
    const det = a1 * b2 - a2 * b1;
    if (det !== 0) {
        out[0] = (b2 * c1 - b1 * c2) / det;
        out[1] = (a1 * c2 - a2 * c1) / det;
    } else {
        out[0] = 0;
        out[1] = 0;
    }
    return out;
}

/**
 * True if the closed segments (p1,p2) and (q1,q2) intersect. Inlined,
 * coordinate-form counterpart of `segment2.intersects`, kept local to avoid
 * Vec2 allocations in the visibility loops.
 */
function segmentsIntersect(
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
    q1x: number,
    q1y: number,
    q2x: number,
    q2y: number,
): boolean {
    const rx = p2x - p1x;
    const ry = p2y - p1y;
    const ex = q2x - q1x;
    const ey = q2y - q1y;

    const denom = rx * ey - ry * ex;
    if (denom === 0) return false; // parallel or collinear

    const wx = q1x - p1x;
    const wy = q1y - p1y;
    const u = (wx * ey - wy * ex) / denom;
    const v = (wx * ry - wy * rx) / denom;

    return u >= 0 && u <= 1 && v >= 0 && v <= 1;
}

/** Appends vertices `from..to-1` of `src` onto `dst` (both flat arrays). */
function appendRange(dst: number[], src: number[], from: number, to: number): void {
    for (let k = from; k < to; k++) {
        dst.push(src[k * 2], src[k * 2 + 1]);
    }
}

/** Copies vertices `i..j` (cyclic) of `poly` into a new flat polygon. */
function polygonCopy(poly: number[], i: number, j: number): number[] {
    const s = poly.length / 2;
    const out: number[] = [];
    if (i < j) {
        for (let k = i; k <= j; k++) out.push(poly[k * 2], poly[k * 2 + 1]);
    } else {
        for (let k = 0; k <= j; k++) out.push(poly[k * 2], poly[k * 2 + 1]);
        for (let k = i; k < s; k++) out.push(poly[k * 2], poly[k * 2 + 1]);
    }
    return out;
}

/** Writes a CCW copy of the first `n` vertices of `vertices` into `out`, reversing if needed. */
function toCCW(out: number[], vertices: number[], n: number): number[] {
    for (let k = 0; k < n * 2; k++) out[k] = vertices[k];
    if (signedArea(out, n) < 0) reverse(out, out, n);
    return out;
}

const QUICK_DECOMP_MAX_LEVEL = 100;

/** True if vertices `a` and `b` can see each other without any edge blocking (segment test). */
function canSeeSegment(poly: number[], a: number, b: number): boolean {
    const s = poly.length / 2;
    for (let i = 0; i < s; i++) {
        if (i === a || i === b || (i + 1) % s === a || (i + 1) % s === b) continue;
        if (
            segmentsIntersect(
                atX(poly, a),
                atY(poly, a),
                atX(poly, b),
                atY(poly, b),
                atX(poly, i),
                atY(poly, i),
                atX(poly, i + 1),
                atY(poly, i + 1),
            )
        ) {
            return false;
        }
    }
    return true;
}

/** Recursive Bayazit decomposition; returns the convex pieces of `poly` (assumed CCW). */
function quickDecompImpl(poly: number[], level: number): number[][] {
    const s = poly.length / 2;
    if (s < 3) return [];
    // Bail out rather than recurse forever on pathological input.
    if (level > QUICK_DECOMP_MAX_LEVEL) return [poly];

    for (let i = 0; i < s; i++) {
        if (!isReflex(poly, i)) continue;

        const iPrevX = atX(poly, i - 1);
        const iPrevY = atY(poly, i - 1);
        const iCurX = atX(poly, i);
        const iCurY = atY(poly, i);
        const iNextX = atX(poly, i + 1);
        const iNextY = atY(poly, i + 1);

        let lowerDist = Number.MAX_VALUE;
        let upperDist = Number.MAX_VALUE;
        let lowerIntX = 0;
        let lowerIntY = 0;
        let upperIntX = 0;
        let upperIntY = 0;
        let lowerIndex = 0;
        let upperIndex = 0;

        for (let j = 0; j < s; j++) {
            const jx = atX(poly, j);
            const jy = atY(poly, j);

            // Lower: edge (j-1, j) crossing the ray from i-1 through i.
            if (
                triArea(iPrevX, iPrevY, iCurX, iCurY, jx, jy) > 0 &&
                triArea(iPrevX, iPrevY, iCurX, iCurY, atX(poly, j - 1), atY(poly, j - 1)) <= 0
            ) {
                lineIntersection(_decompIsect, iPrevX, iPrevY, iCurX, iCurY, jx, jy, atX(poly, j - 1), atY(poly, j - 1));
                const px = _decompIsect[0];
                const py = _decompIsect[1];
                if (triArea(iNextX, iNextY, iCurX, iCurY, px, py) < 0) {
                    const d = sqDist(iCurX, iCurY, px, py);
                    if (d < lowerDist) {
                        lowerDist = d;
                        lowerIntX = px;
                        lowerIntY = py;
                        lowerIndex = j;
                    }
                }
            }

            // Upper: edge (j, j+1) crossing the ray from i+1 through i.
            if (
                triArea(iNextX, iNextY, iCurX, iCurY, atX(poly, j + 1), atY(poly, j + 1)) > 0 &&
                triArea(iNextX, iNextY, iCurX, iCurY, jx, jy) <= 0
            ) {
                lineIntersection(_decompIsect, iNextX, iNextY, iCurX, iCurY, jx, jy, atX(poly, j + 1), atY(poly, j + 1));
                const px = _decompIsect[0];
                const py = _decompIsect[1];
                if (triArea(iPrevX, iPrevY, iCurX, iCurY, px, py) > 0) {
                    const d = sqDist(iCurX, iCurY, px, py);
                    if (d < upperDist) {
                        upperDist = d;
                        upperIntX = px;
                        upperIntY = py;
                        upperIndex = j;
                    }
                }
            }
        }

        const lowerPoly: number[] = [];
        const upperPoly: number[] = [];

        if (lowerIndex === (upperIndex + 1) % s) {
            // No vertex to connect to: add a Steiner point between the two intersections.
            const px = (lowerIntX + upperIntX) / 2;
            const py = (lowerIntY + upperIntY) / 2;

            if (i < upperIndex) {
                appendRange(lowerPoly, poly, i, upperIndex + 1);
                lowerPoly.push(px, py);
                upperPoly.push(px, py);
                if (lowerIndex !== 0) appendRange(upperPoly, poly, lowerIndex, s);
                appendRange(upperPoly, poly, 0, i + 1);
            } else {
                if (i !== 0) appendRange(lowerPoly, poly, i, s);
                appendRange(lowerPoly, poly, 0, upperIndex + 1);
                lowerPoly.push(px, py);
                upperPoly.push(px, py);
                appendRange(upperPoly, poly, lowerIndex, i + 1);
            }
        } else {
            // Connect to the closest visible vertex within the cone.
            if (lowerIndex > upperIndex) upperIndex += s;

            if (upperIndex < lowerIndex) return [];

            let closestDist = Number.MAX_VALUE;
            let closestIndex = 0;
            for (let j = lowerIndex; j <= upperIndex; j++) {
                const jx = atX(poly, j);
                const jy = atY(poly, j);
                if (triArea(iPrevX, iPrevY, iCurX, iCurY, jx, jy) >= 0 && triArea(iNextX, iNextY, iCurX, iCurY, jx, jy) <= 0) {
                    const d = sqDist(iCurX, iCurY, jx, jy);
                    if (d < closestDist && canSeeSegment(poly, i, j % s)) {
                        closestDist = d;
                        closestIndex = j % s;
                    }
                }
            }

            if (i < closestIndex) {
                appendRange(lowerPoly, poly, i, closestIndex + 1);
                if (closestIndex !== 0) appendRange(upperPoly, poly, closestIndex, s);
                appendRange(upperPoly, poly, 0, i + 1);
            } else {
                if (i !== 0) appendRange(lowerPoly, poly, i, s);
                appendRange(lowerPoly, poly, 0, closestIndex + 1);
                appendRange(upperPoly, poly, closestIndex, i + 1);
            }
        }

        // Recurse into the smaller sub-polygon first, then concatenate the pieces.
        const [first, second] = lowerPoly.length < upperPoly.length ? [lowerPoly, upperPoly] : [upperPoly, lowerPoly];
        return [...quickDecompImpl(first, level + 1), ...quickDecompImpl(second, level + 1)];
    }

    return [poly];
}

/**
 * Decomposes a simple polygon into convex sub-polygons using Bayazit's fast
 * approximate algorithm. Fast (~O(n²)) but may use more pieces than the
 * minimum; may introduce new (Steiner) vertices. Input winding is normalised
 * internally, so either winding is accepted.
 *
 * @param vertices polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `vertices`
 * @returns an array of convex sub-polygons, each a flat `[x0, y0, ...]` array (CCW)
 */
export function decomposePolygon2Quick(vertices: number[], n: number): number[][] {
    if (n < 3) return [];
    return quickDecompImpl(toCCW([], vertices, n), 0);
}

/** True if vertices `a` and `b` can see each other (visibility test, used by the quality decomposition). */
function canSeeVisibility(poly: number[], a: number, b: number): boolean {
    const s = poly.length / 2;

    if (
        triArea(atX(poly, a + 1), atY(poly, a + 1), atX(poly, a), atY(poly, a), atX(poly, b), atY(poly, b)) >= 0 &&
        triArea(atX(poly, a - 1), atY(poly, a - 1), atX(poly, a), atY(poly, a), atX(poly, b), atY(poly, b)) <= 0
    ) {
        return false;
    }

    const dist = sqDist(atX(poly, a), atY(poly, a), atX(poly, b), atY(poly, b));
    for (let i = 0; i < s; i++) {
        if ((i + 1) % s === a || i === a) continue;
        if (
            triArea(atX(poly, a), atY(poly, a), atX(poly, b), atY(poly, b), atX(poly, i + 1), atY(poly, i + 1)) >= 0 &&
            triArea(atX(poly, a), atY(poly, a), atX(poly, b), atY(poly, b), atX(poly, i), atY(poly, i)) <= 0
        ) {
            lineIntersection(
                _decompIsect,
                atX(poly, a),
                atY(poly, a),
                atX(poly, b),
                atY(poly, b),
                atX(poly, i),
                atY(poly, i),
                atX(poly, i + 1),
                atY(poly, i + 1),
            );
            if (sqDist(atX(poly, a), atY(poly, a), _decompIsect[0], _decompIsect[1]) < dist) {
                return false;
            }
        }
    }

    return true;
}

/** Finds the minimal set of cut edges (as [ax, ay, bx, by]) that convex-partition the polygon. */
function getCutEdges(poly: number[]): number[][] {
    const s = poly.length / 2;
    let min: number[][] = [];
    let nDiags = Number.MAX_VALUE;

    for (let i = 0; i < s; i++) {
        if (!isReflex(poly, i)) continue;
        for (let j = 0; j < s; j++) {
            if (!canSeeVisibility(poly, i, j)) continue;

            const tmp1 = getCutEdges(polygonCopy(poly, i, j));
            const tmp2 = getCutEdges(polygonCopy(poly, j, i));
            for (let k = 0; k < tmp2.length; k++) tmp1.push(tmp2[k]);

            if (tmp1.length < nDiags) {
                min = tmp1;
                nDiags = tmp1.length;
                min.push([atX(poly, i), atY(poly, i), atX(poly, j), atY(poly, j)]);
            }
        }
    }

    return min;
}

/** Index of the vertex in `poly` with the exact coordinates (x, y), or -1. */
function indexOfVertex(poly: number[], x: number, y: number): number {
    const s = poly.length / 2;
    for (let k = 0; k < s; k++) {
        if (poly[k * 2] === x && poly[k * 2 + 1] === y) return k;
    }
    return -1;
}

/** Splits `poly` along all `cutEdges`, returning the resulting pieces. */
function sliceByEdges(poly: number[], cutEdges: number[][]): number[][] {
    if (cutEdges.length === 0) return [poly];

    const polys: number[][] = [poly];
    for (let e = 0; e < cutEdges.length; e++) {
        const edge = cutEdges[e];
        for (let p = 0; p < polys.length; p++) {
            const sub = polys[p];
            const i = indexOfVertex(sub, edge[0], edge[1]);
            const j = indexOfVertex(sub, edge[2], edge[3]);
            if (i !== -1 && j !== -1) {
                polys.splice(p, 1);
                polys.push(polygonCopy(sub, i, j), polygonCopy(sub, j, i));
                break;
            }
        }
    }

    return polys;
}

/**
 * Decomposes a simple polygon into the (near-)minimum number of convex
 * sub-polygons. Produces fewer pieces than {@link decomposePolygon2Quick} but
 * is much slower (~O(n⁴)) — use only for small polygons. Input winding is
 * normalised internally, so either winding is accepted.
 *
 * @param vertices polygon vertices as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of vertices to read from `vertices`
 * @returns an array of convex sub-polygons, each a flat `[x0, y0, ...]` array (CCW)
 */
export function decomposePolygon2Quality(vertices: number[], n: number): number[][] {
    if (n < 3) return [];
    const poly = toCCW([], vertices, n);
    const edges = getCutEdges(poly);
    if (edges.length > 0) return sliceByEdges(poly, edges);
    return [poly];
}
