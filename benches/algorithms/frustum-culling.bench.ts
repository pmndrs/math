import { bench, group } from '@pmndrs/labs';
import * as mat4 from '../../src/core/mat4';
import * as vec3 from '../../src/core/vec3';
import type { Vec3 } from '../../src/core/vec3';
import * as mulberry32 from '../../src/random/mulberry32';
import * as box3 from '../../src/shapes/box3';
import type { Box3 } from '../../src/shapes/box3';
import * as plane3 from '../../src/shapes/plane3';
import type { Plane3 } from '../../src/shapes/plane3';
import type { Sphere } from '../../src/shapes/sphere';

// Camera frustum culling — build view + projection matrices, extract the six
// frustum planes (Gribb-Hartmann), then cull a field of bounding volumes.

const N = 4096;

const view = mat4.create();
const proj = mat4.create();
const viewProj = mat4.create();
const planeNormal = vec3.create();

function buildFrustum(out: Plane3[]): void {
  mat4.lookAt(view, [30, 30, 30], [0, 0, 0], [0, 1, 0]);
  mat4.perspectiveNO(proj, Math.PI / 3, 16 / 9, 0.1, 100);
  mat4.multiply(viewProj, proj, view);

  // extract the six frustum planes (Gribb-Hartmann) from the column-major
  // view-projection matrix; rows: row3 + row_i (left/bottom/near), row3 - row_i (right/top/far)
  const m = viewProj;
  for (let i = 0; i < 3; i++) {
    vec3.set(planeNormal, m[3] + m[i], m[7] + m[4 + i], m[11] + m[8 + i]);
    plane3.fromNormalAndConstant(out[i * 2], planeNormal, m[15] + m[12 + i]);
    plane3.normalize(out[i * 2], out[i * 2]);

    vec3.set(planeNormal, m[3] - m[i], m[7] - m[4 + i], m[11] - m[8 + i]);
    plane3.fromNormalAndConstant(out[i * 2 + 1], planeNormal, m[15] - m[12 + i]);
    plane3.normalize(out[i * 2 + 1], out[i * 2 + 1]);
  }
}

function makePlanes(): Plane3[] {
  const planes: Plane3[] = [];
  for (let i = 0; i < 6; i++) planes.push(plane3.create());
  return planes;
}

function randPos(rand: ReturnType<typeof mulberry32.create>): Vec3 {
  return [
    (mulberry32.sample(rand) - 0.5) * 80,
    (mulberry32.sample(rand) - 0.5) * 80,
    (mulberry32.sample(rand) - 0.5) * 80,
  ];
}

let sink = 0;

group('frustum culling 4096 @algo @culling', () => {
  bench('spheres', function* () {
    const rand = mulberry32.create(42);
    const spheres: Sphere[] = [];
    for (let i = 0; i < N; i++) {
      spheres.push({ center: randPos(rand), radius: 0.5 + mulberry32.sample(rand) * 1.5 });
    }
    const planes = makePlanes();

    yield () => {
      buildFrustum(planes);
      let visible = 0;
      for (let i = 0; i < N; i++) {
        const sphere = spheres[i];
        let inside = true;
        for (let p = 0; p < 6; p++) {
          if (plane3.distanceToPoint(planes[p], sphere.center) < -sphere.radius) {
            inside = false;
            break;
          }
        }
        if (inside) visible++;
      }
      sink = visible;
    };
  }).gc('inner');

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
    const planes = makePlanes();
    const center = vec3.create();
    const extents = vec3.create();

    yield () => {
      buildFrustum(planes);
      let visible = 0;
      for (let i = 0; i < N; i++) {
        const b = boxes[i];
        box3.center(center, b);
        box3.extents(extents, b);
        let inside = true;
        for (let p = 0; p < 6; p++) {
          const n = planes[p].normal;
          const effectiveRadius =
            extents[0] * Math.abs(n[0]) + extents[1] * Math.abs(n[1]) + extents[2] * Math.abs(n[2]);
          if (plane3.distanceToPoint(planes[p], center) < -effectiveRadius) {
            inside = false;
            break;
          }
        }
        if (inside) visible++;
      }
      sink = visible;
    };
  }).gc('inner');
});

if (sink === Infinity) throw new Error('unreachable');
