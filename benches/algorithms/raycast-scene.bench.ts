import { bench, group } from "@pmndrs/labs";
import * as vec3 from "../../src/core/vec3";
import type { Vec3 } from "../../src/core/vec3";
import * as mulberry32 from "../../src/random/mulberry32";
import * as box3 from "../../src/shapes/box3";
import type { Box3 } from "../../src/shapes/box3";
import * as raycast3 from "../../src/shapes/raycast3";

// Closest-hit raycasting against a triangle soup with a per-triangle AABB
// broadphase — the query kernel of a physics or picking system.

const TRIANGLES = 1024;
const RAYS = 64;
const RAY_LENGTH = 60;

group("raycast closest-hit 64x1024 @algo @raycast", () => {
  bench("rays vs triangle soup", function* () {
    const rand = mulberry32.create(42);

    const triA: Vec3[] = [];
    const triB: Vec3[] = [];
    const triC: Vec3[] = [];
    const aabbs: Box3[] = [];
    for (let i = 0; i < TRIANGLES; i++) {
      const cx = (mulberry32.sample(rand) - 0.5) * 30;
      const cy = (mulberry32.sample(rand) - 0.5) * 30;
      const cz = (mulberry32.sample(rand) - 0.5) * 30;
      const a: Vec3 = [
        cx + (mulberry32.sample(rand) - 0.5) * 4,
        cy + (mulberry32.sample(rand) - 0.5) * 4,
        cz + (mulberry32.sample(rand) - 0.5) * 4,
      ];
      const b: Vec3 = [
        cx + (mulberry32.sample(rand) - 0.5) * 4,
        cy + (mulberry32.sample(rand) - 0.5) * 4,
        cz + (mulberry32.sample(rand) - 0.5) * 4,
      ];
      const c: Vec3 = [
        cx + (mulberry32.sample(rand) - 0.5) * 4,
        cy + (mulberry32.sample(rand) - 0.5) * 4,
        cz + (mulberry32.sample(rand) - 0.5) * 4,
      ];
      triA.push(a);
      triB.push(b);
      triC.push(c);

      const aabb = box3.create();
      box3.empty(aabb);
      box3.expandByPoint(aabb, aabb, a);
      box3.expandByPoint(aabb, aabb, b);
      box3.expandByPoint(aabb, aabb, c);
      aabbs.push(aabb);
    }

    const origins: Vec3[] = [];
    const directions: Vec3[] = [];
    for (let i = 0; i < RAYS; i++) {
      const theta = (i / RAYS) * Math.PI * 2;
      const origin: Vec3 = [
        Math.cos(theta) * 25,
        (mulberry32.sample(rand) - 0.5) * 10,
        Math.sin(theta) * 25,
      ];
      const target: Vec3 = [
        (mulberry32.sample(rand) - 0.5) * 20,
        (mulberry32.sample(rand) - 0.5) * 20,
        (mulberry32.sample(rand) - 0.5) * 20,
      ];
      const direction = vec3.create();
      vec3.subtract(direction, target, origin);
      vec3.normalize(direction, direction);
      origins.push(origin);
      directions.push(direction);
    }

    const result = raycast3.createIntersectsTriangleResult();
    const hitPoint = vec3.create();

    yield () => {
      let fractionSum = 0;
      let hits = 0;
      for (let r = 0; r < RAYS; r++) {
        const origin = origins[r];
        const direction = directions[r];
        let bestFraction = Infinity;
        for (let t = 0; t < TRIANGLES; t++) {
          if (!raycast3.intersectsBox3(origin, direction, RAY_LENGTH, aabbs[t]))
            continue;
          raycast3.intersectsTriangle(
            result,
            origin,
            direction,
            RAY_LENGTH,
            triA[t],
            triB[t],
            triC[t],
            false,
          );
          if (result.hit && result.fraction < bestFraction) {
            bestFraction = result.fraction;
          }
        }
        if (bestFraction < Infinity) {
          hits++;
          fractionSum += bestFraction;
          vec3.scaleAndAdd(
            hitPoint,
            origin,
            direction,
            bestFraction * RAY_LENGTH,
          );
        }
      }

      return fractionSum + hits;
    };
  });
});
