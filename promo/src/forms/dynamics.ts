import { lerp, mat4, vec2, vec3, type Vec3 } from 'math';
import { fabrik2, fabrik3 } from 'math/ik';
import { quickhull3 } from 'math/geometry';
import { simplex3d } from 'math/noise';
import { mulberry32 } from 'math/random';
import { box3, frustum } from 'math/shapes';
import { face, ring, segment, vertex, type Mesh } from './geometry';
import type { Workspace } from './systems';

export function flowField(mesh: Mesh, time: number, work: Workspace) {
  for (let stream = 0; stream < 64; stream++) {
    let x = (stream % 8 - 3.5) * 0.58;
    let y = (Math.floor(stream / 8) - 3.5) * 0.58;
    const head = Math.floor((time * 24 + stream * 7) % 120);
    for (let step = 0; step < 120; step++) {
      const angle = simplex3d.sample(work.noise!, x * 0.45, y * 0.45, time * 0.08) * Math.PI * 2;
      x += Math.cos(angle) * 0.032; y += Math.sin(angle) * 0.032;
      vertex(mesh, x, y, 0, step === 0, step <= head && step > head - 24 ? 2 : 1, step === head ? 2.5 : 0);
    }
  }
}

export function inverseKinematics(mesh: Mesh, time: number, work: Workspace) {
  const chain = work.chain!;
  vec2.set(work.target, Math.cos(time * 0.85) * 1.3, Math.sin(time * 1.1) * 1.15);
  for (let arm = 0; arm < 6; arm++) {
    const angle = arm / 6 * Math.PI * 2;
    vec2.set(work.a, Math.cos(angle) * 2.6, Math.sin(angle) * 2.6);
    fabrik2.setBaseLocation(chain, work.a);
    vec2.set(work.b, -Math.cos(angle), -Math.sin(angle));
    fabrik2.straighten(chain, work.b);
    fabrik2.solve(chain, work.target);
    for (const bone of chain.bones) {
      const dx = bone.end[0] - bone.start[0], dy = bone.end[1] - bone.start[1];
      const nx = -dy / bone.length * 0.075, ny = dx / bone.length * 0.075;
      vertex(mesh, bone.start[0], bone.start[1], 0, true, 1);
      vertex(mesh, (bone.start[0] + bone.end[0]) / 2 + nx, (bone.start[1] + bone.end[1]) / 2 + ny, 0, false, 1);
      vertex(mesh, bone.end[0], bone.end[1], 0, false, 1);
      vertex(mesh, (bone.start[0] + bone.end[0]) / 2 - nx, (bone.start[1] + bone.end[1]) / 2 - ny, 0, false, 1);
      vertex(mesh, bone.start[0], bone.start[1], 0, false, 1, 2.5);
    }
    ring(mesh, work.a[0], work.a[1], 0.09, 1, 24);
  }
  ring(mesh, work.target[0], work.target[1], 0.14, 2, 32);
  vertex(mesh, work.target[0], work.target[1], 0, true, 2, 4);
}

function sample(buffer: Float32Array, offset: number, time: number) {
  const frame = Math.min(time * 60, 358);
  return lerp(buffer[offset + Math.floor(frame)], buffer[offset + Math.ceil(frame)], frame % 1);
}

export function springStudy(mesh: Mesh, time: number, work: Workspace) {
  for (let column = 0; column < 3; column++) {
    const x = (column - 1) * 1.65;
    const value = sample(work.springs, column * 360, time * 2 + column * 0.08);
    const bottom = 0.6 - value * 1.35;
    segment(mesh, x, 2.35, x, -2.5, 0);
    segment(mesh, x - 0.16, 2.35, x + 0.16, 2.35, 2);
    segment(mesh, x, 2.35, x, 2.05, 1);
    segment(mesh, x - 0.08, -1.17, x + 0.08, -1.17, 0);

    for (let step = 0; step <= 360; step++) {
      const t = step / 360;
      const angle = t * Math.PI * 18;
      const taper = Math.min(1, t * 12, (1 - t) * 12);
      vertex(mesh, x + Math.sin(angle) * 0.3 * taper,
        lerp(2.05, bottom, t) + Math.cos(angle) * 0.075 * taper,
        Math.cos(angle) * 0.6 * taper, step === 0, 1);
    }
    segment(mesh, x, bottom, x, bottom - 0.2, 1);
    ring(mesh, x, bottom - 0.42, 0.22, 2, 48);
    vertex(mesh, x, bottom - 0.42, 0, true, 2, 2.5);
  }
}

