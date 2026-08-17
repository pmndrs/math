import { bench, group } from "@pmndrs/labs";
import type { Vec2 } from "../../src/core/vec2";
import * as mulberry32 from "../../src/random/mulberry32";
import * as box2 from "../../src/shapes/box2";
import type { Box2 } from "../../src/shapes/box2";
import type { Circle } from "../../src/shapes/circle";

const N = 10_000;

function makeBoxes(seed: number): Box2[] {
  const rand = mulberry32.create(seed);
  const out: Box2[] = [];
  for (let i = 0; i < N; i++) {
    const cx = (mulberry32.sample(rand) - 0.5) * 20;
    const cy = (mulberry32.sample(rand) - 0.5) * 20;
    const hx = mulberry32.sample(rand) * 2 + 0.1;
    const hy = mulberry32.sample(rand) * 2 + 0.1;
    out.push([cx - hx, cy - hy, cx + hx, cy + hy]);
  }
  return out;
}

function makePoints(seed: number): Vec2[] {
  const rand = mulberry32.create(seed);
  const out: Vec2[] = [];
  for (let i = 0; i < N; i++) {
    out.push([
      (mulberry32.sample(rand) - 0.5) * 20,
      (mulberry32.sample(rand) - 0.5) * 20,
    ]);
  }
  return out;
}

function makeCircles(seed: number): Circle[] {
  const rand = mulberry32.create(seed);
  const out: Circle[] = [];
  for (let i = 0; i < N; i++) {
    out.push({
      center: [
        (mulberry32.sample(rand) - 0.5) * 20,
        (mulberry32.sample(rand) - 0.5) * 20,
      ],
      radius: mulberry32.sample(rand) * 3 + 0.1,
    });
  }
  return out;
}

group("box2 ops 10k @shapes @box2", () => {
  bench("intersectsBox2", function* () {
    const a = makeBoxes(1);
    const b = makeBoxes(2);
    let acc = 0;

    yield () => {
      for (let i = 0; i < N; i++) {
        if (box2.intersectsBox2(a[i], b[i])) acc++;
      }
    };
    if (acc < 0) throw new Error("unreachable");
  });

  bench("containsPoint", function* () {
    const boxes = makeBoxes(1);
    const points = makePoints(2);
    let acc = 0;

    yield () => {
      for (let i = 0; i < N; i++) {
        if (box2.containsPoint(boxes[i], points[i])) acc++;
      }
    };
    if (acc < 0) throw new Error("unreachable");
  });

  bench("containsBox2", function* () {
    const a = makeBoxes(1);
    const b = makeBoxes(2);
    let acc = 0;

    yield () => {
      for (let i = 0; i < N; i++) {
        if (box2.containsBox2(a[i], b[i])) acc++;
      }
    };
    if (acc < 0) throw new Error("unreachable");
  });

  bench("union", function* () {
    const a = makeBoxes(1);
    const b = makeBoxes(2);
    const out = box2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        box2.union(out, a[i], b[i]);
      }
    };
  });

  bench("expandByPoint", function* () {
    const boxes = makeBoxes(1);
    const points = makePoints(2);
    const out = box2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        box2.expandByPoint(out, boxes[i], points[i]);
      }
    };
  });

  bench("setFromCenterAndSize", function* () {
    const centers = makePoints(1);
    const sizes = makePoints(2);
    const out = box2.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        box2.setFromCenterAndSize(out, centers[i], sizes[i]);
      }
    };
  });

  bench("intersectsCircle", function* () {
    const boxes = makeBoxes(1);
    const circles = makeCircles(2);
    let acc = 0;

    yield () => {
      for (let i = 0; i < N; i++) {
        if (box2.intersectsCircle(boxes[i], circles[i])) acc++;
      }
    };
    if (acc < 0) throw new Error("unreachable");
  });
});
