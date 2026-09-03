import { assert, bench, group } from "@pmndrs/labs";
import * as mat4 from "../../src/core/mat4";
import type { Mat4 } from "../../src/core/mat4";
import * as vec3 from "../../src/core/vec3";
import type { Vec3 } from "../../src/core/vec3";
import * as mulberry32 from "../../src/random/mulberry32";

const N = 10_000;

function makeVecs(seed: number): Vec3[] {
  const rand = mulberry32.create(seed);
  const vecs: Vec3[] = [];

  for (let i = 0; i < N; i++) {
    const vec: Vec3 = [-0, -0, -0];
    vec[0] = mulberry32.sample(rand) * 2 - 1;
    vec[1] = mulberry32.sample(rand) * 2 - 1;
    vec[2] = mulberry32.sample(rand) * 2 - 1;
    vecs.push(vec);
  }

  return vecs;
}

group("vec3 ops 10k @core @vec3", () => {
  bench("add", function* () {
    const a = makeVecs(1);
    const b = makeVecs(2);
    const out = vec3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        vec3.add(out, a[i], b[i]);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });

  bench("cross", function* () {
    const a = makeVecs(1);
    const b = makeVecs(2);
    const out = vec3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        vec3.cross(out, a[i], b[i]);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });

  bench("dot", function* () {
    const a = makeVecs(1);
    const b = makeVecs(2);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += vec3.dot(a[i], b[i]);
      }
      return sum;
    };
    return sum;
  });

  bench("normalize", function* () {
    const a = makeVecs(1);
    const out = vec3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        vec3.normalize(out, a[i]);
        acc += out[0];
      }
      return acc;
    };
    assert(Math.abs(vec3.length(out) - 1) < 1e-6, "normalized vector must be unit length");
    return [acc, ...out];
  });

  bench("lerp", function* () {
    const a = makeVecs(1);
    const b = makeVecs(2);
    const out = vec3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        vec3.lerp(out, a[i], b[i], 0.5);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });

  bench("transformMat4", function* () {
    const a = makeVecs(1);
    const m: Mat4 = mat4.create();
    mat4.fromRotation(m, 0.5, [0.267261, 0.534522, 0.801784]);
    mat4.translate(m, m, [1, 2, 3]);
    const out = vec3.create();

    const acc = yield () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        vec3.transformMat4(out, a[i], m);
        acc += out[0];
      }
      return acc;
    };
    return [acc, ...out];
  });
});
