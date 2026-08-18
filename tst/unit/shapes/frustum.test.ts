import { describe, expect, it } from 'vitest';
import { mat4, vec3 } from '../../../src';
import type { Box3, Frustum, FrustumCorners, Mat4, Sphere, Vec3 } from '../../../src/shapes';
import { frustum, plane3 } from '../../../src/shapes';

// A symmetric perspective frustum, camera at origin looking down -Z:
//   perspective(fovy = PI/2, aspect = 1, near = 1, far = 10), identity view.
//   near plane: z = -1, far plane: z = -10, sides: x = ±(-z), y = ±(-z).
function makePerspectiveFrustum(convention: 'NO' | 'ZO'): { f: Frustum; proj: Mat4 } {
    const proj = mat4.create();
    if (convention === 'NO') {
        mat4.perspectiveNO(proj, Math.PI / 2, 1, 1, 10);
    } else {
        mat4.perspectiveZO(proj, Math.PI / 2, 1, 1, 10);
    }
    const view = mat4.create();
    const f = frustum.create();
    if (convention === 'NO') {
        frustum.setFromViewProjectionMatrixNO(f, proj, view);
    } else {
        frustum.setFromViewProjectionMatrixZO(f, proj, view);
    }
    return { f, proj };
}

describe('frustum', () => {
    describe('create / clone / copy', () => {
        it('create() builds six default planes', () => {
            const f = frustum.create();
            for (let i = 0; i < 6; i++) {
                expect(f[i].normal).toEqual([0, 1, 0]);
                expect(f[i].constant).toBe(0);
            }
        });

        it('clone() deep-copies every plane', () => {
            const f = makePerspectiveFrustum('NO').f;
            const c = frustum.clone(f);
            expect(c).toEqual(f);
            expect(c[0]).not.toBe(f[0]);
            expect(c[0].normal).not.toBe(f[0].normal);
        });

        it('copy() copies every plane and returns out', () => {
            const f = makePerspectiveFrustum('NO').f;
            const out = frustum.create();
            expect(frustum.copy(out, f)).toBe(out);
            expect(out).toEqual(f);
        });
    });

    describe('setFromViewProjectionMatrixNO', () => {
        it('extracts near/far planes at z = -1 and z = -10', () => {
            const { f } = makePerspectiveFrustum('NO');
            expect(f[4].normal[0]).toBeCloseTo(0, 10);
            expect(f[4].normal[1]).toBeCloseTo(0, 10);
            expect(f[4].normal[2]).toBeCloseTo(-1, 10);
            expect(f[4].constant).toBeCloseTo(-1, 10);
            expect(f[5].normal[2]).toBeCloseTo(1, 10);
            expect(f[5].constant).toBeCloseTo(10, 10);
        });

        it('extracts symmetric side planes (x = ±(-z), y = ±(-z))', () => {
            const { f } = makePerspectiveFrustum('NO');
            const k = Math.SQRT1_2;
            expect(f[0].normal[0]).toBeCloseTo(k, 10); // left: x - z = 0
            expect(f[0].normal[2]).toBeCloseTo(-k, 10);
            expect(f[0].constant).toBeCloseTo(0, 10);
            expect(f[1].normal[0]).toBeCloseTo(-k, 10); // right: x + z = 0
            expect(f[1].normal[2]).toBeCloseTo(-k, 10);
            expect(f[2].normal[1]).toBeCloseTo(k, 10); // bottom: y - z = 0
            expect(f[2].normal[2]).toBeCloseTo(-k, 10);
            expect(f[3].normal[1]).toBeCloseTo(-k, 10); // top: y + z = 0
            expect(f[3].normal[2]).toBeCloseTo(-k, 10);
        });

        it('agrees with plane3.distanceToPoint on sample points', () => {
            const { f } = makePerspectiveFrustum('NO');
            const inside: Vec3 = [0, 0, -2];
            for (const p of f) {
                expect(plane3.distanceToPoint(p, inside)).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('setFromViewProjectionMatrixZO', () => {
        it('recovers the same frustum from a perspectiveZO matrix', () => {
            const { f } = makePerspectiveFrustum('ZO');
            expect(f[4].normal[2]).toBeCloseTo(-1, 10); // near z = -1
            expect(f[4].constant).toBeCloseTo(-1, 10);
            expect(f[5].normal[2]).toBeCloseTo(1, 10); // far z = -10
            expect(f[5].constant).toBeCloseTo(10, 10);
            const k = Math.SQRT1_2;
            expect(f[0].normal[0]).toBeCloseTo(k, 10);
            expect(f[0].normal[2]).toBeCloseTo(-k, 10);
        });
    });

    describe('NO vs ZO conventions', () => {
        it('ZO extraction on a ZO matrix and NO extraction on a NO matrix produce the same planes', () => {
            const a = makePerspectiveFrustum('NO').f;
            const b = makePerspectiveFrustum('ZO').f;
            for (let i = 0; i < 6; i++) {
                expect(plane3.equals(a[i], b[i])).toBe(true);
            }
        });

        it('cross-convention (ZO matrix + NO extraction) puts near in the wrong place', () => {
            const proj = mat4.create();
            mat4.perspectiveZO(proj, Math.PI / 2, 1, 1, 10);
            const f = frustum.create();
            frustum.setFromViewProjectionMatrixNO(f, proj, mat4.create());
            // Correct near plane has constant -1; cross-convention lands at ~ -0.526.
            expect(f[4].constant).toBeCloseTo(-10 / 19, 10);
        });
    });

    describe('setFromViewProjectionMatrixSides', () => {
        it('fills only left/right/bottom/top, leaving near/far untouched', () => {
            const proj = mat4.create();
            mat4.perspectiveNO(proj, Math.PI / 2, 1, 1, 10);
            const full = frustum.create();
            frustum.setFromViewProjectionMatrixNO(full, proj, mat4.create());
            const sides = frustum.create();
            frustum.setFromViewProjectionMatrixSides(sides, proj, mat4.create());
            for (let i = 0; i < 4; i++) {
                expect(plane3.equals(sides[i], full[i])).toBe(true);
            }
            expect(sides[4].normal).toEqual([0, 1, 0]); // near untouched
            expect(sides[5].normal).toEqual([0, 1, 0]); // far untouched
        });

        it('sides predicates ignore near/far', () => {
            const { f, proj } = makePerspectiveFrustum('NO');
            const sides = frustum.create();
            frustum.setFromViewProjectionMatrixSides(sides, proj, mat4.create());
            // In front of near and beyond far: inside the sides, outside the full frustum.
            expect(frustum.sidesContainsPoint(sides, [0, 0, -0.5])).toBe(true);
            expect(frustum.containsPoint(f, [0, 0, -0.5])).toBe(false);
            expect(frustum.sidesContainsPoint(sides, [0, 0, -50])).toBe(true);
            expect(frustum.containsPoint(f, [0, 0, -50])).toBe(false);
        });

        it('sides sphere/box predicates agree inside near-far and differ beyond it', () => {
            const { f, proj } = makePerspectiveFrustum('NO');
            const sides = frustum.create();
            frustum.setFromViewProjectionMatrixSides(sides, proj, mat4.create());
            const inside: Sphere = { center: [0, 0, -2], radius: 0.5 };
            const beyondFar: Sphere = { center: [0, 0, -50], radius: 1 };
            const outsideSide: Sphere = { center: [10, 0, -2], radius: 1 };
            expect(frustum.intersectsSphere(f, inside)).toBe(true);
            expect(frustum.sidesIntersectsSphere(sides, inside)).toBe(true);
            expect(frustum.intersectsSphere(f, beyondFar)).toBe(false);
            expect(frustum.sidesIntersectsSphere(sides, beyondFar)).toBe(true);
            expect(frustum.intersectsSphere(f, outsideSide)).toBe(false);
            expect(frustum.sidesIntersectsSphere(sides, outsideSide)).toBe(false);

            const boxInside: Box3 = [-0.5, -0.5, -2.5, 0.5, 0.5, -1.5];
            const boxBeyondFar: Box3 = [-1, -1, -60, 1, 1, -50];
            expect(frustum.intersectsBox3(f, boxInside)).toBe(true);
            expect(frustum.sidesIntersectsBox3(sides, boxInside)).toBe(true);
            expect(frustum.intersectsBox3(f, boxBeyondFar)).toBe(false);
            expect(frustum.sidesIntersectsBox3(sides, boxBeyondFar)).toBe(true);
        });

        it('sides ray predicate misses beyond far while the full frustum misses it too', () => {
            const { f, proj } = makePerspectiveFrustum('NO');
            const sides = frustum.create();
            frustum.setFromViewProjectionMatrixSides(sides, proj, mat4.create());
            // Ray beyond far, moving further away: outside the full frustum but inside the sides.
            expect(frustum.intersectsRay(f, [0, 0, -100], [0, 0, -1])).toBe(false);
            expect(frustum.sidesIntersectsRay(sides, [0, 0, -100], [0, 0, -1])).toBe(true);
        });
    });

    describe('containsPoint', () => {
        it('accepts points inside the frustum', () => {
            const { f } = makePerspectiveFrustum('NO');
            expect(frustum.containsPoint(f, [0, 0, -2])).toBe(true);
            expect(frustum.containsPoint(f, [0.5, 0, -2])).toBe(true);
            expect(frustum.containsPoint(f, [9, 9, -10])).toBe(true);
        });

        it('rejects points outside the frustum', () => {
            const { f } = makePerspectiveFrustum('NO');
            expect(frustum.containsPoint(f, [0, 0, -0.5])).toBe(false); // in front of near
            expect(frustum.containsPoint(f, [0, 0, -20])).toBe(false); // beyond far
            expect(frustum.containsPoint(f, [5, 0, -2])).toBe(false); // right of side
            expect(frustum.containsPoint(f, [-5, 0, -2])).toBe(false); // left of side
            expect(frustum.containsPoint(f, [0, 5, -2])).toBe(false); // above top
        });
    });

    describe('intersectsSphere', () => {
        it('returns true for spheres inside or straddling the frustum', () => {
            const { f } = makePerspectiveFrustum('NO');
            const inside: Sphere = { center: [0, 0, -2], radius: 0.1 };
            const straddling: Sphere = { center: [0, 0, -2], radius: 5 };
            expect(frustum.intersectsSphere(f, inside)).toBe(true);
            expect(frustum.intersectsSphere(f, straddling)).toBe(true);
        });

        it('rejects spheres fully outside the frustum', () => {
            const { f } = makePerspectiveFrustum('NO');
            const outside: Sphere = { center: [10, 0, -2], radius: 1 };
            const behind: Sphere = { center: [0, 0, -30], radius: 1 };
            expect(frustum.intersectsSphere(f, outside)).toBe(false);
            expect(frustum.intersectsSphere(f, behind)).toBe(false);
        });
    });

    describe('intersectsBox3', () => {
        it('returns true for boxes inside or spanning the frustum', () => {
            const { f } = makePerspectiveFrustum('NO');
            const inside: Box3 = [-0.5, -0.5, -2.5, 0.5, 0.5, -1.5];
            const spanning: Box3 = [-100, -100, -100, 100, 100, -0.05]; // pokes past near
            expect(frustum.intersectsBox3(f, inside)).toBe(true);
            expect(frustum.intersectsBox3(f, spanning)).toBe(true);
        });

        it('rejects boxes fully outside the frustum', () => {
            const { f } = makePerspectiveFrustum('NO');
            const right: Box3 = [5, -0.5, -2.5, 6, 0.5, -1.5];
            const beyondFar: Box3 = [-1, -1, -30, 1, 1, -20];
            expect(frustum.intersectsBox3(f, right)).toBe(false);
            expect(frustum.intersectsBox3(f, beyondFar)).toBe(false);
        });
    });

    describe('intersectsRay', () => {
        it('hits the frustum when the ray passes through it', () => {
            const { f } = makePerspectiveFrustum('NO');
            expect(frustum.intersectsRay(f, [0, 0, 0], [0, 0, -1])).toBe(true);
            expect(frustum.intersectsRay(f, [0, 0, -2], [0, 1, 0])).toBe(true); // starts inside
            expect(frustum.intersectsRay(f, [0, 0, 0], [0.5, 0, -1])).toBe(true);
        });

        it('misses the frustum when the ray stays outside', () => {
            const { f } = makePerspectiveFrustum('NO');
            expect(frustum.intersectsRay(f, [0, 0, 0], [0, 0, 1])).toBe(false); // away from frustum
            expect(frustum.intersectsRay(f, [20, 0, 0], [0, 0, -1])).toBe(false); // parallel-ish, too far right
            expect(frustum.intersectsRay(f, [5, 5, -2], [0, 1, 0])).toBe(false); // outside right, parallel to top/bottom
        });
    });

    describe('corners', () => {
        it('computes the eight corners for an identity-view frustum', () => {
            const { f } = makePerspectiveFrustum('NO');
            const out = cornersIdentity();
            frustum.corners(out, f);
            const expected: FrustumCorners = [
                [-1, -1, -1], // near bottom-left
                [-1, 1, -1], // near top-left
                [1, 1, -1], // near top-right
                [1, -1, -1], // near bottom-right
                [-10, -10, -10], // far bottom-left
                [-10, 10, -10], // far top-left
                [10, 10, -10], // far top-right
                [10, -10, -10], // far bottom-right
            ];
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 3; j++) {
                    expect(out[i][j]).toBeCloseTo(expected[i][j], 6);
                }
            }
        });

        it('places every corner on its three defining planes for an arbitrary camera', () => {
            const eye: Vec3 = [2, 1, 3];
            const view = mat4.lookAt(mat4.create(), eye, [0, 0, 0], [0, 1, 0]);
            const proj = mat4.perspectiveNO(mat4.create(), Math.PI / 3, 16 / 9, 0.1, 100);
            const f = frustum.create();
            frustum.setFromViewProjectionMatrixNO(f, proj, view);
            const out = cornersIdentity();
            frustum.corners(out, f);
            // near corners lie on near plane, far corners on far plane
            for (let i = 0; i < 4; i++) {
                expect(plane3.distanceToPoint(f[4], out[i])).toBeCloseTo(0, 5);
                expect(plane3.distanceToPoint(f[5], out[i + 4])).toBeCloseTo(0, 5);
            }
            // every corner lies on the two side planes it is built from
            const combos = [
                [0, 2],
                [0, 3],
                [1, 3],
                [1, 2],
            ] as const;
            for (let i = 0; i < 8; i++) {
                const [sideA, sideB] = combos[i % 4];
                expect(plane3.distanceToPoint(f[sideA], out[i])).toBeCloseTo(0, 5);
                expect(plane3.distanceToPoint(f[sideB], out[i])).toBeCloseTo(0, 5);
                // a corner sits on three boundary planes; it must not be strictly outside any plane
                for (const p of f) {
                    expect(plane3.distanceToPoint(p, out[i])).toBeGreaterThanOrEqual(-1e-6);
                }
            }
        });
    });

    describe('round-trip with a positioned camera', () => {
        it('culls a world-space box that a lookAt camera cannot see', () => {
            const view = mat4.lookAt(mat4.create(), [0, 0, 5], [0, 0, 0], [0, 1, 0]);
            const proj = mat4.perspectiveNO(mat4.create(), Math.PI / 2, 1, 0.1, 100);
            const f = frustum.create();
            frustum.setFromViewProjectionMatrixNO(f, proj, view);
            expect(frustum.containsPoint(f, [0, 0, 0])).toBe(true); // origin, dead ahead
            expect(frustum.containsPoint(f, [0, 0, 4.5])).toBe(true); // between camera and origin
            expect(frustum.containsPoint(f, [0, 0, 5.5])).toBe(false); // behind the camera
            expect(frustum.containsPoint(f, [100, 0, 0])).toBe(false); // far to the side
        });
    });
});

function cornersIdentity(): FrustumCorners {
    return [
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
    ];
}
