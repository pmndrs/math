import { deltaAngle } from '../core/angle';
import { coef, coefficients, type Spring } from './spring-core';

// A scalar spring (damped harmonic oscillator), integrated with the exact
// analytic solution — unconditionally stable at any frame delta, and
// behaviourally equivalent to Unity SmoothDamp / OG maath `damp` for the
// critical case. Two dials:
//   smoothTime    — roughly how long to reach the target; omega = 2 / smoothTime
//   dampingRatio  — the character: 1 = critical (no overshoot), <1 bouncy, >1 sluggish
// `damp` is `update` pinned to dampingRatio = 1.
//
// State lives in a `Spring<number>` the caller allocates once and passes back
// each frame; `update`/`damp` mutate `value` and `velocity` in place.

/** Creates a scalar spring at `value`, at rest. */
export const create = (value = 0): Spring<number> => ({ value, velocity: 0 });

/**
 * Springs `state.value` toward `target`, mutating `state` in place. Returns it.
 *
 * @param state spring state, mutated in place
 * @param target goal value
 * @param smoothTime approximate time to reach the target; smaller is faster
 * @param dampingRatio 1 = critically damped (no overshoot), <1 bouncy, >1 sluggish
 * @param delta frame delta, for refresh-rate independence
 * @returns state
 */
export function update(
    state: Spring<number>,
    target: number,
    smoothTime: number,
    dampingRatio: number,
    delta: number,
): Spring<number> {
    coefficients(smoothTime, dampingRatio, delta);
    const d = state.value - target;
    const v = state.velocity;
    state.value = target + coef.pp * d + coef.pv * v;
    state.velocity = coef.vp * d + coef.vv * v;
    return state;
}

/**
 * Critically-damped {@link update} (dampingRatio = 1): moves toward `target` as
 * fast as possible without overshooting.
 */
export function damp(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number> {
    return update(state, target, smoothTime, 1, delta);
}

/**
 * Like {@link damp}, but takes the shortest angular path to `target` (radians),
 * wrapping across the ±π seam rather than unwinding the long way around.
 */
export function dampAngle(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number> {
    return damp(state, state.value + deltaAngle(state.value, target), smoothTime, delta);
}

/**
 * Converts a SwiftUI-style `response` — the spring's natural period, in seconds
 * — to the `smoothTime` that `update`/`damp` consume. `dampingRatio` is the
 * orthogonal second dial and is passed to `update` unchanged.
 *
 * Yields the same stiffness/damping as SwiftUI's `Spring(response:dampingFraction:)`:
 *
 * ```ts
 * spring3.update(state, target, spring.fromResponse(0.5), 0.3, delta); // bouncy, ~0.5s period
 * ```
 */
export const fromResponse = (response: number): number => response / Math.PI;
