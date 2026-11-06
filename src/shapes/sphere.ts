import type { Const } from '../core/const';
import { EPSILON } from '../core/scalar';
import type { Vec3 } from '../core/vec3';

/** A sphere in 3D space */
export type Sphere = { center: Vec3; radius: number };

/**
 * Creates a new sphere with a default center 0,0,0 and radius 1
 * @returns A new sphere.
 */
export function create(): Sphere {
    return { center: [0, 0, 0], radius: 1 };
}

/**
 * Clones a Sphere
 * @param sphere - A Sphere to clone
 * @returns a clone of sphere
 */
export function clone(sphere: Const<Sphere>): Sphere {
    return { center: [sphere.center[0], sphere.center[1], sphere.center[2]], radius: sphere.radius };
}

/**
 * Copies a Sphere to another Sphere
 * @param out the output Sphere
 * @param sphere the input Sphere
 * @returns the output Sphere
 */
export function copy(out: Sphere, sphere: Const<Sphere>): Sphere {
    out.center[0] = sphere.center[0];
    out.center[1] = sphere.center[1];
    out.center[2] = sphere.center[2];
    out.radius = sphere.radius;
    return out;
}

/**
 * Sets the center and radius of a Sphere
 * @param out - The output Sphere
 * @param center - The center point
 * @param radius - The radius
 * @returns The updated Sphere
 */
export function set(out: Sphere, center: Const<Vec3>, radius: number): Sphere {
    out.center[0] = center[0];
    out.center[1] = center[1];
    out.center[2] = center[2];
    out.radius = radius;
    return out;
}

/**
 * Returns whether or not the spheres have exactly the same center and radius (when compared with ===)
 * @param a - The first sphere
 * @param b - The second sphere
 * @returns True if the spheres are equal, false otherwise
 */
export function exactEquals(a: Const<Sphere>, b: Const<Sphere>): boolean {
    return a.center[0] === b.center[0] && a.center[1] === b.center[1] && a.center[2] === b.center[2] && a.radius === b.radius;
}

/**
 * Returns whether or not the spheres have approximately the same center and radius
 * @param a - The first sphere
 * @param b - The second sphere
 * @returns True if the spheres are equal, false otherwise
 */
export function equals(a: Const<Sphere>, b: Const<Sphere>): boolean {
    const a0 = a.center[0];
    const a1 = a.center[1];
    const a2 = a.center[2];
    const ar = a.radius;
    const b0 = b.center[0];
    const b1 = b.center[1];
    const b2 = b.center[2];
    const br = b.radius;
    return (
        Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
        Math.abs(ar - br) <= EPSILON * Math.max(1.0, Math.abs(ar), Math.abs(br))
    );
}

/**
 * Sets the sphere to enclose a set of points. The center is the center of the points' bounding box
 * and the radius is the distance to the farthest point. This is fast and always encloses every point,
 * but is not the minimal enclosing sphere.
 *
 * With no points (n <= 0) the sphere is set to the origin with radius 0.
 * NaN coordinates are not supported and give an unspecified result.
 *
 * @param out the sphere to store the result
 * @param points points as a flat array `[x0, y0, z0, x1, y1, z1, ...]`
 * @param n number of points to read from `points`
 * @returns out
 */
export function setFromPoints(out: Sphere, points: readonly number[], n: number): Sphere {
    if (n <= 0) {
        out.center[0] = 0;
        out.center[1] = 0;
        out.center[2] = 0;
        out.radius = 0;
        return out;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let minZ = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < n; i++) {
        const x = points[i * 3];
        const y = points[i * 3 + 1];
        const z = points[i * 3 + 2];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
    }

    const cx = (minX + maxX) * 0.5;
    const cy = (minY + maxY) * 0.5;
    const cz = (minZ + maxZ) * 0.5;

    let maxSq = 0;
    for (let i = 0; i < n; i++) {
        const dx = points[i * 3] - cx;
        const dy = points[i * 3 + 1] - cy;
        const dz = points[i * 3 + 2] - cz;
        const sq = dx * dx + dy * dy + dz * dz;
        if (sq > maxSq) maxSq = sq;
    }

    out.center[0] = cx;
    out.center[1] = cy;
    out.center[2] = cz;
    // sqrt can round down so that radius * radius < maxSq and the farthest point tests as outside.
    // one relative epsilon step up is enough to cover that rounding.
    const radius = Math.sqrt(maxSq);
    out.radius = radius * radius < maxSq ? radius * (1 + Number.EPSILON) : radius;
    return out;
}

