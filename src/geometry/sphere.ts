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
