import type { World } from 'koota';
import { vec3, spherical } from 'math';
import { simplex3d } from 'math/noise';
import { Sequence } from '../sequence/traits';
import { Time } from '../time/traits';
import { Geometry, Study, FormWorkspace } from './traits';
import { vertex, type Mesh } from './geometry';
import { circumcircleStudy, triangulation, distanceContours, hullStudy, easingStudy } from './constructions';
import { flowField, inverseKinematics, springStudy, collisions, frustumCulling, kinematics3, hull3Study } from './dynamics';
import { skinning, voxels } from './volumes';
import { pythagoras, snowflake, epicycles } from './countdown';

import { helicoid, lissajous, bezierFan, sierpinski, chladni } from './patterns';

import { phyllotaxis, saddle, rose, catenaries, multiplication, superellipsoid } from './rapid';

import { shutterSurface, shutterCurve, shutterSolid } from './shutter';

export type Workspace = ReturnType<typeof FormWorkspace.schema>;

function surface(mesh: Mesh, kind: number, time: number, work: Workspace) {
  for (let direction = 0; direction < 2; direction++) {
    const lines = kind === 0 ? (direction ? 48 : 16) : 34;
    const samples = kind === 0 ? 100 : 78;
    for (let line = 0; line <= lines; line++) {
      for (let step = 0; step <= samples; step++) {
        const u = direction ? line / lines : step / samples;
        const v = direction ? step / samples : line / lines;
        if (kind === 0) {
          const angle = u * Math.PI * 2;
          const width = (v - 0.5) * 1.65;
          const radius = 1.9 + width * Math.cos(angle / 2);
          vertex(mesh, radius * Math.cos(angle), width * Math.sin(angle / 2), radius * Math.sin(angle), step === 0);
        } else {
          const x = (u - 0.5) * 5.4;
          const z = (v - 0.5) * 5.4;
          let y = 0;
          if (kind === 1) {
            const r1 = Math.hypot(x - 1.1, z);
            const r2 = Math.hypot(x + 1.1, z);
            y = (Math.sin(r1 * 3.3 - time * 2) + Math.sin(r2 * 3.3 - time * 2)) * 0.28;
          } else {
            y = simplex3d.sample(work.noise!, x * 0.45, z * 0.45, time * 0.12) * 0.85;
            y += simplex3d.sample(work.noise!, x * 0.9, z * 0.9, time * 0.12) * 0.35;
            y += simplex3d.sample(work.noise!, x * 1.8, z * 1.8, time * 0.12) * 0.12;
          }
          vertex(mesh, x, y, z, step === 0);
        }
      }
    }
  }
}

function attractor(mesh: Mesh, time: number, work: Workspace) {
  vec3.set(work.point, 0.1, 0, 0);
  for (let i = 0; i < 7200; i++) {
    const [x, y, z] = work.point;
    vec3.set(work.velocity, 10 * (y - x), x * (28 - z) - y, x * y - 8 / 3 * z);
    vec3.scaleAndAdd(work.point, work.point, work.velocity, 0.004);
    if (i > 300) {
      vertex(mesh, work.point[0] * 0.115, (work.point[2] - 25) * 0.115, work.point[1] * 0.065, i === 301 || i % 460 === 0);
    }
  }
  // The drawing phase advances independently of numerical integration.
  mesh.count = Math.floor(mesh.count * (0.82 + 0.18 * Math.sin(time * 0.25) ** 2));
}

function fibonacci(mesh: Mesh, time: number, work: Workspace) {
  mesh.dots = true;
  for (let i = 0; i < 1800; i++) {
    work.polar[0] = 2.15 + Math.sin(i * 0.035 + time) * 0.045;
    work.polar[1] = i * Math.PI * (3 - Math.sqrt(5));
    work.polar[2] = Math.acos(1 - 2 * (i + 0.5) / 1800);
    spherical.toVec3(work.point, work.polar);
    vertex(mesh, work.point[0], work.point[1], work.point[2], true);
  }
}

function knotPoint(out: ReturnType<typeof vec3.create>, t: number) {
  return vec3.set(out, (2 + Math.cos(3 * t)) * Math.cos(2 * t) * 0.8,
    Math.sin(3 * t) * 0.95, (2 + Math.cos(3 * t)) * Math.sin(2 * t) * 0.8);
}

