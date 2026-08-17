import { bench, group } from "@pmndrs/labs";
import * as mat3 from "../../src/core/mat3";
import * as mat4 from "../../src/core/mat4";
import type { Mat4 } from "../../src/core/mat4";
import * as quat from "../../src/core/quat";
import type { Vec3 } from "../../src/core/vec3";
import * as mulberry32 from "../../src/random/mulberry32";
import type { Box3 } from "../../src/shapes/box3";
import * as obb3 from "../../src/shapes/obb3";
import type { OBB3 } from "../../src/shapes/obb3";

const N = 10_000;

function makeOBBs(seed: number): OBB3[] {
  const rand = mulberry32.create(seed);
  const out: OBB3[] = [];
  for (let i = 0; i < N; i++) {
    const q = quat.setAxisAngle(
      quat.create(),
      [0.267261, 0.534522, 0.801784],
      mulberry32.sample(rand) * Math.PI * 2,
    );
    const rotation = mat3.create();
    mat3.fromQuat(rotation, q);
    out.push({
      center: [
        (mulberry32.sample(rand) - 0.5) * 20,
        (mulberry32.sample(rand) - 0.5) * 20,
        (mulberry32.sample(rand) - 0.5) * 20,
      ],
      halfExtents: [
        mulberry32.sample(rand) * 2 + 0.1,
        mulberry32.sample(rand) * 2 + 0.1,
        mulberry32.sample(rand) * 2 + 0.1,
      ],
      rotation,
    });
  }
  return out;
}

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

group("obb3 ops 10k @shapes @obb3", () => {
  bench("intersectsOBB3", function* () {
    const a = makeOBBs(1);
    const b = makeOBBs(2);
    let acc = 0;

    yield () => {
      for (let i = 0; i < N; i++) {
        if (obb3.intersectsOBB3(a[i], b[i])) acc++;
      }
    };
    if (acc < 0) throw new Error("unreachable");
  });

  bench("intersectsBox3", function* () {
    const obbs = makeOBBs(1);
    const boxes = makeBoxes(2);
    let acc = 0;

    yield () => {
      for (let i = 0; i < N; i++) {
        if (obb3.intersectsBox3(obbs[i], boxes[i])) acc++;
      }
    };
    if (acc < 0) throw new Error("unreachable");
  });

  bench("containsPoint", function* () {
    const obbs = makeOBBs(1);
    const points = makePoints(2);
    let acc = 0;

    yield () => {
      for (let i = 0; i < N; i++) {
        if (obb3.containsPoint(obbs[i], points[i])) acc++;
      }
    };
    if (acc < 0) throw new Error("unreachable");
  });

  bench("clampPoint", function* () {
    const obbs = makeOBBs(1);
    const points = makePoints(2);
    const out: Vec3 = [0, 0, 0];

    yield () => {
      for (let i = 0; i < N; i++) {
        obb3.clampPoint(out, obbs[i], points[i]);
      }
    };
  });

  bench("applyMatrix4", function* () {
    const obbs = makeOBBs(1);
    const mats = makeMats(2);
    const out = obb3.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        obb3.applyMatrix4(out, obbs[i], mats[i]);
      }
    };
  });
});
