import type { Sphere } from "./types";

/**
 * Creates a new sphere with a default center 0,0,0 and radius 1
 * @returns A new sphere.
 */
export function create(): Sphere {
  return { center: [0, 0, 0], radius: 1 };
}