/**
 * Expands a Sphere by the least amount needed to also enclose a point
 * The center moves toward the point. A sphere with radius 0 is treated as a single point at its center.
 * NaN coordinates or radii are not supported and give an unspecified result.
 * @param out - The output Sphere
 * @param sphere - The input Sphere
 * @param point - The point to include
 * @returns The expanded Sphere
 */
export function expandByPoint(out: Sphere, sphere: Const<Sphere>, point: Const<Vec3>): Sphere {
    const cx = sphere.center[0];
    const cy = sphere.center[1];
    const cz = sphere.center[2];
    const r = sphere.radius;
    const px = point[0];
    const py = point[1];
    const pz = point[2];
    const dx = px - cx;
    const dy = py - cy;
    const dz = pz - cz;
    const sq = dx * dx + dy * dy + dz * dz;
    if (sq <= r * r) return copy(out, sphere);

    const d = Math.sqrt(sq);
    const half = (d - r) * 0.5;
    const t = half / d;
    const ox = cx + dx * t;
    const oy = cy + dy * t;
    const oz = cz + dz * t;

    // rounding in the new center and radius can leave the point just outside.
    // grow to the point's actual distance, with the same sqrt guard as setFromPoints.
    const ex = px - ox;
    const ey = py - oy;
    const ez = pz - oz;
    const pointSq = ex * ex + ey * ey + ez * ez;
    let radius = r + half;
    if (radius * radius < pointSq) {
        radius = Math.sqrt(pointSq);
        if (radius * radius < pointSq) radius *= 1 + Number.EPSILON;
    }

    out.center[0] = ox;
    out.center[1] = oy;
    out.center[2] = oz;
    out.radius = radius;
    return out;
}

/**
 * Computes the smallest Sphere that encloses two spheres
 * NaN coordinates or radii are not supported and give an unspecified result.
 * @param out - The output Sphere
 * @param sphereA - The first Sphere
 * @param sphereB - The second Sphere
 * @returns The union Sphere
 */
export function union(out: Sphere, sphereA: Const<Sphere>, sphereB: Const<Sphere>): Sphere {
    const ax = sphereA.center[0];
    const ay = sphereA.center[1];
    const az = sphereA.center[2];
    const ar = sphereA.radius;
    const bx = sphereB.center[0];
    const by = sphereB.center[1];
    const bz = sphereB.center[2];
    const br = sphereB.radius;
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // one sphere already encloses the other, this also covers equal centers
    if (ar >= d + br) return copy(out, sphereA);
    if (br >= d + ar) return copy(out, sphereB);

    const r = (d + ar + br) * 0.5;
    const t = (r - ar) / d;
    out.center[0] = ax + dx * t;
    out.center[1] = ay + dy * t;
    out.center[2] = az + dz * t;
    out.radius = r;
    return out;
}

/**
 * Returns true if a point lies inside (or on the surface of) the sphere.
 *
 * @param sphere the sphere
 * @param point the point to test
 * @returns true if the point is within the sphere's radius
 */
export function containsPoint(sphere: Const<Sphere>, point: Const<Vec3>): boolean {
    const dx = point[0] - sphere.center[0];
    const dy = point[1] - sphere.center[1];
    const dz = point[2] - sphere.center[2];
    return dx * dx + dy * dy + dz * dz <= sphere.radius * sphere.radius;
}

/**
 * Test intersection between two spheres. Spheres that touch count as intersecting.
 */
export function intersectsSphere(sphereA: Const<Sphere>, sphereB: Const<Sphere>): boolean {
    const dx = sphereB.center[0] - sphereA.center[0];
    const dy = sphereB.center[1] - sphereA.center[1];
    const dz = sphereB.center[2] - sphereA.center[2];
    const r = sphereA.radius + sphereB.radius;
    return dx * dx + dy * dy + dz * dz <= r * r;
}
