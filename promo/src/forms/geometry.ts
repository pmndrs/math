import type { Geometry } from './traits';

export type Mesh = ReturnType<typeof Geometry.schema>;

export function vertex(mesh: Mesh, x: number, y: number, z: number, start: boolean, ink = 1, radius = 0) {
  const i = mesh.count++;
  mesh.positions[i * 3] = x;
  mesh.positions[i * 3 + 1] = y;
  mesh.positions[i * 3 + 2] = z;
  mesh.starts[i] = Number(start);
  mesh.ink[i] = ink;
  mesh.radii[i] = radius;
}

export function segment(mesh: Mesh, ax: number, ay: number, bx: number, by: number, ink = 1) {
  vertex(mesh, ax, ay, 0, true, ink);
  vertex(mesh, bx, by, 0, false, ink);
}

export function ring(mesh: Mesh, x: number, y: number, radius: number, ink = 1, samples = 96) {
  for (let i = 0; i <= samples; i++) {
    const angle = i / samples * Math.PI * 2;
    vertex(mesh, x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 0, i === 0, ink);
  }
}

export function face(mesh: Mesh, a: number, b: number, c: number, shade: number) {
  const i = mesh.faceCount++;
  mesh.faces[i * 3] = a; mesh.faces[i * 3 + 1] = b; mesh.faces[i * 3 + 2] = c;
  mesh.shades[i] = shade;
}
