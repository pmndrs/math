// Internal: the damped-harmonic-oscillator solver shared by every spring
// dimension. `coefficients` recomputes the step's 2×2 linear map into `coef`
// (module scratch, zero-allocation); each `spring*` namespace then applies those
// four coefficients per component.

/**
 * Spring state: a `value` and its `velocity`, of matching rank
 * (`number`, `Vec2`, `Vec3`, or `Vec4`). Allocate once, mutate each frame.
 */
export type Spring<T> = { value: T; velocity: T };

// coefficients of the step's 2×2 map, recomputed per call into shared scratch:
//   displacement' = coef.pp·displacement + coef.pv·velocity
//   velocity'     = coef.vp·displacement + coef.vv·velocity
export const coef = { pp: 1, pv: 0, vp: 0, vv: 1 };

export function coefficients(smoothTime: number, dampingRatio: number, delta: number): void {
    const omega = 2 / Math.max(0.0001, smoothTime);

    if (Math.abs(dampingRatio - 1) < 1e-4) {
        // critically damped — a double root at -omega
        const e = Math.exp(-omega * delta);
        coef.pp = e * (1 + omega * delta);
        coef.pv = e * delta;
        coef.vp = -e * omega * omega * delta;
        coef.vv = e * (1 - omega * delta);
    } else if (dampingRatio < 1) {
        // under-damped — complex roots, oscillates and overshoots
        const za = -omega * dampingRatio;
        const wd = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
        const e = Math.exp(za * delta);
        const c = Math.cos(wd * delta);
        const s = Math.sin(wd * delta);
        coef.pp = e * (c - (za * s) / wd);
        coef.pv = (e * s) / wd;
        coef.vp = (-e * omega * omega * s) / wd;
        coef.vv = e * (c + (za * s) / wd);
    } else {
        // over-damped — two real roots, no overshoot
        const za = -omega * dampingRatio;
        const zb = omega * Math.sqrt(dampingRatio * dampingRatio - 1);
        const r1 = za - zb;
        const r2 = za + zb;
        const den = r1 - r2;
        const e1 = Math.exp(r1 * delta);
        const e2 = Math.exp(r2 * delta);
        coef.pp = (r1 * e2 - r2 * e1) / den;
        coef.pv = (e1 - e2) / den;
        coef.vp = (omega * omega * (e2 - e1)) / den; // r1·r2 = omega²
        coef.vv = (r1 * e1 - r2 * e2) / den;
    }
}
