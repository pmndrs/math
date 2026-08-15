import { bench, group } from "@pmndrs/labs";
import { circumcircle } from "../../src/geometry/circumcircle";
import type { Circle } from "../../src/shapes/circle";
import type { Vec2 } from "../../src/core/vec2";
import * as mulberry32 from "../../src/random/mulberry32";

const N = 10_000;

function makeTriangles(seed: number): Vec2[][] {
  const rand = mulberry32.create(seed);
  const tris: Vec2[][] = [];
  for (let i = 0; i < N; i++) {
    tris.push([
      [mulberry32.sample(rand) * 100 - 50, mulberry32.sample(rand) * 100 - 50],
      [mulberry32.sample(rand) * 100 - 50, mulberry32.sample(rand) * 100 - 50],
      [mulberry32.sample(rand) * 100 - 50, mulberry32.sample(rand) * 100 - 50],
    ]);
  }
  return tris;
}

group("geometry ops 10k @geometry @circumcircle", () => {
  bench("circumcircle", function* () {
    const tris = makeTriangles(1);
    const out: Circle = { center: [0, 0], radius: 0 };

    yield () => {
      let sink = 0;
      for (let i = 0; i < N; i++) {
        circumcircle(out, tris[i][0], tris[i][1], tris[i][2]);
        sink += out.radius;
      }
      return sink;
    };
  });
});
