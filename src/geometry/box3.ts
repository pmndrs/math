import type { Box3, Plane3, Sphere } from './types';
import type { Mat4, Vec3 } from '../core/types';
import * as common from '../core/common';
import * as vec3 from '../core/vec3';

/**
 * Create a new empty Box3 with "min" set to positive infinity and "max" set to negative infinity
 * @returns A new Box3
 */
export function create(): Box3 {
    return [
        Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY,
    ];
}

/**
 * Clones a Box3
 * @param box - A Box3 to clone
 * @returns a clone of box
 */
export function clone(box: Box3): Box3 {
    return [box[0], box[1], box[2], box[3], box[4], box[5]];
}

/**
 * Copies a Box3 to another Box3
 * @param out the output Box3
 * @param box the input Box3
 * @returns the output Box3
 */
export function copy(out: Box3, box: Box3): Box3 {
    out[0] = box[0];
    out[1] = box[1];
    out[2] = box[2];
    out[3] = box[3];
    out[4] = box[4];
    out[5] = box[5];
    return out;
}

/**
 * Sets the min and max values of a Box3
 * @param out - The output Box3
 * @param minX - The minimum X coordinate
 * @param minY - The minimum Y coordinate
 * @param minZ - The minimum Z coordinate
 * @param maxX - The maximum X coordinate
 * @param maxY - The maximum Y coordinate
 * @param maxZ - The maximum Z coordinate
 * @returns The updated Box3
 */
export function set(out: Box3, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number): Box3 {
    out[0] = minX;
    out[1] = minY;
    out[2] = minZ;
    out[3] = maxX;
    out[4] = maxY;
    out[5] = maxZ;
    return out;
}

/**
 * Sets the min and max values of a Box3 from Vec3 vectors
 * @param out - The output Box3
 * @param min - The minimum corner
 * @param max - The maximum corner
 * @returns The updated Box3
 */
export function setFromVectors(out: Box3, min: Vec3, max: Vec3): Box3 {
    out[0] = min[0];
    out[1] = min[1];
    out[2] = min[2];
    out[3] = max[0];
    out[4] = max[1];
    out[5] = max[2];
    return out;
}

/**
 * Extracts the minimum corner of a Box3
 * @param out - The output Vec3 for the minimum corner
 * @param box - The input Box3
 * @returns The minimum corner
 */
export function min(out: Vec3, box: Box3): Vec3 {
    out[0] = box[0];
    out[1] = box[1];
    out[2] = box[2];
    return out;
}

/**
 * Extracts the maximum corner of a Box3
 * @param out - The output Vec3 for the maximum corner
 * @param box - The input Box3
 * @returns The maximum corner
 */
export function max(out: Vec3, box: Box3): Vec3 {
    out[0] = box[3];
    out[1] = box[4];
    out[2] = box[5];
    return out;
}

/**
 * Set a Box3 to empty (min to positive infinity, max to negative infinity)
 * @param out - The Box3 to make empty
 * @returns The emptied Box3
 */
export function empty(out: Box3): Box3 {
    out[0] = Number.POSITIVE_INFINITY;
    out[1] = Number.POSITIVE_INFINITY;
    out[2] = Number.POSITIVE_INFINITY;
    out[3] = Number.NEGATIVE_INFINITY;
    out[4] = Number.NEGATIVE_INFINITY;
    out[5] = Number.NEGATIVE_INFINITY;
    return out;
}

/**
 * Returns whether or not the boxes have exactly the same elements in the same position (when compared with ===)
 * @param a - The first box
 * @param b - The second box
 * @returns True if the boxes are equal, false otherwise
 */
export function exactEquals(a: Box3, b: Box3): boolean {
    return (
        a[0] === b[0] &&
        a[1] === b[1] &&
        a[2] === b[2] &&
        a[3] === b[3] &&
        a[4] === b[4] &&
        a[5] === b[5]
    );
}

/**
 * Returns whether or not the boxes have approximately the same elements in the same position
 * @param a - The first box
 * @param b - The second box
 * @returns True if the boxes are equal, false otherwise
 */
export function equals(a: Box3, b: Box3): boolean {
    const a0 = a[0];
    const a1 = a[1];
    const a2 = a[2];
    const a3 = a[3];
    const a4 = a[4];
    const a5 = a[5];
    const b0 = b[0];
    const b1 = b[1];
    const b2 = b[2];
    const b3 = b[3];
    const b4 = b[4];
    const b5 = b[5];
    return (
        Math.abs(a0 - b0) <= common.EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
        Math.abs(a1 - b1) <= common.EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
        Math.abs(a2 - b2) <= common.EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
        Math.abs(a3 - b3) <= common.EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
        Math.abs(a4 - b4) <= common.EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
        Math.abs(a5 - b5) <= common.EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5))
    );
}