export function collisions(mesh: Mesh, time: number, work: Workspace) {
  const frame = Math.min(time * 60 + 90, 358);
  segment(mesh, -2.4, -2.4, 2.4, -2.4, 0); segment(mesh, 2.4, -2.4, 2.4, 2.4, 0);
  segment(mesh, 2.4, 2.4, -2.4, 2.4, 0); segment(mesh, -2.4, 2.4, -2.4, -2.4, 0);
  for (let i = 0; i < 25; i++) {
    const a = Math.floor(frame) * 50 + i * 2, b = Math.ceil(frame) * 50 + i * 2;
    const x = lerp(work.collisions[a], work.collisions[b], frame % 1);
    const y = lerp(work.collisions[a + 1], work.collisions[b + 1], frame % 1);
    const base = mesh.count;
    ring(mesh, x, y, 0.24, 1, 40);
    if (i % 3 === 0) for (let j = 1; j < 39; j++) face(mesh, base, base + j, base + j + 1, 0.8);
    for (let trail = 1; trail < 8; trail++) {
      const past = Math.max(0, Math.floor(frame) - trail * 2) * 50 + i * 2;
      vertex(mesh, work.collisions[past], work.collisions[past + 1], 0, true, 0, 1.4);
    }
  }
}

const UP: Vec3 = [0, 1, 0];
// Frustum corners come back as the near ring then the far ring; twelve edges join them.
const FRUSTUM_EDGES = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];
const GROUND = -0.85;

export function frustumCulling(mesh: Mesh, time: number, work: Workspace) {
  // A camera pans across a field of pillars. Its six planes come from the projection and view
  // matrices, every pillar is tested with frustum.intersectsBox3, and only what it sees lights up.
  const heading = time * 0.9;
  vec3.set(work.eye, 0, GROUND + 0.55, 0);
  vec3.set(work.point, Math.cos(heading) * 2, GROUND + 0.25, Math.sin(heading) * 2);
  mat4.perspectiveZO(work.projection, 0.92, 1.5, 0.18, 2.2);
  mat4.lookAt(work.view, work.eye, work.point, UP);
  frustum.setFromViewProjectionMatrixZO(work.frustum, work.projection, work.view);
  frustum.corners(work.corners, work.frustum);

  for (let line = 0; line <= 8; line++) {
    const at = (line - 4) * 0.56;
    segment3(mesh, at, GROUND, -2.24, at, GROUND, 2.24, 0);
    segment3(mesh, -2.24, GROUND, at, 2.24, GROUND, at, 0);
  }
  const random = mulberry32.create(19);
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const height = 0.2 + mulberry32.sample(random) * 0.9;
      const x = (column - 3.5) * 0.56, z = (row - 3.5) * 0.56;
      if (Math.abs(x) < 0.4 && Math.abs(z) < 0.4) continue;
      vec3.set(work.point, x, GROUND + height / 2, z);
      vec3.set(work.size, 0.22, height, 0.22);
      box3.setFromCenterAndSize(work.box, work.point, work.size);
      const seen = frustum.intersectsBox3(work.frustum, work.box);
      for (let corner = 0; corner < 8; corner++) {
        for (let axis = 0; axis < 3; axis++) {
          const other = corner ^ (1 << axis);
          if (other < corner) continue;
          const a = work.box, ink = seen ? 2 : 0;
          vertex(mesh, corner & 1 ? a[3] : a[0], corner & 2 ? a[4] : a[1], corner & 4 ? a[5] : a[2], true, ink);
          vertex(mesh, other & 1 ? a[3] : a[0], other & 2 ? a[4] : a[1], other & 4 ? a[5] : a[2], false, ink);
        }
      }
    }
  }
  for (let edge = 0; edge < FRUSTUM_EDGES.length; edge++) {
    const corner = work.corners[FRUSTUM_EDGES[edge]];
    vertex(mesh, corner[0], corner[1], corner[2], edge % 2 === 0, 1);
  }
  vertex(mesh, work.eye[0], work.eye[1], work.eye[2], true, 2, 3.5);
}

function segment3(mesh: Mesh, ax: number, ay: number, az: number, bx: number, by: number, bz: number, ink: number) {
  vertex(mesh, ax, ay, az, true, ink);
  vertex(mesh, bx, by, bz, false, ink);
}

