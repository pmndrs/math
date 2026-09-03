import { bench, group } from "@pmndrs/labs";
import * as mat4 from "../../src/core/mat4";
import type { Mat4 } from "../../src/core/mat4";
import type { Vec3 } from "../../src/core/vec3";
import * as mulberry32 from "../../src/random/mulberry32";
import * as box3 from "../../src/shapes/box3";
import type { Box3 } from "../../src/shapes/box3";
import type { Plane3 } from "../../src/shapes/plane3";
import type { Sphere } from "../../src/shapes/sphere";

const N = 10_000;

function makeBoxes(seed: number): Box3[] {
  const rand = mulberry32.create(seed);
  const out: Box3[] = [];
  for (let i = 0; i < N; i++) {
    const cx = (mulberry32.sample(rand) - 0.5) * 20;
    const cy = (mulberry32.sample(rand) - 0.5) * 20;
    const cz = (mulberry32.sample(rand) - 0.5) * 20;
    const hx = mulberry32.sample(rand) * 2 + 0.1;
    const hy = mulberry32.sample(rand) * 2 + 0.1;
    const hz = mulberry32.sample(rand) * 2 + 0.1;
    out.push([cx - hx, cy - hy, cz - hz, cx + hx, cy + hy, cz + hz]);
  }
  return out;
}

function makePoints(seed: number): Vec3[] {
  const rand = mulberry32.create(seed);
  const out: Vec3[] = [];
  for (let i = 0; i < N; i++) {
    out.push([
      (mulberry32.sample(rand) - 0.5) * 20,
      (mulberry32.sample(rand) - 0.5) * 20,
      (mulberry32.sample(rand) - 0.5) * 20,
    ]);
  }
  return out;
}

function makeMats(seed: number): Mat4[] {
  const rand = mulberry32.create(seed);
  const out: Mat4[] = [];
  for (let i = 0; i < N; i++) {
    const m = mat4.create();
    mat4.fromRotation(m, mulberry32.sample(rand) * Math.PI * 2, [
      0.267261, 0.534522, 0.801784,
    ]);
    mat4.translate(m, m, [
      (mulberry32.sample(rand) - 0.5) * 10,
      (mulberry32.sample(rand) - 0.5) * 10,
      (mulberry32.sample(rand) - 0.5) * 10,
    ]);
    out.push(m);
  }
  return out;
}

function makeTriangles(seed: number): [Vec3, Vec3, Vec3][] {
  const rand = mulberry32.create(seed);
  const out: [Vec3, Vec3, Vec3][] = [];
  for (let i = 0; i < N; i++) {
    const cx = (mulberry32.sample(rand) - 0.5) * 20;
    const cy = (mulberry32.sample(rand) - 0.5) * 20;
    const cz = (mulberry32.sample(rand) - 0.5) * 20;
    const jitter = (): Vec3 => [
      cx + (mulberry32.sample(rand) - 0.5) * 4,
      cy + (mulberry32.sample(rand) - 0.5) * 4,
      cz + (mulberry32.sample(rand) - 0.5) * 4,
    ];
    out.push([jitter(), jitter(), jitter()]);
  }
  return out;
}

function makeSpheres(seed: number): Sphere[] {
  const rand = mulberry32.create(seed);
  const out: Sphere[] = [];
  for (let i = 0; i < N; i++) {
    out.push({
      center: [
        (mulberry32.sample(rand) - 0.5) * 20,
        (mulberry32.sample(rand) - 0.5) * 20,
        (mulberry32.sample(rand) - 0.5) * 20,
      ],
      radius: mulberry32.sample(rand) * 3 + 0.1,
    });
  }
  return out;
}

function makePlanes(seed: number): Plane3[] {
  const rand = mulberry32.create(seed);
  const out: Plane3[] = [];
  for (let i = 0; i < N; i++) {
    const nx = mulberry32.sample(rand) - 0.5;
    const ny = mulberry32.sample(rand) - 0.5;
    const nz = mulberry32.sample(rand) - 0.5;
    const len = Math.hypot(nx, ny, nz) || 1;
    out.push({
      normal: [nx / len, ny / len, nz / len],
      constant: (mulberry32.sample(rand) - 0.5) * 10,
    });
  }
  return out;
}

group("box3 ops 10k @shapes @box3", () => {
  bench("transformMat4", function* () {
    const boxes = makeBoxes(1);
    const mats = makeMats(2);
    const out = box3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        box3.transformMat4(out, boxes[i], mats[i]);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });

  bench("intersectsBox3", function* () {
    const a = makeBoxes(1);
    const b = makeBoxes(2);

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        if (box3.intersectsBox3(a[i], b[i])) acc++;
      }
      return acc;
    };
    return acc;
  });

  bench("containsPoint", function* () {
    const boxes = makeBoxes(1);
    const points = makePoints(2);

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        if (box3.containsPoint(boxes[i], points[i])) acc++;
      }
      return acc;
    };
    return acc;
  });

  bench("union", function* () {
    const a = makeBoxes(1);
    const b = makeBoxes(2);
    const out = box3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        box3.union(out, a[i], b[i]);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });

  bench("expandByPoint", function* () {
    const boxes = makeBoxes(1);
    const points = makePoints(2);
    const out = box3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        box3.expandByPoint(out, boxes[i], points[i]);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });

  bench("setFromCenterAndSize", function* () {
    const centers = makePoints(1);
    const sizes = makePoints(2);
    const out = box3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        box3.setFromCenterAndSize(out, centers[i], sizes[i]);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });

  bench("intersectsSphere", function* () {
    const boxes = makeBoxes(1);
    const spheres = makeSpheres(2);

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        if (box3.intersectsSphere(boxes[i], spheres[i])) acc++;
      }
      return acc;
    };
    return acc;
  });

  bench("intersectsPlane3", function* () {
    const boxes = makeBoxes(1);
    const planes = makePlanes(2);

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        if (box3.intersectsPlane3(boxes[i], planes[i])) acc++;
      }
      return acc;
    };
    return acc;
  });

  bench("intersectsTriangle3", function* () {
    const boxes = makeBoxes(1);
    const tris = makeTriangles(2);

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        const t = tris[i];
        if (box3.intersectsTriangle3(boxes[i], t[0], t[1], t[2])) acc++;
      }
      return acc;
    };
    return acc;
  });
});
