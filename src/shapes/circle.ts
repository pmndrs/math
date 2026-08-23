import type { Vec2 } from '../core/vec2';

/** A circle in 2D space */
export type Circle = { center: Vec2; radius: number };

export function create(): Circle {
    return { center: [0, 0], radius: 0 };
}
