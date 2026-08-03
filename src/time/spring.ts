import { deltaAngle } from '../core';
import type { Vec2, Vec3, Vec4 } from '../core';

// Damped-harmonic-oscillator solver (a spring), integrated with the exact
// analytic solution — unconditionally stable at any frame delta, and behaviourally
// equivalent to Unity SmoothDamp / OG maath `damp` for the critical case. Two dials:
//   smoothTime    — roughly how long to reach the target; omega = 2 / smoothTime
//   dampingRatio  — the character: 1 = critical (no overshoot), <1 bouncy, >1 sluggish
// `damp*` is `spring*` pinned to dampingRatio = 1.
//
// A spring carries velocity between frames, so state lives in a `Spring<T>`
// struct the caller allocates once and passes back each frame. Functions mutate
// `value` and `velocity` in place — zero per-frame allocation.
//
// The step is a 2×2 linear map [displacement, velocity] → [displacement', velocity'],
// identical for every component of a vector, so we compute the four coefficients
// once and apply them per component.

/**
 * Spring state: a `value` and its `velocity`, of matching rank
 * (`number`, `Vec2`, `Vec3`, or `Vec4`). Allocate once, mutate each frame.
 */
export type Spring<T> = { value: T; velocity: T };

/** Creates a scalar spring at `value`, at rest. */
export const create = (value = 0): Spring<number> => ({ value, velocity: 0 });

/** Creates a Vec2 spring at `value` (copied), at rest. */
export const create2 = (value: Vec2 = [0, 0]): Spring<Vec2> => ({
    value: [value[0], value[1]],
    velocity: [0, 0],
});

/** Creates a Vec3 spring at `value` (copied), at rest. */
export const create3 = (value: Vec3 = [0, 0, 0]): Spring<Vec3> => ({
    value: [value[0], value[1], value[2]],
    velocity: [0, 0, 0],
});

/** Creates a Vec4 spring at `value` (copied), at rest. */
export const create4 = (value: Vec4 = [0, 0, 0, 0]): Spring<Vec4> => ({
    value: [value[0], value[1], value[2], value[3]],
    velocity: [0, 0, 0, 0],
});

/**
 * Converts a SwiftUI-style `response` — the spring's natural period, in seconds
 * — to the `smoothTime` that `spring`/`damp` consume. `dampingRatio` is the
 * orthogonal second dial and is passed to `spring` unchanged.
 *
 * Yields the same stiffness/damping as SwiftUI's `Spring(response:dampingFraction:)`:
 *
 * ```ts
 * spring3(state, target, fromResponse(0.5), 0.3, delta); // bouncy, ~0.5s period
 * ```
 */
export const fromResponse = (response: number): number => response / Math.PI;

// coefficients of the step's 2×2 map, recomputed per call into module scratch:
//   displacement' = _pp·displacement + _pv·velocity
//   velocity'     = _vp·displacement + _vv·velocity
let _pp = 1;
let _pv = 0;
let _vp = 0;
let _vv = 1;

function coefficients(smoothTime: number, dampingRatio: number, delta: number): void {
    const omega = 2 / Math.max(0.0001, smoothTime);

    if (Math.abs(dampingRatio - 1) < 1e-4) {
        // critically damped — a double root at -omega
        const e = Math.exp(-omega * delta);
        _pp = e * (1 + omega * delta);
        _pv = e * delta;
        _vp = -e * omega * omega * delta;
        _vv = e * (1 - omega * delta);
    } else if (dampingRatio < 1) {
        // under-damped — complex roots, oscillates and overshoots
        const za = -omega * dampingRatio;
        const wd = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
        const e = Math.exp(za * delta);
        const c = Math.cos(wd * delta);
        const s = Math.sin(wd * delta);
        _pp = e * (c - (za * s) / wd);
        _pv = (e * s) / wd;
        _vp = (-e * omega * omega * s) / wd;
        _vv = e * (c + (za * s) / wd);
    } else {
        // over-damped — two real roots, no overshoot
        const za = -omega * dampingRatio;
        const zb = omega * Math.sqrt(dampingRatio * dampingRatio - 1);
        const r1 = za - zb;
        const r2 = za + zb;
        const den = r1 - r2;
        const e1 = Math.exp(r1 * delta);
        const e2 = Math.exp(r2 * delta);
        _pp = (r1 * e2 - r2 * e1) / den;
        _pv = (e1 - e2) / den;
        _vp = (omega * omega * (e2 - e1)) / den; // r1·r2 = omega²
        _vv = (r1 * e1 - r2 * e2) / den;
    }
}

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
export function spring(
    state: Spring<number>,
    target: number,
    smoothTime: number,
    dampingRatio: number,
    delta: number
): Spring<number> {
    coefficients(smoothTime, dampingRatio, delta);
    const d = state.value - target;
    const v = state.velocity;
    state.value = target + _pp * d + _pv * v;
    state.velocity = _vp * d + _vv * v;
    return state;
}

