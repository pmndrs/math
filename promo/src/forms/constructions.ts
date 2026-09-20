import { vec2 } from 'math';
import { circumcircle, triangulatePolygon2 } from 'math/geometry';
import { polygon2 } from 'math/shapes';
import { easing } from 'math/time';
import { face, ring, segment, vertex, type Mesh } from './geometry';
import type { Workspace } from './systems';

export function circumcircleStudy(mesh: Mesh, time: number, work: Workspace) {
  vec2.set(work.a, Math.cos(0.4 + time * 0.3) * 2.15, Math.sin(0.4 + time * 0.3) * 2.15);
  vec2.set(work.b, Math.cos(2.8 + time * 0.15) * 2.15, Math.sin(2.8 + time * 0.15) * 2.15);
  vec2.set(work.c, Math.cos(4.9 + time * 0.2) * 2.15, Math.sin(4.9 + time * 0.2) * 2.15);
  const circle = circumcircle(work.circle!, work.a, work.b, work.c);
  ring(mesh, circle.center[0], circle.center[1], circle.radius, 1, 180);
  for (let i = 0; i < 3; i++) {
    const a = i === 0 ? work.a : i === 1 ? work.b : work.c;
    const b = i === 0 ? work.b : i === 1 ? work.c : work.a;
    segment(mesh, a[0], a[1], b[0], b[1], 2);
    vec2.lerp(work.target, a, b, 0.5);
    segment(mesh, -work.target[0] * 1.7, -work.target[1] * 1.7, work.target[0] * 1.7, work.target[1] * 1.7, 0);
    for (let dash = 0; dash < 14; dash++) {
      segment(mesh, a[0] * dash / 14, a[1] * dash / 14, a[0] * (dash + 0.45) / 14, a[1] * (dash + 0.45) / 14, 0);
    }
    vertex(mesh, a[0], a[1], 0, true, 2, 4.5);
  }
  vertex(mesh, circle.center[0], circle.center[1], 0, true, 2, 4);
}

function star(work: Workspace, time: number) {
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2 + time * 0.15;
    const radius = i % 2 ? 1.0 + Math.sin(time) * 0.12 : 2.0;
    work.polygon[i * 2] = Math.cos(angle) * radius;
    work.polygon[i * 2 + 1] = Math.sin(angle) * radius;
  }
}

export function triangulation(mesh: Mesh, time: number, work: Workspace) {
  star(work, time);
  const count = triangulatePolygon2(work.indices, work.polygon, 12) * 3;
  for (let i = 0; i < count; i += 3) {
    const a = work.indices[i] * 2, b = work.indices[i + 1] * 2, c = work.indices[i + 2] * 2;
    const cx = (work.polygon[a] + work.polygon[b] + work.polygon[c]) / 3;
    const cy = (work.polygon[a + 1] + work.polygon[b + 1] + work.polygon[c + 1]) / 3;
    const separation = 0.03 + (Math.sin(time * 1.6) * 0.5 + 0.5) * 0.28;
    const base = mesh.count;
    for (let j = 0; j <= 3; j++) {
      const p = (j % 3 === 0 ? a : j % 3 === 1 ? b : c);
      vertex(mesh, work.polygon[p] + cx * separation, work.polygon[p + 1] + cy * separation, 0, j === 0, 1);
    }
    face(mesh, base, base + 1, base + 2, 0.12 + i / count * 0.6);
  }
  // The original polygon stays as the accent while its triangles drift apart.
  for (let i = 0; i <= 12; i++) vertex(mesh, work.polygon[(i % 12) * 2], work.polygon[(i % 12) * 2 + 1], 0, i === 0, 2);
}

export function distanceContours(mesh: Mesh, time: number, work: Workspace) {
  star(work, time);
  for (let level = 0; level < 9; level++) {
    const distance = level * 0.15;
    for (let i = 0; i <= 160; i++) {
      const angle = i / 160 * Math.PI * 2;
      const x = Math.cos(angle), y = Math.sin(angle);
      let low = 0, high = 3.6;
      for (let iteration = 0; iteration < 12; iteration++) {
        const radius = (low + high) / 2;
        vec2.set(work.target, x * radius, y * radius);
        if (polygon2.signedDistance(work.polygon, 12, work.target) < distance) low = radius;
        else high = radius;
      }
      vertex(mesh, x * high, y * high, 0, i === 0, level === 0 ? 2 : 1);
    }
  }
  const x = Math.cos(time * 0.9) * 2.8, y = Math.sin(time * 0.9) * 2.8;
  vertex(mesh, x, y, 0, true, 2, 5);
  segment(mesh, 0, 0, x, y, 0);
}

export function hullStudy(mesh: Mesh, time: number, work: Workspace) {
  const angle = Math.sin(time * 0.4) * 0.3;
  const sx = 1 + Math.sin(time) * 0.1, sy = 1 - Math.sin(time) * 0.1;
  for (let i = 0; i < 60; i++) {
    vec2.fromBuffer(work.a, work.cloud, i * 2);
    const x = (work.a[0] * Math.cos(angle) - work.a[1] * Math.sin(angle)) * sx;
    const y = (work.a[0] * Math.sin(angle) + work.a[1] * Math.cos(angle)) * sy;
    vertex(mesh, x, y, 0, true, 1, 2.7);
  }
  const start = mesh.count;
  for (let i = 0; i <= work.hull.length; i++) {
    const p = work.hull[i % work.hull.length] * 3;
    vertex(mesh, mesh.positions[p], mesh.positions[p + 1], 0, i === 0, 2, 4);
    if (i > 1 && i < work.hull.length) face(mesh, start, start + i - 1, start + i, 0.075);
  }
  for (let i = 0; i < 60; i++) {
    const boundary = work.hull[i % work.hull.length] * 3;
    if (i % 3 === 0) segment(mesh, mesh.positions[i * 3], mesh.positions[i * 3 + 1], mesh.positions[boundary], mesh.positions[boundary + 1], 0);
  }
}

function ease(index: number, value: number) {
  switch (index) {
    case 0: return easing.linear(value);
    case 1: return easing.sineInOut(value);
    case 2: return easing.cubicIn(value);
    case 3: return easing.cubicOut(value);
    case 4: return easing.quintInOut(value);
    case 5: return easing.circIn(value);
    case 6: return easing.circOut(value);
    case 7: return easing.expoIn(value);
    default: return easing.expoOut(value);
  }
}

export function easingStudy(mesh: Mesh, time: number) {
  const phase = time * 0.35 % 1;
  for (let panel = 0; panel < 9; panel++) {
    const x = (panel % 3 - 1) * 1.9 - 0.68;
    const y = (1 - Math.floor(panel / 3)) * 1.9 - 0.68;
    for (let grid = 0; grid <= 4; grid++) {
      segment(mesh, x + grid * 0.34, y, x + grid * 0.34, y + 1.36, 0);
      segment(mesh, x, y + grid * 0.34, x + 1.36, y + grid * 0.34, 0);
    }
    for (let i = 0; i <= 70; i++) vertex(mesh, x + i / 70 * 1.36, y + ease(panel, i / 70) * 1.36, 0, i === 0, 1);
    vertex(mesh, x + phase * 1.36, y + ease(panel, phase) * 1.36, 0, true, 2, 4.5);
  }
}
