import { lerp } from 'math';
import { ring, segment, vertex, type Mesh } from './geometry';

export function phyllotaxis(mesh: Mesh, time: number) {
  mesh.dots = true;
  for (let i = 0; i < 1800; i++) {
    const radius = Math.sqrt(i / 1800) * 2.55;
    const angle = i * Math.PI * (3 - Math.sqrt(5)) + time * 0.2;
    vertex(mesh, Math.cos(angle) * radius, Math.sin(angle) * radius, 0, true, i % 13 === 0 ? 2 : 1);
  }
}

export function saddle(mesh: Mesh, time: number) {
  for (let direction = 0; direction < 2; direction++) {
    for (let line = 0; line <= 36; line++) {
      for (let step = 0; step <= 80; step++) {
        const x = ((direction ? line / 36 : step / 80) - 0.5) * 4.5;
        const z = ((direction ? step / 80 : line / 36) - 0.5) * 4.5;
        vertex(mesh, x, (x * x - z * z) * (0.3 + Math.sin(time) * 0.04), z, step === 0);
      }
    }
  }
}

export function rose(mesh: Mesh, time: number) {
  for (let layer = 0; layer < 16; layer++) {
    for (let step = 0; step <= 360; step++) {
      const angle = step / 360 * Math.PI * 2;
      const radius = (2.5 - layer * 0.105) * Math.cos(5 * angle + time * 0.4);
      vertex(mesh, Math.cos(angle) * radius, Math.sin(angle) * radius, 0, step === 0, layer === 0 ? 2 : 1);
    }
  }
}

export function catenaries(mesh: Mesh, time: number) {
  for (let line = 0; line < 32; line++) {
    const a = 0.9 + line * 0.055 + Math.sin(time * 0.6) * 0.1;
    for (let step = 0; step <= 180; step++) {
      const x = lerp(-2.35, 2.35, step / 180);
      vertex(mesh, x, a * (Math.cosh(x / a) - Math.cosh(2.35 / a)) + 2, 0, step === 0);
    }
  }
}

export function multiplication(mesh: Mesh, time: number) {
  ring(mesh, 0, 0, 2.5, 1, 240);
  for (let i = 0; i < 220; i++) {
    const a = i / 220 * Math.PI * 2;
    const b = a * (2 + Math.sin(time * 0.3) * 0.06);
    segment(mesh, Math.cos(a) * 2.5, Math.sin(a) * 2.5, Math.cos(b) * 2.5, Math.sin(b) * 2.5, i % 11 ? 1 : 2);
  }
}

export function superellipsoid(mesh: Mesh, time: number) {
  const power = 0.45 + (Math.sin(time * 0.8) * 0.5 + 0.5) * 1.4;
  for (let direction = 0; direction < 2; direction++) {
    for (let line = 0; line <= 28; line++) {
      for (let step = 0; step <= 110; step++) {
        const u = (direction ? line / 28 : step / 110) * Math.PI * 2;
        const v = ((direction ? step / 110 : line / 28) - 0.5) * Math.PI;
        const x = Math.cos(v) * Math.cos(u), y = Math.sin(v), z = Math.cos(v) * Math.sin(u);
        vertex(mesh, Math.sign(x) * Math.abs(x) ** power * 2,
          Math.sign(y) * Math.abs(y) ** power * 2, Math.sign(z) * Math.abs(z) ** power * 2, step === 0);
      }
    }
  }
}