const _setFromCenterAndSize_halfSize = /*@__PURE__*/ vec3.create();
const _setFromCenterAndSize_min = /*@__PURE__*/ vec3.create();
const _setFromCenterAndSize_max = /*@__PURE__*/ vec3.create();

/**
 * Sets the box from a center point and size
 * @param out - The output Box3
 * @param center - The center point
 * @param size - The size of the box
 * @returns The updated Box3
 */
export function setFromCenterAndSize(out: Box3, center: Vec3, size: Vec3): Box3 {
    const halfSize = vec3.scale(_setFromCenterAndSize_halfSize, size, 0.5);
    vec3.sub(_setFromCenterAndSize_min, center, halfSize);
    vec3.add(_setFromCenterAndSize_max, center, halfSize);
    out[0] = _setFromCenterAndSize_min[0];
    out[1] = _setFromCenterAndSize_min[1];
    out[2] = _setFromCenterAndSize_min[2];
    out[3] = _setFromCenterAndSize_max[0];
    out[4] = _setFromCenterAndSize_max[1];
    out[5] = _setFromCenterAndSize_max[2];
    return out;
}

/**
 * Expands a Box3 to include a point
 * @param out - The output Box3
 * @param box - The input Box3
 * @param point - The point to include
 * @returns The expanded Box3
 */
export function expandByPoint(out: Box3, box: Box3, point: Vec3): Box3 {
    out[0] = Math.min(box[0], point[0]);
    out[1] = Math.min(box[1], point[1]);
    out[2] = Math.min(box[2], point[2]);
    out[3] = Math.max(box[3], point[0]);
    out[4] = Math.max(box[4], point[1]);
    out[5] = Math.max(box[5], point[2]);
    return out;
}

/**
 * Widens a Box3 by a vector on both sides
 * Subtracts the vector from min and adds it to max
 * @param out - The output Box3
 * @param box - The input Box3
 * @param vector - The vector to expand by
 * @returns The expanded Box3
 */
export function expandByExtents(out: Box3, box: Box3, vector: Vec3): Box3 {
    out[0] = box[0] - vector[0];
    out[1] = box[1] - vector[1];
    out[2] = box[2] - vector[2];
    out[3] = box[3] + vector[0];
    out[4] = box[4] + vector[1];
    out[5] = box[5] + vector[2];
    return out;
}

/**
 * Expands a Box3 uniformly by a scalar margin on all sides
 * Subtracts the margin from min and adds it to max on each axis
 * @param out - The output Box3
 * @param box - The input Box3
 * @param margin - The uniform margin to expand by
 * @returns The expanded Box3
 */
export function expandByMargin(out: Box3, box: Box3, margin: number): Box3 {
    out[0] = box[0] - margin;
    out[1] = box[1] - margin;
    out[2] = box[2] - margin;
    out[3] = box[3] + margin;
    out[4] = box[4] + margin;
    out[5] = box[5] + margin;
    return out;
}

/**
 * Computes the union of two bounding boxes
 * Returns a Box3 that encompasses both input boxes
 * @param out - The output Box3
 * @param boxA - The first Box3
 * @param boxB - The second Box3
 * @returns The union Box3
 */
export function union(out: Box3, boxA: Box3, boxB: Box3): Box3 {
    out[0] = Math.min(boxA[0], boxB[0]);
    out[1] = Math.min(boxA[1], boxB[1]);
    out[2] = Math.min(boxA[2], boxB[2]);
    out[3] = Math.max(boxA[3], boxB[3]);
    out[4] = Math.max(boxA[4], boxB[4]);
    out[5] = Math.max(boxA[5], boxB[5]);
    return out;
}

/**
 * Calculate the center point of a bounding box
 * @param out - The output Vec3 for the center
 * @param box - The input Box3
 * @returns The center point
 */
export function center(out: Vec3, box: Box3): Vec3 {
    out[0] = (box[0] + box[3]) * 0.5;
    out[1] = (box[1] + box[4]) * 0.5;
    out[2] = (box[2] + box[5]) * 0.5;
    return out;
}

/**
 * Calculate the extents (half-size) of a bounding box
 * @param out - The output Vec3 for the extents
 * @param box - The input Box3
 * @returns The extents (distance from center to each face)
 */
