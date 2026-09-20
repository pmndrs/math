import { quat, quat2, vec3 } from 'math';
import { simplex3d } from 'math/noise';
import { face, vertex, type Mesh } from './geometry';
import type { Workspace } from './systems';

export function skinning(mesh: Mesh, time: number, work: Workspace) {
  vec3.set(work.normal, 0, 1, 0);
  quat.setAxisAngle(work.rotation, work.normal, Math.sin(time * 0.8) * 2.6);
  vec3.set(work.next, Math.sin(time * 0.7) * 0.7, 0, 0);
  quat2.fromRotationTranslation(work.dual, work.rotation, work.next);
  for (let direction = 0; direction < 2; direction++) {
    const lines = direction ? 42 : 32;
    const samples = direction ? 64 : 90;
    for (let line = 0; line <= lines; line++) {
      for (let step = 0; step <= samples; step++) {
        const height = direction ? line / lines : step / samples;
        const angle = (direction ? step / samples : line / lines) * Math.PI * 2;
        quat2.lerp(work.blend, work.rest, work.dual, height);
        quat2.normalize(work.blend, work.blend);
        quat2.getReal(work.real, work.blend);
        quat2.getTranslation(work.next, work.blend);
        const radius = 0.78 + 0.15 * Math.cos(angle * 4);
        vec3.set(work.point, Math.cos(angle) * radius, (height - 0.5) * 4.5, Math.sin(angle) * radius);
        vec3.transformQuat(work.point, work.point, work.real);
        vec3.add(work.point, work.point, work.next);
        vertex(mesh, work.point[0], work.point[1], work.point[2], step === 0);
      }
    }
  }
}

function isoVertex(mesh: Mesh, x: number, y: number, z: number, start: boolean) {
  vertex(mesh, (x - z) * 0.84, y + (x + z) * 0.38, 0, start, 0);
}

export function voxels(mesh: Mesh, time: number, work: Workspace) {
  for (let z = 8; z >= 0; z--) {
    for (let x = 8; x >= 0; x--) {
      const px = (x - 4.5) * 0.42, pz = (z - 4.5) * 0.42;
      const height = (Math.floor((simplex3d.sample(work.noise!, x * 0.16, z * 0.16, time * 0.07) + 1) * 4) + 1) * 0.22;
      const base = mesh.count;
      isoVertex(mesh, px, height - 1, pz, true);
      isoVertex(mesh, px + 0.4, height - 1, pz, false);
      isoVertex(mesh, px + 0.4, height - 1, pz + 0.4, false);
      isoVertex(mesh, px, height - 1, pz + 0.4, false);
      isoVertex(mesh, px, height - 1, pz, false);
      isoVertex(mesh, px, -1, pz, false);
      isoVertex(mesh, px + 0.4, -1, pz, false);
      isoVertex(mesh, px + 0.4, height - 1, pz, false);
      isoVertex(mesh, px, height - 1, pz, true);
      isoVertex(mesh, px, height - 1, pz + 0.4, false);
      isoVertex(mesh, px, -1, pz + 0.4, false);
      isoVertex(mesh, px, -1, pz, false);
      face(mesh, base, base + 5, base + 6, 0.28);
      face(mesh, base, base + 6, base + 1, 0.28);
      face(mesh, base, base + 3, base + 10, 0.48);
      face(mesh, base, base + 10, base + 5, 0.48);
      face(mesh, base, base + 1, base + 2, 0.9);
      face(mesh, base, base + 2, base + 3, 0.9);
    }
  }
}
