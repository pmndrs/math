import { describe, expect, it } from 'vitest';
import type { Vec3 } from '../../../src';
import { spring, spring2, spring3, spring4 } from '../../../src/time';
import type { Spring } from '../../../src/time';

const dt = 1 / 60;

describe('spring', () => {
    describe('constructors', () => {
        it('create should default to a resting scalar', () => {
            expect(spring.create()).toEqual({ value: 0, velocity: 0 });
            expect(spring.create(5)).toEqual({ value: 5, velocity: 0 });
        });

        it('create2/3/4 should default to resting zero vectors', () => {
            expect(spring2.create()).toEqual({ value: [0, 0], velocity: [0, 0] });
            expect(spring3.create()).toEqual({ value: [0, 0, 0], velocity: [0, 0, 0] });
            expect(spring4.create()).toEqual({ value: [0, 0, 0, 0], velocity: [0, 0, 0, 0] });
        });

        it('should copy the initial value, not alias it', () => {
            const initial: Vec3 = [1, 2, 3];
            const s = spring3.create(initial);
            expect(s.value).toEqual(initial);
            expect(s.value).not.toBe(initial);
            // mutating the spring must not touch the caller's array
            spring3.damp(s, [9, 9, 9], 0.25, dt);
            expect(initial).toEqual([1, 2, 3]);
        });

        it('should produce state usable by the spring functions', () => {
            const s = spring3.create([0, 0, 0]);
            for (let i = 0; i < 600; i++) spring3.damp(s, [1, 2, 3], 0.25, dt);
            expect(s.value[0]).toBeCloseTo(1, 4);
            expect(s.value[2]).toBeCloseTo(3, 4);
        });
    });

    describe('damp (scalar)', () => {
        it('should move toward the target and mutate in place', () => {
            const s: Spring<number> = { value: 0, velocity: 0 };
            const result = spring.damp(s, 1, 0.25, dt);
            expect(result).toBe(s);
            expect(s.value).toBeGreaterThan(0);
            expect(s.value).toBeLessThan(1);
            expect(s.velocity).toBeGreaterThan(0);
        });

        it('should converge to the target over many steps', () => {
            const s: Spring<number> = { value: 0, velocity: 0 };
            for (let i = 0; i < 600; i++) spring.damp(s, 10, 0.25, dt);
            expect(s.value).toBeCloseTo(10, 4);
            expect(s.velocity).toBeCloseTo(0, 4);
        });

        it('should be stable when already at the target', () => {
            const s: Spring<number> = { value: 1, velocity: 0 };
            spring.damp(s, 1, 0.25, dt);
            expect(s.value).toBeCloseTo(1, 10);
            expect(s.velocity).toBeCloseTo(0, 10);
        });
    });

    describe('spring (scalar)', () => {
        it('critical damping (ratio 1) should not overshoot', () => {
            const s: Spring<number> = { value: 0, velocity: 0 };
            let peak = 0;
            for (let i = 0; i < 600; i++) {
                spring.update(s, 1, 0.25, 1, dt);
                peak = Math.max(peak, s.value);
            }
            expect(peak).toBeLessThanOrEqual(1 + 1e-9);
        });

        it('under-damping (ratio < 1) should overshoot', () => {
            const s: Spring<number> = { value: 0, velocity: 0 };
            let peak = 0;
            for (let i = 0; i < 600; i++) {
                spring.update(s, 1, 0.25, 0.3, dt);
                peak = Math.max(peak, s.value);
            }
            expect(peak).toBeGreaterThan(1);
        });

        it('damp should equal spring at ratio 1', () => {
            const a: Spring<number> = { value: 0, velocity: 0 };
            const b: Spring<number> = { value: 0, velocity: 0 };
            for (let i = 0; i < 100; i++) {
                spring.damp(a, 5, 0.3, dt);
                spring.update(b, 5, 0.3, 1, dt);
            }
            expect(a.value).toBe(b.value);
            expect(a.velocity).toBe(b.velocity);
        });
    });

    describe('OG maath / Unity SmoothDamp parity', () => {
        // OG maath scalar damp (Game Programming Gems 4 §1.10 smooth-damp)
        const expEasing = (t: number) => 1 / (1 + t + 0.48 * t * t + 0.235 * t * t * t);
        const ogDamp = (s: { value: number; velocity: number }, target: number, smoothTime: number, delta: number) => {
            const omega = 2 / Math.max(0.0001, smoothTime);
            const t = expEasing(omega * delta);
            const change = s.value - target;
            const originalTo = target;
            const tgt = s.value - change;
            const temp = (s.velocity + omega * change) * delta;
            s.velocity = (s.velocity - omega * temp) * t;
            let output = tgt + (change + temp) * t;
            if (originalTo - s.value > 0 === output > originalTo) {
                output = originalTo;
                s.velocity = 0;
            }
            s.value = output;
        };

        it('should match OG damp within 2e-3 across framerates', () => {
            for (const step of [1 / 60, 1 / 30, 1 / 10]) {
                const a: Spring<number> = { value: 0, velocity: 0 };
                const og = { value: 0, velocity: 0 };
                let maxDiff = 0;
                for (let i = 0; i < 120; i++) {
                    spring.damp(a, 1, 0.25, step);
                    ogDamp(og, 1, 0.25, step);
                    maxDiff = Math.max(maxDiff, Math.abs(a.value - og.value));
                }
                expect(maxDiff).toBeLessThan(2e-3);
            }
        });
    });

    describe('stability', () => {
        it('should stay finite and not overshoot at an absurd frame hitch (dt = 1s)', () => {
            const s: Spring<number> = { value: 0, velocity: 0 };
            let peak = 0;
            for (let i = 0; i < 10; i++) {
                spring.damp(s, 1, 0.05, 1); // stiff spring, 1s delta
                peak = Math.max(peak, s.value);
            }
            expect(Number.isFinite(s.value)).toBe(true);
            expect(peak).toBeLessThanOrEqual(1 + 1e-9); // critical: never overshoots, even here
            expect(s.value).toBeCloseTo(1, 6);
        });

        it('over-damped should not overshoot', () => {
            const s: Spring<number> = { value: 0, velocity: 0 };
            let peak = 0;
            for (let i = 0; i < 600; i++) {
                spring.update(s, 1, 0.25, 2, dt);
                peak = Math.max(peak, s.value);
            }
            expect(peak).toBeLessThanOrEqual(1 + 1e-9);
            expect(s.value).toBeCloseTo(1, 6);
        });
    });

    describe('fromResponse', () => {
        it('should map response to smoothTime as response / π', () => {
            expect(spring.fromResponse(Math.PI)).toBeCloseTo(1, 12);
            expect(spring.fromResponse(0.5)).toBeCloseTo(0.5 / Math.PI, 12);
        });

        it('should yield SwiftUI-equivalent stiffness and damping', () => {
            const response = 0.5;
            const dampingRatio = 0.3;
            // our solver: omega = 2 / smoothTime, k = omega², c = 2·ζ·omega
            const omega = 2 / spring.fromResponse(response);
            const k = omega * omega;
            const c = 2 * dampingRatio * omega;
            // SwiftUI Spring(response:dampingFraction:), unit mass
            expect(k).toBeCloseTo(((2 * Math.PI) / response) ** 2, 9);
            expect(c).toBeCloseTo((4 * Math.PI * dampingRatio) / response, 9);
        });

        it('shorter response should settle faster', () => {
            const settle = (response: number) => {
                const s: Spring<number> = { value: 0, velocity: 0 };
                for (let i = 0; i < 2000; i++) {
                    spring.update(s, 1, spring.fromResponse(response), 1, dt);
                    if (Math.abs(s.value - 1) < 0.005 && Math.abs(s.velocity) < 0.02) return i;
                }
                return Number.POSITIVE_INFINITY;
            };
            expect(settle(0.4)).toBeLessThan(settle(0.8));
        });
    });

    describe('dampAngle', () => {
        it('should take the short way across the ±π seam', () => {
            // from just under +π toward just over -π is a tiny step the short way
            const s: Spring<number> = { value: Math.PI - 0.05, velocity: 0 };
            spring.dampAngle(s, -Math.PI + 0.05, 0.25, dt);
            // short path continues increasing past +π; it must not swing negative
            expect(s.value).toBeGreaterThan(Math.PI - 0.05);
        });
    });

    describe('damp3 (vec3)', () => {
        it('should mutate value and velocity in place and return state', () => {
            const s: Spring<Vec3> = { value: [0, 0, 0], velocity: [0, 0, 0] };
            const result = spring3.damp(s, [1, 2, 3], 0.25, dt);
            expect(result).toBe(s);
            expect(s.value[0]).toBeGreaterThan(0);
            expect(s.velocity[0]).toBeGreaterThan(0);
        });

        it('should converge to the target vector', () => {
            const s: Spring<Vec3> = { value: [0, 0, 0], velocity: [0, 0, 0] };
            for (let i = 0; i < 600; i++) spring3.damp(s, [1, 2, 3], 0.25, dt);
            expect(s.value[0]).toBeCloseTo(1, 4);
            expect(s.value[1]).toBeCloseTo(2, 4);
            expect(s.value[2]).toBeCloseTo(3, 4);
        });

        it('should match per-component scalar damp', () => {
            const v: Spring<Vec3> = { value: [0, 0, 0], velocity: [0, 0, 0] };
            const s: [Spring<number>, Spring<number>, Spring<number>] = [
                { value: 0, velocity: 0 },
                { value: 0, velocity: 0 },
                { value: 0, velocity: 0 },
            ];
            const target: Vec3 = [1, 2, 3];
            for (let i = 0; i < 100; i++) {
                spring3.damp(v, target, 0.25, dt);
                for (let a = 0; a < 3; a++) spring.damp(s[a], target[a], 0.25, dt);
            }
            for (let a = 0; a < 3; a++) expect(v.value[a]).toBeCloseTo(s[a].value, 12);
        });
    });
});
