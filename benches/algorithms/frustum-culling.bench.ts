import { bench, group } from '@pmndrs/labs';
import * as mat4 from '../../src/core/mat4';
import type { Vec3 } from '../../src/core/vec3';
import * as mulberry32 from '../../src/random/mulberry32';
import type { Box3 } from '../../src/shapes/box3';
import * as box3 from '../../src/shapes/box3';
import * as frustum from '../../src/shapes/frustum';
import type { Sphere } from '../../src/shapes/sphere';

// Camera frustum culling — build view + projection matrices, extract the six
// frustum planes (Gribb-Hartmann), then cull a field of bounding volumes.

const N = 4096;

const view = mat4.create();
const proj = mat4.create();
const f = frustum.create();

function buildFrustum(): void {
    mat4.lookAt(view, [30, 30, 30], [0, 0, 0], [0, 1, 0]);
    mat4.perspectiveNO(proj, Math.PI / 3, 16 / 9, 0.1, 100);
    frustum.setFromViewProjectionMatrixNO(f, proj, view);
}

function randPos(rand: ReturnType<typeof mulberry32.create>): Vec3 {
    return [(mulberry32.sample(rand) - 0.5) * 80, (mulberry32.sample(rand) - 0.5) * 80, (mulberry32.sample(rand) - 0.5) * 80];
}

group('frustum culling 4096 @algo @culling', () => {
    bench('spheres', function* () {
        const rand = mulberry32.create(42);
        const spheres: Sphere[] = [];
        for (let i = 0; i < N; i++) {
            spheres.push({
                center: randPos(rand),
                radius: 0.5 + mulberry32.sample(rand) * 1.5,
            });
        }

        const acc = yield () => {
            buildFrustum();
            let acc = 0;
            for (let i = 0; i < N; i++) {
                if (frustum.intersectsSphere(f, spheres[i])) acc++;
            }
            return acc;
        };
        return acc;
    });

    bench('aabbs', function* () {
        const rand = mulberry32.create(42);
        const boxes: Box3[] = [];
        for (let i = 0; i < N; i++) {
            const b = box3.create();
            box3.setFromCenterAndSize(b, randPos(rand), [
                1 + mulberry32.sample(rand) * 3,
                1 + mulberry32.sample(rand) * 3,
                1 + mulberry32.sample(rand) * 3,
            ]);
            boxes.push(b);
        }

        const acc = yield () => {
            buildFrustum();
            let acc = 0;
            for (let i = 0; i < N; i++) {
                if (frustum.intersectsBox3(f, boxes[i])) acc++;
            }
            return acc;
        };
        return acc;
    });
});
