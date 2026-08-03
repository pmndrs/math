import type { Vec2 } from '../core/vec2';

/**
 * Calculates the closest point on a line segment to a given point
 * @param out Output parameter for the closest point
 * @param point The point
 * @param a First endpoint of the segment
 * @param b Second endpoint of the segment
 */
export function closestPoint(out: Vec2, point: Vec2, a: Vec2, b: Vec2): Vec2 {
    const pqx = b[0] - a[0];
    const pqz = b[1] - a[1];
    const dx = point[0] - a[0];
    const dz = point[1] - a[1];

    const d = pqx * pqx + pqz * pqz;
    let t = pqx * dx + pqz * dz;
    if (d > 0) t /= d;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;

    out[0] = a[0] + t * pqx;
    out[1] = a[1] + t * pqz;

    return out;
}
