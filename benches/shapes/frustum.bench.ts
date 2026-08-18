import { bench, group } from '@pmndrs/labs';
import type { Mat4 } from '../../src/core/mat4';
import * as mat4 from '../../src/core/mat4';
import type { Vec3 } from '../../src/core/vec3';
import * as vec3 from '../../src/core/vec3';
import * as mulberry32 from '../../src/random/mulberry32';
import type { Box3 } from '../../src/shapes/box3';
import type { Frustum, FrustumCorners } from '../../src/shapes/frustum';
import * as frustum from '../../src/shapes/frustum';
import type { Sphere } from '../../src/shapes/sphere';

const N = 10_000;

type Camera = { proj: Mat4; view: Mat4 };

function makeCameras(seed: number): Camera[] {
    const rand = mulberry32.create(seed);
    const out: Camera[] = [];
    for (let i = 0; i < N; i++) {
        const proj = mat4.create();
        mat4.perspectiveZO(proj, 0.6 + mulberry32.sample(rand) * 0.8, 16 / 9, 0.1, 100);
        const eye: Vec3 = [
            (mulberry32.sample(rand) - 0.5) * 10,
            (mulberry32.sample(rand) - 0.5) * 10,
            (mulberry32.sample(rand) - 0.5) * 10 + 5,
        ];
        const view = mat4.lookAt(mat4.create(), eye, [0, 0, 0], [0, 1, 0]);
        out.push({ proj, view });
    }
    return out;
}

function makeFrustums(seed: number): Frustum[] {
    const cameras = makeCameras(seed);
    const out: Frustum[] = [];
    for (let i = 0; i < N; i++) {
        out.push(frustum.setFromViewProjectionMatrixZO(frustum.create(), cameras[i].proj, cameras[i].view));
    }
    return out;
}

function makePoints(seed: number): Vec3[] {
    const rand = mulberry32.create(seed);
    const out: Vec3[] = [];
    for (let i = 0; i < N; i++) {
        out.push([
            (mulberry32.sample(rand) - 0.5) * 40,
            (mulberry32.sample(rand) - 0.5) * 40,
            (mulberry32.sample(rand) - 0.5) * 40,
        ]);
    }
    return out;
}

function makeSpheres(seed: number): Sphere[] {
    const rand = mulberry32.create(seed);
    const out: Sphere[] = [];
    for (let i = 0; i < N; i++) {
        out.push({
            center: [
                (mulberry32.sample(rand) - 0.5) * 40,
                (mulberry32.sample(rand) - 0.5) * 40,
                (mulberry32.sample(rand) - 0.5) * 40,
            ],
            radius: mulberry32.sample(rand) * 2 + 0.1,
        });
    }
    return out;
}

function makeBoxes(seed: number): Box3[] {
    const rand = mulberry32.create(seed);
    const out: Box3[] = [];
    for (let i = 0; i < N; i++) {
        const cx = (mulberry32.sample(rand) - 0.5) * 40;
        const cy = (mulberry32.sample(rand) - 0.5) * 40;
        const cz = (mulberry32.sample(rand) - 0.5) * 40;
        const hx = mulberry32.sample(rand) * 2 + 0.1;
        const hy = mulberry32.sample(rand) * 2 + 0.1;
        const hz = mulberry32.sample(rand) * 2 + 0.1;
        out.push([cx - hx, cy - hy, cz - hz, cx + hx, cy + hy, cz + hz]);
    }
    return out;
}

function makeRays(seed: number): { origin: Vec3; dir: Vec3 }[] {
    const rand = mulberry32.create(seed);
    const out: { origin: Vec3; dir: Vec3 }[] = [];
    for (let i = 0; i < N; i++) {
        const origin: Vec3 = [
            (mulberry32.sample(rand) - 0.5) * 40,
            (mulberry32.sample(rand) - 0.5) * 40,
            (mulberry32.sample(rand) - 0.5) * 40,
        ];
        const dir = vec3.fromValues(mulberry32.sample(rand) - 0.5, mulberry32.sample(rand) - 0.5, mulberry32.sample(rand) - 0.5);
        vec3.normalize(dir, dir);
        out.push({ origin, dir });
    }
    return out;
}

function makeCornersOut(): FrustumCorners {
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

group('frustum ops 10k @shapes @frustum', () => {
    bench('setFromViewProjectionMatrixZO', function* () {
        const cameras = makeCameras(1);
        const f = frustum.create();

        yield () => {
            for (let i = 0; i < N; i++) {
                frustum.setFromViewProjectionMatrixZO(f, cameras[i].proj, cameras[i].view);
            }
        };
    });

    bench('setFromViewProjectionMatrixNO', function* () {
        const cameras = makeCameras(1);
        const f = frustum.create();

        yield () => {
            for (let i = 0; i < N; i++) {
                frustum.setFromViewProjectionMatrixNO(f, cameras[i].proj, cameras[i].view);
            }
        };
    });

    bench('setFromViewProjectionMatrixSides', function* () {
        const cameras = makeCameras(1);
        const f = frustum.create();

        yield () => {
            for (let i = 0; i < N; i++) {
                frustum.setFromViewProjectionMatrixSides(f, cameras[i].proj, cameras[i].view);
            }
        };
    });

    bench('intersectsSphere', function* () {
        const frustums = makeFrustums(1);
        const spheres = makeSpheres(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.intersectsSphere(frustums[i], spheres[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('intersectsBox3', function* () {
        const frustums = makeFrustums(1);
        const boxes = makeBoxes(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.intersectsBox3(frustums[i], boxes[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('containsPoint', function* () {
        const frustums = makeFrustums(1);
        const points = makePoints(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.containsPoint(frustums[i], points[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('sidesIntersectsSphere', function* () {
        const frustums = makeFrustums(1);
        const spheres = makeSpheres(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.sidesIntersectsSphere(frustums[i], spheres[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('sidesIntersectsBox3', function* () {
        const frustums = makeFrustums(1);
        const boxes = makeBoxes(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.sidesIntersectsBox3(frustums[i], boxes[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('sidesContainsPoint', function* () {
        const frustums = makeFrustums(1);
        const points = makePoints(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.sidesContainsPoint(frustums[i], points[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('sidesIntersectsRay', function* () {
        const frustums = makeFrustums(1);
        const rays = makeRays(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.sidesIntersectsRay(frustums[i], rays[i].origin, rays[i].dir)) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('intersectsRay', function* () {
        const frustums = makeFrustums(1);
        const rays = makeRays(2);
        let acc = 0;

        yield () => {
            for (let i = 0; i < N; i++) {
                if (frustum.intersectsRay(frustums[i], rays[i].origin, rays[i].dir)) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('corners', function* () {
        const frustums = makeFrustums(1);
        const out = makeCornersOut();

        yield () => {
            for (let i = 0; i < N; i++) {
                frustum.corners(out, frustums[i]);
            }
        };
    });
});