export function extents(out: Vec3, box: Box3): Vec3 {
    out[0] = (box[3] - box[0]) * 0.5;
    out[1] = (box[4] - box[1]) * 0.5;
    out[2] = (box[5] - box[2]) * 0.5;
    return out;
}

/**
 * Calculate the size (dimensions) of a bounding box
 * @param out - The output Vec3 for the size
 * @param box - The input Box3
 * @returns The size (width, height, depth)
 */
export function size(out: Vec3, box: Box3): Vec3 {
    out[0] = box[3] - box[0];
    out[1] = box[4] - box[1];
    out[2] = box[5] - box[2];
    return out;
}

/**
 * Calculate the surface area of a bounding box
 * @param box - The input Box3
 * @returns The surface area
 */
export function surfaceArea(box: Box3): number {
    const width = box[3] - box[0];
    const height = box[4] - box[1];
    const depth = box[5] - box[2];
    return 2 * (width * height + width * depth + height * depth);
}

/**
 * Scale a bounding box by a vector, handling non-uniform and negative scaling
 * @param out - The output Box3
 * @param box - The input Box3
 * @param scale - The scale to apply (as a Vec3)
 * @returns The scaled Box3
 */
export function scale(out: Box3, box: Box3, scale: Vec3): Box3 {
    const minX = box[0] * scale[0];
    const maxX = box[3] * scale[0];
    const minY = box[1] * scale[1];
    const maxY = box[4] * scale[1];
    const minZ = box[2] * scale[2];
    const maxZ = box[5] * scale[2];

    // handle negative scaling by ensuring min <= max for each axis
    out[0] = Math.min(minX, maxX);
    out[3] = Math.max(minX, maxX);
    out[1] = Math.min(minY, maxY);
    out[4] = Math.max(minY, maxY);
    out[2] = Math.min(minZ, maxZ);
    out[5] = Math.max(minZ, maxZ);

    return out;
}

/**
 * Transform a bounding box by a 4x4 matrix.
 * Uses Arvo's trick — transform the center, build new half-extents from
 * |M| · extents — which is ~4× fewer ops than transforming all 8 corners.
 * Reference: Jim Arvo, "Transforming Axis-Aligned Bounding Boxes",
 * Graphics Gems I (1990).
 * https://github.com/erich666/GraphicsGems/blob/master/gems/TransBox.c
 * Assumes mat is affine (no perspective), which is always true for AABB
 * transforms in practice.
 * Safe under aliasing (out and box may be the same array): all six box
 * components are read into locals before out is written.
 * @param out - The output Box3
 * @param box - The input Box3
 * @param mat - The 4x4 transformation matrix
 * @returns The transformed Box3
 */
export function transformMat4(out: Box3, box: Box3, mat: Mat4): Box3 {
    const bMinX = box[0];
    const bMinY = box[1];
    const bMinZ = box[2];
    const bMaxX = box[3];
    const bMaxY = box[4];
    const bMaxZ = box[5];

    // empty input → empty output (preserve sentinel rather than producing
    // a bogus transformed box from negative extents)
    if (bMinX > bMaxX || bMinY > bMaxY || bMinZ > bMaxZ) {
        out[0] = Number.POSITIVE_INFINITY;
        out[1] = Number.POSITIVE_INFINITY;
        out[2] = Number.POSITIVE_INFINITY;
        out[3] = Number.NEGATIVE_INFINITY;
        out[4] = Number.NEGATIVE_INFINITY;
        out[5] = Number.NEGATIVE_INFINITY;
        return out;
    }

    const cx = (bMinX + bMaxX) * 0.5;
    const cy = (bMinY + bMaxY) * 0.5;
    const cz = (bMinZ + bMaxZ) * 0.5;
    const ex = (bMaxX - bMinX) * 0.5;
    const ey = (bMaxY - bMinY) * 0.5;
    const ez = (bMaxZ - bMinZ) * 0.5;

    const m0 = mat[0], m1 = mat[1], m2 = mat[2];
    const m4 = mat[4], m5 = mat[5], m6 = mat[6];
    const m8 = mat[8], m9 = mat[9], m10 = mat[10];

    const tcx = m0 * cx + m4 * cy + m8 * cz + mat[12];
    const tcy = m1 * cx + m5 * cy + m9 * cz + mat[13];
    const tcz = m2 * cx + m6 * cy + m10 * cz + mat[14];

    const tex = Math.abs(m0) * ex + Math.abs(m4) * ey + Math.abs(m8) * ez;
    const tey = Math.abs(m1) * ex + Math.abs(m5) * ey + Math.abs(m9) * ez;
    const tez = Math.abs(m2) * ex + Math.abs(m6) * ey + Math.abs(m10) * ez;

    out[0] = tcx - tex;
    out[1] = tcy - tey;
    out[2] = tcz - tez;
    out[3] = tcx + tex;
    out[4] = tcy + tey;
    out[5] = tcz + tez;

    return out;
}

