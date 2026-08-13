import { bench, group } from "@pmndrs/labs";
import * as mat4 from "../../src/core/mat4";
import type { Mat4 } from "../../src/core/mat4";
import * as mulberry32 from "../../src/random/mulberry32";

const N = 10_000;

function makeMats(seed: number): Mat4[] {
  const rand = mulberry32.create(seed);
  const mats: Mat4[] = [];
  for (let i = 0; i < N; i++) {
    const m = mat4.create();
    mat4.fromRotation(
      m,
      mulberry32.sample(rand) * Math.PI * 2,
      [0.267261, 0.534522, 0.801784],
    );
    mat4.translate(m, m, [
      mulberry32.sample(rand),
      mulberry32.sample(rand),
      mulberry32.sample(rand),
    ]);
    mats.push(m);
  }
  return mats;
}

group("mat4 ops 10k @core @mat4", () => {
  bench("multiply", function* () {
    const a = makeMats(1);
    const b = makeMats(2);
    const out = mat4.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        mat4.multiply(out, a[i], b[i]);
      }
    };
  });

  bench("invert", function* () {
    const a = makeMats(1);
    const out = mat4.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        mat4.invert(out, a[i]);
      }
    };
  });

  bench("determinant", function* () {
    const a = makeMats(1);

    yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += mat4.determinant(a[i]);
      }
      return sum;
    };
  });

  bench("fromRotationTranslationScale", function* () {
    const q: [number, number, number, number] = [0, 0.3826834, 0, 0.9238795];
    const t: [number, number, number] = [1, 2, 3];
    const s: [number, number, number] = [1, 1, 1];
    const out = mat4.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        mat4.fromRotationTranslationScale(out, q, t, s);
      }
    };
  });
});
