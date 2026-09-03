import { assert, bench, group } from "@pmndrs/labs";
import * as euler from "../../src/core/euler";
import type { Euler, EulerOrder } from "../../src/core/euler";
import * as mat4 from "../../src/core/mat4";
import type { Mat4 } from "../../src/core/mat4";
import * as quat from "../../src/core/quat";
import type { Quat } from "../../src/core/quat";
import * as mulberry32 from "../../src/random/mulberry32";

const N = 10_000;

const ORDERS: EulerOrder[] = ["xyz", "xzy", "yxz", "yzx", "zxy", "zyx"];

function makeQuats(seed: number): Quat[] {
  const rand = mulberry32.create(seed);
  const quats: Quat[] = [];
  for (let i = 0; i < N; i++) {
    const q = quat.create();
    quat.setAxisAngle(
      q,
      [0.267261, 0.534522, 0.801784],
      mulberry32.sample(rand) * Math.PI * 2,
    );
    quats.push(q);
  }
  return quats;
}

function makeMats(seed: number): Mat4[] {
  const rand = mulberry32.create(seed);
  const mats: Mat4[] = [];
  for (let i = 0; i < N; i++) {
    const q = quat.create();
    quat.setAxisAngle(
      q,
      [0.267261, 0.534522, 0.801784],
      mulberry32.sample(rand) * Math.PI * 2,
    );
    const m = mat4.create();
    mat4.fromQuat(m, q);
    mats.push(m);
  }
  return mats;
}

function makeEulers(seed: number): Euler[] {
  const rand = mulberry32.create(seed);
  const eulers: Euler[] = [];
  for (let i = 0; i < N; i++) {
    eulers.push([
      (mulberry32.sample(rand) - 0.5) * Math.PI * 2,
      (mulberry32.sample(rand) - 0.5) * Math.PI,
      (mulberry32.sample(rand) - 0.5) * Math.PI * 2,
      ORDERS[i % ORDERS.length],
    ]);
  }
  return eulers;
}

group("euler ops 10k @core @euler", () => {
  bench("fromRotationMat4 (xyz)", function* () {
    const mats = makeMats(1);
    const out = euler.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        euler.fromRotationMat4(out, mats[i], "xyz");
        acc += out[0];
      }
      return acc;
    };
    return [acc, out[0], out[1], out[2]];
  });

  bench("fromRotationMat4 (zyx)", function* () {
    const mats = makeMats(1);
    const out = euler.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        euler.fromRotationMat4(out, mats[i], "zyx");
        acc += out[0];
      }
      return acc;
    };
    return [acc, out[0], out[1], out[2]];
  });

  bench("fromQuat (xyz)", function* () {
    const quats = makeQuats(1);
    const out = euler.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        euler.fromQuat(out, quats[i], "xyz");
        acc += out[0];
      }
      return acc;
    };
    return [acc, out[0], out[1], out[2]];
  });

  bench("reorder (xyz -> zyx)", function* () {
    const eulers = makeEulers(1);
    const out = euler.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        euler.reorder(out, eulers[i], "zyx");
        acc += out[0];
      }
      return acc;
    };
    return [acc, out[0], out[1], out[2]];
  });

  bench("fromDegrees", function* () {
    // no fixtures: inputs are derived from the loop index
    const out = euler.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        euler.fromDegrees(out, i * 0.01, i * 0.02, i * 0.03, "xyz");
        acc += out[0];
      }
      return acc;
    };
    return [acc, out[0], out[1], out[2]];
  });

  bench("equals", function* () {
    const a = makeEulers(1);
    const b = makeEulers(1);

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        if (euler.equals(a[i], b[i])) acc++;
      }
      return acc;
    };
    // both sets come from the same seed, so every pair must compare equal
    assert(acc === N, "identical eulers must all compare equal");
    return acc;
  });
});