/**
 * Test if a point is contained within the bounding box
 * @param box - The bounding box
 * @param point - The point to test
 * @returns true if the point is inside or on the boundary of the box
 */
export function containsPoint(box: Box3, point: Vec3): boolean {
    return point[0] >= box[0] && point[0] <= box[3] &&
           point[1] >= box[1] && point[1] <= box[4] &&
           point[2] >= box[2] && point[2] <= box[5];
}

/**
 * Test if one Box3 completely contains another Box3
 * @param container - The potentially containing Box3
 * @param contained - The Box3 that might be contained
 * @returns true if the container Box3 completely contains the contained Box3
 */
export function containsBox3(container: Box3, contained: Box3): boolean {
    return contained[0] >= container[0] && contained[3] <= container[3] &&
           contained[1] >= container[1] && contained[4] <= container[4] &&
           contained[2] >= container[2] && contained[5] <= container[5];
}

/**
 * Check whether two bounding boxes intersect
 */
export function intersectsBox3(boxA: Box3, boxB: Box3): boolean {
    return (
        boxA[0] <= boxB[3] &&
        boxA[3] >= boxB[0] &&
        boxA[1] <= boxB[4] &&
        boxA[4] >= boxB[1] &&
        boxA[2] <= boxB[5] &&
        boxA[5] >= boxB[2]
    );
}

const _center: Vec3 = [0, 0, 0];
const _extents: Vec3 = [0, 0, 0];
const _v0: Vec3 = [0, 0, 0];
const _v1: Vec3 = [0, 0, 0];
const _v2: Vec3 = [0, 0, 0];
const _f0: Vec3 = [0, 0, 0];
const _f1: Vec3 = [0, 0, 0];
const _f2: Vec3 = [0, 0, 0];
const _triangleNormal: Vec3 = [0, 0, 0];
const _closestPoint: Vec3 = [0, 0, 0];

const _axesCross: number[] = new Array(27); // 9 axes * 3 components
const _axesBoxFaces: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const _axisTriangle: number[] = [0, 0, 0];

function _satForAxes(axes: number[], axisCount: number): boolean {
    for (let i = 0; i < axisCount; i++) {
        const ax = axes[i * 3 + 0];
        const ay = axes[i * 3 + 1];
        const az = axes[i * 3 + 2];
        // Skip degenerate axis (may occur if triangle edges parallel to axes)
        if (ax === 0 && ay === 0 && az === 0) continue;

        // Project triangle vertices
        const p0 = _v0[0] * ax + _v0[1] * ay + _v0[2] * az;
        const p1 = _v1[0] * ax + _v1[1] * ay + _v1[2] * az;
        const p2 = _v2[0] * ax + _v2[1] * ay + _v2[2] * az;
        let minP = p0;
        let maxP = p0;
        if (p1 < minP) minP = p1;
        else if (p1 > maxP) maxP = p1;
        if (p2 < minP) minP = p2;
        else if (p2 > maxP) maxP = p2;

        // Project AABB (centered at origin) radius onto axis
        const r = _extents[0] * Math.abs(ax) + _extents[1] * Math.abs(ay) + _extents[2] * Math.abs(az);
        if (maxP < -r || minP > r) return false; // Separating axis found
    }
    return true;
}