function knot(mesh: Mesh, work: Workspace) {
  for (let direction = 0; direction < 2; direction++) {
    const lines = direction ? 54 : 12;
    const samples = direction ? 24 : 320;
    for (let line = 0; line < lines; line++) {
      for (let step = 0; step <= samples; step++) {
        const t = (direction ? line / lines : step / samples) * Math.PI * 2;
        const a = (direction ? step / samples : line / lines) * Math.PI * 2;
        knotPoint(work.point, t);
        knotPoint(work.next, t + 0.001);
        vec3.subtract(work.tangent, work.next, work.point);
        vec3.normalize(work.tangent, work.tangent);
        vec3.set(work.normal, 0, 1, 0);
        vec3.cross(work.binormal, work.tangent, work.normal);
        vec3.normalize(work.binormal, work.binormal);
        vec3.cross(work.normal, work.binormal, work.tangent);
        vec3.scaleAndAdd(work.point, work.point, work.normal, Math.cos(a) * 0.19);
        vec3.scaleAndAdd(work.point, work.point, work.binormal, Math.sin(a) * 0.19);
        vertex(mesh, work.point[0], work.point[1], work.point[2], step === 0);
      }
    }
  }
}

function harmonics(mesh: Mesh, time: number) {
  for (let line = 0; line < 15; line++) {
    for (let step = 0; step <= 300; step++) {
      const x = step / 300 * Math.PI * 4;
      let y = 0;
      for (let n = 1; n <= line + 1; n++) y += Math.sin((2 * n - 1) * x - time * 1.6) / (2 * n - 1);
      vertex(mesh, (step / 300 - 0.5) * 5.4, y * 0.75, (line / 14 - 0.5) * 4, step === 0);
    }
  }
}

function orbits(mesh: Mesh, time: number) {
  for (let line = 0; line < 24; line++) {
    const tilt = line / 24 * Math.PI;
    const radius = 2.2 + 0.12 * Math.sin(time + line * 0.5);
    for (let step = 0; step <= 220; step++) {
      const angle = step / 220 * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      vertex(mesh, x * Math.cos(tilt), y, x * Math.sin(tilt), step === 0);
    }
    // A satellite on each orbit, each at its own period, carrying the accent.
    const angle = time * (0.9 + (line % 5) * 0.22) + line * 1.7;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    vertex(mesh, x * Math.cos(tilt), y, x * Math.sin(tilt), true, 2, 3);
  }
}

export function updateForms(world: World) {
  const sequence = world.get(Sequence)!;
  if (sequence.reveal) return;
  const { elapsed } = world.get(Time)!;
  const work = world.get(FormWorkspace)!;
  world.query(Study, Geometry).updateEach(([study, mesh]) => {
    if (study.index !== sequence.index) return;
    mesh.count = 0;
    mesh.dots = false;
    mesh.faceCount = 0;
    switch (study.index) {
      case 0: case 1: case 4: surface(mesh, study.index, elapsed, work); break;
      case 2: attractor(mesh, elapsed, work); break;
      case 3: fibonacci(mesh, elapsed, work); break;
      case 5: knot(mesh, work); break;
      case 6: harmonics(mesh, elapsed); break;
      case 7: orbits(mesh, elapsed); break;
      case 8: circumcircleStudy(mesh, elapsed, work); break;
      case 9: flowField(mesh, elapsed, work); break;
      case 10: inverseKinematics(mesh, elapsed, work); break;
      case 11: springStudy(mesh, sequence.local, work); break;
      case 12: triangulation(mesh, elapsed, work); break;
      case 13: distanceContours(mesh, elapsed, work); break;
      case 14: hullStudy(mesh, elapsed, work); break;
      case 15: collisions(mesh, sequence.local, work); break;
      case 16: skinning(mesh, elapsed, work); break;
      case 17: easingStudy(mesh, elapsed); break;
      case 18: voxels(mesh, elapsed, work); break;
      case 19: pythagoras(mesh, elapsed); break;
      case 20: snowflake(mesh, elapsed); break;
      case 21: epicycles(mesh, elapsed); break;
      case 22: helicoid(mesh, elapsed); break;
      case 23: lissajous(mesh, elapsed); break;
      case 24: bezierFan(mesh, elapsed, work); break;
      case 25: sierpinski(mesh, sequence.local / sequence.duration); break;
      case 26: frustumCulling(mesh, elapsed, work); break;
      case 27: chladni(mesh, elapsed); break;
      case 28: phyllotaxis(mesh, elapsed); break;
      case 29: saddle(mesh, elapsed); break;
      case 30: rose(mesh, elapsed); break;
      case 31: catenaries(mesh, elapsed); break;
      case 32: multiplication(mesh, elapsed); break;
      case 33: superellipsoid(mesh, elapsed); break;
      case 54: kinematics3(mesh, elapsed, work); break;
      case 55: hull3Study(mesh, elapsed, work); break;
      default:
        if (study.index <= 39) shutterSurface(mesh, study.index);
        else if (study.index <= 51) shutterCurve(mesh, study.index, elapsed);
        else shutterSolid(mesh, study.index);
        break;
    }
  });
}
