import type { Const } from '../core/const';
import { EPSILON } from '../core/scalar';
import type { Vec2 } from '../core/vec2';

/** A circle in 2D space */
export type Circle = { center: Vec2; radius: number };

export function create(): Circle {
    return { center: [0, 0], radius: 0 };
}

/**
 * Clones a Circle
 * @param circle - A Circle to clone
 * @returns a clone of circle
 */
export function clone(circle: Const<Circle>): Circle {
    return { center: [circle.center[0], circle.center[1]], radius: circle.radius };
}

/**
 * Copies a Circle to another Circle
 * @param out the output Circle
 * @param circle the input Circle
 * @returns the output Circle
 */
export function copy(out: Circle, circle: Const<Circle>): Circle {
    out.center[0] = circle.center[0];
    out.center[1] = circle.center[1];
    out.radius = circle.radius;
    return out;
}

/**
 * Sets the center and radius of a Circle
 * @param out - The output Circle
 * @param center - The center point
 * @param radius - The radius
 * @returns The updated Circle
 */
export function set(out: Circle, center: Const<Vec2>, radius: number): Circle {
    out.center[0] = center[0];
    out.center[1] = center[1];
    out.radius = radius;
    return out;
}

/**
 * Returns whether or not the circles have exactly the same center and radius (when compared with ===)
 * @param a - The first circle
 * @param b - The second circle
 * @returns True if the circles are equal, false otherwise
 */
export function exactEquals(a: Const<Circle>, b: Const<Circle>): boolean {
    return a.center[0] === b.center[0] && a.center[1] === b.center[1] && a.radius === b.radius;
}

/**
 * Returns whether or not the circles have approximately the same center and radius
 * @param a - The first circle
 * @param b - The second circle
 * @returns True if the circles are equal, false otherwise
 */
export function equals(a: Const<Circle>, b: Const<Circle>): boolean {
    const a0 = a.center[0];
    const a1 = a.center[1];
    const ar = a.radius;
    const b0 = b.center[0];
    const b1 = b.center[1];
    const br = b.radius;
    return (
        Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(ar - br) <= EPSILON * Math.max(1.0, Math.abs(ar), Math.abs(br))
    );
}

/**
 * Sets the circle to enclose a set of points. The center is the center of the points' bounding box
 * and the radius is the distance to the farthest point. This is fast and always encloses every point,
 * but is not the minimal enclosing circle.
 *
 * With no points (n <= 0) the circle is set to the origin with radius 0.
 * NaN coordinates are not supported and give an unspecified result.
 *
 * @param out the circle to store the result
 * @param points points as a flat array `[x0, y0, x1, y1, ...]`
 * @param n number of points to read from `points`
 * @returns out
 */
export function setFromPoints(out: Circle, points: readonly number[], n: number): Circle {
    if (n <= 0) {
        out.center[0] = 0;
        out.center[1] = 0;
        out.radius = 0;
        return out;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < n; i++) {
        const x = points[i * 2];
        const y = points[i * 2 + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const cx = (minX + maxX) * 0.5;
    const cy = (minY + maxY) * 0.5;

    let maxSq = 0;
    for (let i = 0; i < n; i++) {
        const dx = points[i * 2] - cx;
        const dy = points[i * 2 + 1] - cy;
        const sq = dx * dx + dy * dy;
        if (sq > maxSq) maxSq = sq;
    }

    out.center[0] = cx;
    out.center[1] = cy;
    // sqrt can round down so that radius * radius < maxSq and the farthest point tests as outside.
    // one relative epsilon step up is enough to cover that rounding.
    const radius = Math.sqrt(maxSq);
    out.radius = radius * radius < maxSq ? radius * (1 + Number.EPSILON) : radius;
    return out;
}

/**
 * Expands a Circle by the least amount needed to also enclose a point
 * The center moves toward the point. A circle with radius 0 is treated as a single point at its center.
 * @param out - The output Circle
 * @param circle - The input Circle
 * @param point - The point to include
 * @returns The expanded Circle
 */
export function expandByPoint(out: Circle, circle: Const<Circle>, point: Const<Vec2>): Circle {
    const cx = circle.center[0];
    const cy = circle.center[1];
    const r = circle.radius;
    const px = point[0];
    const py = point[1];
    const dx = px - cx;
    const dy = py - cy;
    const sq = dx * dx + dy * dy;
    if (sq <= r * r) return copy(out, circle);

    const d = Math.sqrt(sq);
    const half = (d - r) * 0.5;
    const t = half / d;
    const ox = cx + dx * t;
    const oy = cy + dy * t;

    // rounding in the new center and radius can leave the point just outside.
    // grow to the point's actual distance, with the same sqrt guard as setFromPoints.
    const ex = px - ox;
    const ey = py - oy;
    const pointSq = ex * ex + ey * ey;
    let radius = r + half;
    if (radius * radius < pointSq) {
        radius = Math.sqrt(pointSq);
        if (radius * radius < pointSq) radius *= 1 + Number.EPSILON;
    }

    out.center[0] = ox;
    out.center[1] = oy;
    out.radius = radius;
    return out;
}

/**
 * Computes the smallest Circle that encloses two circles
 * @param out - The output Circle
 * @param circleA - The first Circle
 * @param circleB - The second Circle
 * @returns The union Circle
 */
export function union(out: Circle, circleA: Const<Circle>, circleB: Const<Circle>): Circle {
    const ax = circleA.center[0];
    const ay = circleA.center[1];
    const ar = circleA.radius;
    const bx = circleB.center[0];
    const by = circleB.center[1];
    const br = circleB.radius;
    const dx = bx - ax;
    const dy = by - ay;
    const d = Math.sqrt(dx * dx + dy * dy);

    // one circle already encloses the other, this also covers equal centers
    if (ar >= d + br) return copy(out, circleA);
    if (br >= d + ar) return copy(out, circleB);

    const r = (d + ar + br) * 0.5;
    const t = (r - ar) / d;
    out.center[0] = ax + dx * t;
    out.center[1] = ay + dy * t;
    out.radius = r;
    return out;
}

/**
 * Returns true if a point lies inside (or on the boundary of) the circle.
 *
 * @param circle the circle
 * @param point the point to test
 * @returns true if the point is within the circle's radius
 */
export function containsPoint(circle: Const<Circle>, point: Const<Vec2>): boolean {
    const dx = point[0] - circle.center[0];
    const dy = point[1] - circle.center[1];
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

/**
 * Test intersection between two circles. Circles that touch count as intersecting.
 */
export function intersectsCircle(circleA: Const<Circle>, circleB: Const<Circle>): boolean {
    const dx = circleB.center[0] - circleA.center[0];
    const dy = circleB.center[1] - circleA.center[1];
    const r = circleA.radius + circleB.radius;
    return dx * dx + dy * dy <= r * r;
}