export function intersectsTriangle3(box: Box3, a: Vec3, b: Vec3, c: Vec3): boolean {
    // Empty box quick reject
    if (box[0] > box[3] || box[1] > box[4] || box[2] > box[5]) return false;

    // Center ( (min+max) * 0.5 ) and half-extents ( max - center )
    _center[0] = (box[0] + box[3]) * 0.5;
    _center[1] = (box[1] + box[4]) * 0.5;
    _center[2] = (box[2] + box[5]) * 0.5;
    _extents[0] = box[3] - _center[0];
    _extents[1] = box[4] - _center[1];
    _extents[2] = box[5] - _center[2];

    // Translate triangle vertices so box center = origin
    _v0[0] = a[0] - _center[0];
    _v0[1] = a[1] - _center[1];
    _v0[2] = a[2] - _center[2];
    _v1[0] = b[0] - _center[0];
    _v1[1] = b[1] - _center[1];
    _v1[2] = b[2] - _center[2];
    _v2[0] = c[0] - _center[0];
    _v2[1] = c[1] - _center[1];
    _v2[2] = c[2] - _center[2];

    // Edge vectors f0 = v1 - v0, etc.
    _f0[0] = _v1[0] - _v0[0];
    _f0[1] = _v1[1] - _v0[1];
    _f0[2] = _v1[2] - _v0[2];
    _f1[0] = _v2[0] - _v1[0];
    _f1[1] = _v2[1] - _v1[1];
    _f1[2] = _v2[2] - _v1[2];
    _f2[0] = _v0[0] - _v2[0];
    _f2[1] = _v0[1] - _v2[1];
    _f2[2] = _v0[2] - _v2[2];

    // 9 cross-product axes between AABB axes (x,y,z) and triangle edges
    // First trio (x cross f) => components (0,-fz,fy)
    _axesCross[0] = 0;
    _axesCross[1] = -_f0[2];
    _axesCross[2] = _f0[1];
    _axesCross[3] = 0;
    _axesCross[4] = -_f1[2];
    _axesCross[5] = _f1[1];
    _axesCross[6] = 0;
    _axesCross[7] = -_f2[2];
    _axesCross[8] = _f2[1];
    // Second trio (y cross f) => (fz,0,-fx)
    _axesCross[9] = _f0[2];
    _axesCross[10] = 0;
    _axesCross[11] = -_f0[0];
    _axesCross[12] = _f1[2];
    _axesCross[13] = 0;
    _axesCross[14] = -_f1[0];
    _axesCross[15] = _f2[2];
    _axesCross[16] = 0;
    _axesCross[17] = -_f2[0];
    // Third trio (z cross f) => (-fy,fx,0)
    _axesCross[18] = -_f0[1];
    _axesCross[19] = _f0[0];
    _axesCross[20] = 0;
    _axesCross[21] = -_f1[1];
    _axesCross[22] = _f1[0];
    _axesCross[23] = 0;
    _axesCross[24] = -_f2[1];
    _axesCross[25] = _f2[0];
    _axesCross[26] = 0;

    if (!_satForAxes(_axesCross, 9)) return false;

    // AABB face normals
    if (!_satForAxes(_axesBoxFaces, 3)) return false;

    // Triangle face normal
    vec3.cross(_triangleNormal, _f0, _f1);
    _axisTriangle[0] = _triangleNormal[0];
    _axisTriangle[1] = _triangleNormal[1];
    _axisTriangle[2] = _triangleNormal[2];
    return _satForAxes(_axisTriangle, 1);
}

/**
 * Test intersection between axis-aligned bounding box and a sphere.
 */
export function intersectsSphere(box: Box3, sphere: Sphere): boolean {
    const { center, radius } = sphere;
    // Clamp center to box to obtain closest point
    _closestPoint[0] = center[0] < box[0] ? box[0] : center[0] > box[3] ? box[3] : center[0];
    _closestPoint[1] = center[1] < box[1] ? box[1] : center[1] > box[4] ? box[4] : center[1];
    _closestPoint[2] = center[2] < box[2] ? box[2] : center[2] > box[5] ? box[5] : center[2];
    const dx = _closestPoint[0] - center[0];
    const dy = _closestPoint[1] - center[1];
    const dz = _closestPoint[2] - center[2];
    return dx * dx + dy * dy + dz * dz <= radius * radius;
}

/**
 * Test intersection between axis-aligned bounding box and plane.
 */
export function intersectsPlane3(box: Box3, plane: Plane3): boolean {
    const { normal, constant } = plane;

    // Select extreme points along plane normal
    let minDot = 0;
    let maxDot = 0;

    if (normal[0] > 0) {
        minDot = normal[0] * box[0];
        maxDot = normal[0] * box[3];
    } else {
        minDot = normal[0] * box[3];
        maxDot = normal[0] * box[0];
    }
    if (normal[1] > 0) {
        minDot += normal[1] * box[1];
        maxDot += normal[1] * box[4];
    } else {
        minDot += normal[1] * box[4];
        maxDot += normal[1] * box[1];
    }
    if (normal[2] > 0) {
        minDot += normal[2] * box[2];
        maxDot += normal[2] * box[5];
    } else {
        minDot += normal[2] * box[5];
        maxDot += normal[2] * box[2];
    }

    // Plane intersection occurs if the interval [minDot + constant, maxDot + constant] straddles zero
    return minDot + constant <= 0 && maxDot + constant >= 0;
}
