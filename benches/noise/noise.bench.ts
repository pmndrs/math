import { bench, group } from "@pmndrs/labs";
import { curl2, fbm } from "../../src/noise/fractal";
import * as perlin2d from "../../src/noise/perlin2d";
import * as perlin3d from "../../src/noise/perlin3d";
import * as simplex2d from "../../src/noise/simplex2d";
import * as simplex3d from "../../src/noise/simplex3d";
import * as simplex4d from "../../src/noise/simplex4d";
import * as worley2d from "../../src/noise/worley2d";
import * as worley3d from "../../src/noise/worley3d";

const N = 10_000;

group("noise sample 10k @noise", () => {
  bench("perlin2d", function* () {
    const gen = perlin2d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += perlin2d.sample(gen, i * 0.01, i * 0.013);
      }
      return sum;
    };
    return sum;
  });

  bench("perlin3d", function* () {
    const gen = perlin3d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += perlin3d.sample(gen, i * 0.01, i * 0.013, i * 0.017);
      }
      return sum;
    };
    return sum;
  });

  bench("simplex2d", function* () {
    const gen = simplex2d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += simplex2d.sample(gen, i * 0.01, i * 0.013);
      }
      return sum;
    };
    return sum;
  });

  bench("simplex3d", function* () {
    const gen = simplex3d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += simplex3d.sample(gen, i * 0.01, i * 0.013, i * 0.017);
      }
      return sum;
    };
    return sum;
  });

  bench("simplex4d", function* () {
    const gen = simplex4d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += simplex4d.sample(gen, i * 0.01, i * 0.013, i * 0.017, i * 0.019);
      }
      return sum;
    };
    return sum;
  });

  bench("worley2d", function* () {
    const gen = worley2d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += worley2d.sample(gen, i * 0.01, i * 0.013);
      }
      return sum;
    };
    return sum;
  });

  bench("worley3d", function* () {
    const gen = worley3d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += worley3d.sample(gen, i * 0.01, i * 0.013, i * 0.017);
      }
      return sum;
    };
    return sum;
  });

  bench("fbm(simplex2d) x5", function* () {
    const gen = simplex2d.create(42);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        sum += fbm((f) => simplex2d.sample(gen, i * 0.01 * f, i * 0.013 * f), 5, 2, 0.5);
      }
      return sum;
    };
    return sum;
  });

  bench("curl2(simplex2d)", function* () {
    const gen = simplex2d.create(42);
    const out: [number, number] = [0, 0];
    const s = (x: number, y: number) => simplex2d.sample(gen, x, y);

    const sum = yield () => {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        curl2(out, s, i * 0.01, i * 0.013);
        sum += out[0];
      }
      return sum;
    };
    return sum;
  });
});
