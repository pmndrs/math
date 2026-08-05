import { bench, group } from '@pmndrs/labs';
import * as vec2 from '../../src/core/vec2';
import type { Vec2 } from '../../src/core/vec2';
import type { Vec3 } from '../../src/core/vec3';
import * as mulberry32 from '../../src/random/mulberry32';

// Simple stupid funnel (string pulling) over navmesh portal edges — the path
// smoothing step of a navigation pipeline. Composes vec2 subtract/cross/copy/
// exactEquals/distance.

const CORRIDORS = 16;
const PORTALS = 256; // per corridor, plus degenerate start/end portals

type Corridor = { left: Vec2[]; right: Vec2[]; count: number };

const edgeAB = vec2.create();
const edgeAC = vec2.create();
const crossOut: Vec3 = [0, 0, 0];

// twice the signed area of triangle (a, b, c); negative when c is left of ab
function triarea2(a: Vec2, b: Vec2, c: Vec2): number {
  vec2.subtract(edgeAB, b, a);
  vec2.subtract(edgeAC, c, a);
  vec2.cross(crossOut, edgeAC, edgeAB);
  return crossOut[2];
}

const portalApex = vec2.create();
const portalLeft = vec2.create();
const portalRight = vec2.create();

function stringPull(left: Vec2[], right: Vec2[], count: number, outCorners: Vec2[]): number {
  let n = 0;
  vec2.copy(portalApex, left[0]);
  vec2.copy(portalLeft, left[0]);
  vec2.copy(portalRight, right[0]);
  let apexIndex = 0;
  let leftIndex = 0;
  let rightIndex = 0;
  vec2.copy(outCorners[n++], portalApex);

  for (let i = 1; i < count; i++) {
    const pl = left[i];
    const pr = right[i];

    // update right vertex
    if (triarea2(portalApex, portalRight, pr) <= 0) {
      if (vec2.exactEquals(portalApex, portalRight) || triarea2(portalApex, portalLeft, pr) > 0) {
        vec2.copy(portalRight, pr);
        rightIndex = i;
      } else {
        // right crossed over left: left becomes the new apex
        vec2.copy(outCorners[n++], portalLeft);
        vec2.copy(portalApex, portalLeft);
        apexIndex = leftIndex;
        vec2.copy(portalLeft, portalApex);
        vec2.copy(portalRight, portalApex);
        leftIndex = apexIndex;
        rightIndex = apexIndex;
        i = apexIndex;
        continue;
      }
    }

    // update left vertex
    if (triarea2(portalApex, portalLeft, pl) >= 0) {
      if (vec2.exactEquals(portalApex, portalLeft) || triarea2(portalApex, portalRight, pl) < 0) {
        vec2.copy(portalLeft, pl);
        leftIndex = i;
      } else {
        // left crossed over right: right becomes the new apex
        vec2.copy(outCorners[n++], portalRight);
        vec2.copy(portalApex, portalRight);
        apexIndex = rightIndex;
        vec2.copy(portalLeft, portalApex);
        vec2.copy(portalRight, portalApex);
        leftIndex = apexIndex;
        rightIndex = apexIndex;
        i = apexIndex;
        continue;
      }
    }
  }

  vec2.copy(outCorners[n++], left[count - 1]);
  return n;
}

let sink = 0;

group('funnel string pull 16x256 @algo @nav', () => {
  bench('string pull + path length', function* () {
    const rand = mulberry32.create(42);
    const corridors: Corridor[] = [];
    for (let c = 0; c < CORRIDORS; c++) {
      const left: Vec2[] = [];
      const right: Vec2[] = [];
      let centerX = 0;
      // degenerate start portal
      left.push([0, 0]);
      right.push([0, 0]);
      for (let i = 0; i < PORTALS; i++) {
        const y = i + 1;
        centerX += (mulberry32.sample(rand) - 0.5) * 1.5;
        const halfWidth = 0.5 + mulberry32.sample(rand);
        left.push([centerX - halfWidth, y]);
        right.push([centerX + halfWidth, y]);
      }
      // degenerate end portal
      left.push([centerX, PORTALS + 1]);
      right.push([centerX, PORTALS + 1]);
      corridors.push({ left, right, count: left.length });
    }

    const corners: Vec2[] = [];
    for (let i = 0; i < PORTALS + 4; i++) corners.push(vec2.create());

    // sanity: every corridor must pull to a valid multi-corner path
    for (const c of corridors) {
      const n = stringPull(c.left, c.right, c.count, corners);
      if (n < 2 || !vec2.finite(corners[n - 1])) throw new Error('funnel produced a degenerate path');
    }

    yield () => {
      let totalLength = 0;
      for (let c = 0; c < corridors.length; c++) {
        const corridor = corridors[c];
        const n = stringPull(corridor.left, corridor.right, corridor.count, corners);
        for (let i = 1; i < n; i++) {
          totalLength += vec2.distance(corners[i - 1], corners[i]);
        }
      }
      sink = totalLength;
    };
  }).gc('inner');
});

if (sink === Infinity) throw new Error('unreachable');
