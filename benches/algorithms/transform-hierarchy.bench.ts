import { bench, group } from "@pmndrs/labs";
import * as mat4 from "../../src/core/mat4";
import type { Mat4 } from "../../src/core/mat4";
import * as quat from "../../src/core/quat";
import type { Quat } from "../../src/core/quat";
import type { Vec3 } from "../../src/core/vec3";
import * as mulberry32 from "../../src/random/mulberry32";
import * as box3 from "../../src/shapes/box3";

// Scene graph update — compose each node's local TRS matrix, propagate world
// matrices down a 4-ary tree, then accumulate world-space scene bounds.

const N = 4096;

group("transform hierarchy 4096 @algo @scene", () => {
  bench("world matrices + scene bounds", function* () {
    const rand = mulberry32.create(42);
    const axis: Vec3 = [0.267261, 0.534522, 0.801784];
    const unitScale: Vec3 = [1, 1, 1];

    const positions: Vec3[] = [];
    const rotations: Quat[] = [];
    const localMats: Mat4[] = [];
    const worldMats: Mat4[] = [];

    for (let i = 0; i < N; i++) {
      positions.push([
        (mulberry32.sample(rand) - 0.5) * 4,
        (mulberry32.sample(rand) - 0.5) * 4,
        (mulberry32.sample(rand) - 0.5) * 4,
      ]);

      const q = quat.create();
      quat.setAxisAngle(q, axis, mulberry32.sample(rand) * Math.PI * 2);
      rotations.push(q);
      localMats.push(mat4.create());
      worldMats.push(mat4.create());
    }

    const unitBox = box3.create();
    box3.set(unitBox, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5);
    const nodeBox = box3.create();
    const sceneBounds = box3.create();

    yield () => {
      // parent indices precede child indices, so one pass propagates fully
      for (let i = 0; i < N; i++) {
        mat4.fromRotationTranslationScale(
          localMats[i],
          rotations[i],
          positions[i],
          unitScale,
        );
        if (i === 0) {
          mat4.copy(worldMats[i], localMats[i]);
        } else {
          mat4.multiply(worldMats[i], worldMats[(i - 1) >> 2], localMats[i]);
        }
      }

      box3.empty(sceneBounds);

      for (let i = 0; i < N; i++) {
        box3.transformMat4(nodeBox, unitBox, worldMats[i]);
        box3.union(sceneBounds, sceneBounds, nodeBox);
      }

      return box3.surfaceArea(sceneBounds);
    };
  });
});