export function kinematics3(mesh: Mesh, time: number, work: Workspace) {
  const structure = work.structure!;
  const [spine, left, right] = structure.chains;
  // The spine chases a slow orbit while each arm reaches for its own target.
  vec3.set(work.aim, Math.cos(time * 0.7) * 1.3, 1.1 + Math.sin(time * 0.9) * 0.9, Math.sin(time * 0.7) * 1.3);
  vec3.set(left.embeddedTarget, -1.9 + Math.sin(time * 1.3) * 0.5, Math.sin(time * 1.1) * 1.1, Math.cos(time * 0.8) * 1.3);
  vec3.set(right.embeddedTarget, 1.9 + Math.cos(time * 1.2) * 0.5, Math.cos(time * 0.9) * 1.1, Math.sin(time * 0.85) * 1.3);
  // Solve from the same rest pose every frame, so seeking has no history: the arms hang off the
  // straightened spine's joints before the structure moves them onto the solved ones.
  fabrik3.straighten(spine, [0.05, 0.9987, 0]);
  fabrik3.setBaseLocation(left, spine.bones[3].end);
  fabrik3.setBaseLocation(right, spine.bones[4].end);
  fabrik3.straighten(left, [-0.9987, 0.05, 0]);
  fabrik3.straighten(right, [0.9987, 0.05, 0]);
  fabrik3.solveStructure(structure, work.aim);

  for (const chain of structure.chains) {
    for (let i = 0; i < chain.bones.length; i++) {
      const bone = chain.bones[i];
      segment3(mesh, bone.start[0], bone.start[1], bone.start[2], bone.end[0], bone.end[1], bone.end[2], 1);
      vertex(mesh, bone.start[0], bone.start[1], bone.start[2], true, 1, 2.4);
      // Each ball joint's cone, drawn as a ring about the previous bone's direction.
      if (i > 0 && bone.joint.type === fabrik3.JointType.BALL) {
        const previous = chain.bones[i - 1];
        cone(mesh, previous.start, previous.end, bone.joint.rotor, 0.28);
      }
    }
  }
  // The spine's own cone at its base.
  cone(mesh, [0, -2.85, 0], spine.base, spine.baseboneRotor, 0.32);
  target3(mesh, work.aim);
  target3(mesh, left.embeddedTarget);
  target3(mesh, right.embeddedTarget);
}

/** A ring of half-angle `rotor` about the direction from `from` to `to`, `reach` along it. */
function cone(mesh: Mesh, from: Vec3, to: Vec3, rotor: number, reach: number) {
  let dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz) || 1;
  dx /= length; dy /= length; dz /= length;
  // Two perpendicular axes, from the cross product with whichever world axis is least aligned.
  const ax = Math.abs(dx) < 0.9 ? 1 : 0, ay = ax ? 0 : 1;
  let ux = ay * dz, uy = -ax * dz, uz = ax * dy - ay * dx;
  const u = Math.hypot(ux, uy, uz) || 1;
  ux /= u; uy /= u; uz /= u;
  const vx = dy * uz - dz * uy, vy = dz * ux - dx * uz, vz = dx * uy - dy * ux;
  const along = Math.cos(rotor) * reach, across = Math.sin(rotor) * reach;
  for (let step = 0; step <= 20; step++) {
    const angle = step / 20 * Math.PI * 2;
    const rx = ux * Math.cos(angle) + vx * Math.sin(angle);
    const ry = uy * Math.cos(angle) + vy * Math.sin(angle);
    const rz = uz * Math.cos(angle) + vz * Math.sin(angle);
    vertex(mesh, to[0] + dx * along + rx * across, to[1] + dy * along + ry * across, to[2] + dz * along + rz * across, step === 0, 0);
  }
}

/** A target: a dot with three short axis ticks. */
function target3(mesh: Mesh, p: Vec3) {
  vertex(mesh, p[0], p[1], p[2], true, 2, 4);
  for (let axis = 0; axis < 3; axis++) {
    const o = [0, 0, 0]; o[axis] = 0.16;
    segment3(mesh, p[0] - o[0], p[1] - o[1], p[2] - o[2], p[0] + o[0], p[1] + o[1], p[2] + o[2], 2);
  }
}

export function hull3Study(mesh: Mesh, time: number, work: Workspace) {
  // A breathing cloud, rebuilt from its seeds each frame, and its hull recomputed with quickhull3.
  for (let i = 0; i < 48; i++) {
    const scale = 1 + 0.22 * Math.sin(time * 1.1 + i * 0.7) + 0.08 * Math.sin(time * 2.3 + i * 1.9);
    for (let axis = 0; axis < 3; axis++) work.moving3[i * 3 + axis] = work.cloud3[i * 3 + axis] * scale;
  }
  const faces = quickhull3(work.moving3);
  const onHull = new Set(faces);
  for (let i = 0; i < 48; i++) {
    const p = i * 3;
    vertex(mesh, work.moving3[p], work.moving3[p + 1], work.moving3[p + 2], true, onHull.has(i) ? 2 : 0, onHull.has(i) ? 3.4 : 2.2);
  }
  const edges = new Set<number>();
  for (let f = 0; f < faces.length; f += 3) {
    const base = mesh.count;
    for (let corner = 0; corner < 3; corner++) {
      const p = faces[f + corner] * 3;
      vertex(mesh, work.moving3[p], work.moving3[p + 1], work.moving3[p + 2], true, 1);
    }
    face(mesh, base, base + 1, base + 2, 0.045);
    for (let corner = 0; corner < 3; corner++) {
      const a = faces[f + corner], b = faces[f + (corner + 1) % 3];
      const key = Math.min(a, b) * 64 + Math.max(a, b);
      if (edges.has(key)) continue;
      edges.add(key);
      segment3(mesh, work.moving3[a * 3], work.moving3[a * 3 + 1], work.moving3[a * 3 + 2], work.moving3[b * 3], work.moving3[b * 3 + 1], work.moving3[b * 3 + 2], 1);
    }
  }
}
