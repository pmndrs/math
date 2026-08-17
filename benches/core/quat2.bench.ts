import { bench, group } from "@pmndrs/labs";
import * as quat from "../../src/core/quat";
import * as quat2 from "../../src/core/quat2";
import type { Quat2 } from "../../src/core/quat2";
import * as mulberry32 from "../../src/random/mulberry32";

const N = 10_000;

function makeDualQuats(seed: number): Quat2[] {
  const rand = mulberry32.create(seed);
  const out: Quat2[] = [];
  for (let i = 0; i < N; i++) {
    const q = quat.setAxisAngle(
      quat.create(),
      [0.267261, 0.534522, 0.801784],
      mulberry32.sample(rand) * Math.PI * 2,
    );
    const dq = quat2.create();
    quat2.fromRotationTranslation(dq, q, [
      mulberry32.sample(rand) * 10,
      mulberry32.sample(rand) * 10,
      mulberry32.sample(rand) * 10,
    ]);
    out.push(dq);
  }
  return out;
}

group("quat2 ops 10k @core @quat2", () => {
  bench("multiply", function* () {
    const a = makeDualQuats(1);
    const b = makeDualQuats(2);
    const out = quat2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat2.multiply(out, a[i], b[i]);
      }
    };
  });

  bench("rotateX", function* () {
    const a = makeDualQuats(1);
    const out = quat2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat2.rotateX(out, a[i], i * 0.001);
      }
    };
  });

  bench("rotateAroundAxis", function* () {
    const a = makeDualQuats(1);
    const axis: [number, number, number] = [0.267261, 0.534522, 0.801784];
    const out = quat2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat2.rotateAroundAxis(out, a[i], axis, i * 0.001);
      }
    };
  });

  bench("normalize", function* () {
    const a = makeDualQuats(1);
    const out = quat2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat2.normalize(out, a[i]);
      }
    };
  });

  bench("invert", function* () {
    const a = makeDualQuats(1);
    const out = quat2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat2.invert(out, a[i]);
      }
    };
  });

  bench("lerp", function* () {
    const a = makeDualQuats(1);
    const b = makeDualQuats(2);
    const out = quat2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat2.lerp(out, a[i], b[i], 0.5);
      }
    };
  });

  bench("fromRotationTranslation", function* () {
    const rand = mulberry32.create(3);
    const quats = makeDualQuats(1).map((_, i) =>
      quat.setAxisAngle(
        quat.create(),
        [0.267261, 0.534522, 0.801784],
        mulberry32.sample(rand) * Math.PI * 2,
      ),
    );
    const t: [number, number, number] = [1, 2, 3];
    const out = quat2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat2.fromRotationTranslation(out, quats[i], t);
      }
    };
  });
});
