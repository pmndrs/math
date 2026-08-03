import type { Mat3, Vec2, Vec3 } from '../core/types';

/** A box in 3D space */
export type Box3 = [minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number];

/** A oriented bounding box in 3D space */
export type OBB3 = { center: Vec3; halfExtents: Vec3; rotation: Mat3 };

/**
 * A plane in 3D space
 * normal - a unit length vector defining the normal of the plane.
 * constant - the signed distance from the origin to the plane.
 */
export type Plane3 = { normal: Vec3; constant: number };

/** A sphere in 3D space */
export type Sphere = { center: Vec3; radius: number };

/** A circle in 2D space */
export type Circle = { center: Vec2; radius: number };

/** A ray in 3D space */
export type Ray3 = {
    origin: Vec3;
    direction: Vec3;
};
