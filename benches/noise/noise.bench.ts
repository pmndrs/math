import { bench, group } from "@pmndrs/labs";
import * as perlin2d from "../../src/noise/perlin2d";
import * as perlin3d from "../../src/noise/perlin3d";
import * as simplex2d from "../../src/noise/simplex2d";
import * as simplex3d from "../../src/noise/simplex3d";

const N = 10_000;

group("noise sample 10k @noise", () => {
  bench("perlin2d", function* () {
    const gen = perlin2d.create(42);

    yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += perlin2d.sample(gen, i * 0.01, i * 0.013);
      }
      return sum;
    };
  });

  bench("perlin3d", function* () {
    const gen = perlin3d.create(42);

    yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += perlin3d.sample(gen, i * 0.01, i * 0.013, i * 0.017);
      }
      return sum;
    };
  });

  bench("simplex2d", function* () {
    const gen = simplex2d.create(42);

    yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += simplex2d.sample(gen, i * 0.01, i * 0.013);
      }
      return sum;
    };
  });

  bench("simplex3d", function* () {
    const gen = simplex3d.create(42);

    yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += simplex3d.sample(gen, i * 0.01, i * 0.013, i * 0.017);
      }
      return sum;
    };
  });
});