/**
 * Critically-damped {@link spring} (dampingRatio = 1): moves toward `target`
 * as fast as possible without overshooting.
 */
export function damp(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number> {
    return spring(state, target, smoothTime, 1, delta);
}

/**
 * Like {@link damp}, but takes the shortest angular path to `target` (radians),
 * wrapping across the ±π seam rather than unwinding the long way around.
 */
export function dampAngle(state: Spring<number>, target: number, smoothTime: number, delta: number): Spring<number> {
    return damp(state, state.value + deltaAngle(state.value, target), smoothTime, delta);
}

/** Vec2 {@link spring}: springs `state.value` toward `target`, mutating `state` in place. */
export function spring2(
    state: Spring<Vec2>,
    target: Vec2,
    smoothTime: number,
    dampingRatio: number,
    delta: number
): Spring<Vec2> {
    coefficients(smoothTime, dampingRatio, delta);
    const val = state.value;
    const vel = state.velocity;
    let d = val[0] - target[0];
    let v = vel[0];
    val[0] = target[0] + _pp * d + _pv * v;
    vel[0] = _vp * d + _vv * v;
    d = val[1] - target[1];
    v = vel[1];
    val[1] = target[1] + _pp * d + _pv * v;
    vel[1] = _vp * d + _vv * v;
    return state;
}

/** Critically-damped Vec2 spring (dampingRatio = 1). See {@link damp}. */
export function damp2(state: Spring<Vec2>, target: Vec2, smoothTime: number, delta: number): Spring<Vec2> {
    return spring2(state, target, smoothTime, 1, delta);
}

/** Vec3 {@link spring}: springs `state.value` toward `target`, mutating `state` in place. */
export function spring3(
    state: Spring<Vec3>,
    target: Vec3,
    smoothTime: number,
    dampingRatio: number,
    delta: number
): Spring<Vec3> {
    coefficients(smoothTime, dampingRatio, delta);
    const val = state.value;
    const vel = state.velocity;
    for (let i = 0; i < 3; i++) {
        const d = val[i] - target[i];
        const v = vel[i];
        val[i] = target[i] + _pp * d + _pv * v;
        vel[i] = _vp * d + _vv * v;
    }
    return state;
}

/** Critically-damped Vec3 spring (dampingRatio = 1). See {@link damp}. */
export function damp3(state: Spring<Vec3>, target: Vec3, smoothTime: number, delta: number): Spring<Vec3> {
    return spring3(state, target, smoothTime, 1, delta);
}

/** Vec4 {@link spring}: springs `state.value` toward `target`, mutating `state` in place. */
export function spring4(
    state: Spring<Vec4>,
    target: Vec4,
    smoothTime: number,
    dampingRatio: number,
    delta: number
): Spring<Vec4> {
    coefficients(smoothTime, dampingRatio, delta);
    const val = state.value;
    const vel = state.velocity;
    for (let i = 0; i < 4; i++) {
        const d = val[i] - target[i];
        const v = vel[i];
        val[i] = target[i] + _pp * d + _pv * v;
        vel[i] = _vp * d + _vv * v;
    }
    return state;
}

/** Critically-damped Vec4 spring (dampingRatio = 1). See {@link damp}. */
export function damp4(state: Spring<Vec4>, target: Vec4, smoothTime: number, delta: number): Spring<Vec4> {
    return spring4(state, target, smoothTime, 1, delta);
}
