import { clamp, lerp, vec3 } from 'math';
import { easing } from 'math/time';
import { face, vertex, type Mesh } from './geometry';
import type { Workspace } from './systems';

export function helicoid(mesh: Mesh, time: number) {
  for (let direction = 0; direction < 2; direction++) {
    const lines = direction ? 48 : 24;
    for (let line = 0; line <= lines; line++) {
      for (let step = 0; step <= 100; step++) {
        const u = (direction ? line / lines : step / 100) * Math.PI * 3;
        const radius = (direction ? step / 100 : line / lines) * 3 - 1.5;
        const angle = u + time * 0.4;
        vertex(mesh, radius * Math.cos(angle), (u - Math.PI * 1.5) * 0.48, radius * Math.sin(angle), step === 0);
      }
    }
  }
}

export function lissajous(mesh: Mesh, time: number) {
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      for (let step = 0; step <= 360; step++) {
        const t = step / 360 * Math.PI * 2;
        vertex(mesh, (column - 1) * 1.85 + Math.sin((column + 1) * t + time * 0.5) * 0.73,
          (row - 1) * 1.85 + Math.sin((row + 2) * t) * 0.73, 0, step === 0, row === 1 && column === 1 ? 2 : 1);
      }
    }
  }
}

export function bezierFan(mesh: Mesh, time: number, work: Workspace) {
  vec3.set(work.point, -2.4, -1.8, 0);
  vec3.set(work.next, 2.4, 1.8, 0);
  for (let line = 0; line < 42; line++) {
    const t = line / 41;
    vec3.set(work.normal, lerp(-3.5, 3.5, t), 3.2 + Math.sin(time) * 0.5, 0);
    vec3.set(work.tangent, lerp(3.5, -3.5, t), -3.2, 0);
    for (let step = 0; step <= 120; step++) {
      vec3.bezier(work.velocity, work.point, work.normal, work.tangent, work.next, step / 120);
      vertex(mesh, work.velocity[0], work.velocity[1], 0, step === 0);
    }
  }
}

function triangle(mesh: Mesh, x: number, y: number, size: number, depth: number, progress: number) {
  if (depth > 0 && progress > 0) {
    const childSize = lerp(size, size * 0.5, easing.cubicOut(clamp(progress, 0, 1)));
    // Shrinking each child toward its corner keeps the outer silhouette fixed.
    const offset = size - childSize;
    triangle(mesh, x, y + offset, childSize, depth - 1, progress - 1);
    triangle(mesh, x - offset * Math.sqrt(3) / 2, y - offset * 0.5, childSize, depth - 1, progress - 1);
    triangle(mesh, x + offset * Math.sqrt(3) / 2, y - offset * 0.5, childSize, depth - 1, progress - 1);
    return;
  }
  const start = mesh.count;
  vertex(mesh, x, y + size, 0, true, 1);
  vertex(mesh, x - size * Math.sqrt(3) / 2, y - size * 0.5, 0, false, 1);
  vertex(mesh, x + size * Math.sqrt(3) / 2, y - size * 0.5, 0, false, 1);
  vertex(mesh, x, y + size, 0, false, 1);
  face(mesh, start, start + 1, start + 2, 0.85);
}

export function sierpinski(mesh: Mesh, progress: number) {
  triangle(mesh, 0, 0, 2.7, 5, progress * 5);
  // The fixed outer silhouette is the accent; the subdivisions stay light.
  vertex(mesh, 0, 2.7, 0, true, 2);
  vertex(mesh, -2.7 * Math.sqrt(3) / 2, -1.35, 0, false, 2);
  vertex(mesh, 2.7 * Math.sqrt(3) / 2, -1.35, 0, false, 2);
  vertex(mesh, 0, 2.7, 0, false, 2);
}

export function chladni(mesh: Mesh, time: number) {
  mesh.dots = true;
  const amplitude = 0.85 + Math.sin(time * 0.8) * 0.15;
  for (let row = 0; row < 100; row++) {
    for (let column = 0; column < 100; column++) {
      const x = (column / 99 - 0.5) * Math.PI;
      const y = (row / 99 - 0.5) * Math.PI;
      const value = Math.cos(3 * x) * Math.cos(5 * y) - amplitude * Math.cos(5 * x) * Math.cos(3 * y);
      // The pattern's centre carries the accent, like a spotlight on the plate.
      if (Math.abs(value) < 0.085) vertex(mesh, x * 1.6, y * 1.6, 0, true, Math.hypot(x, y) < 0.8 ? 2 : 1);
    }
  }
}
