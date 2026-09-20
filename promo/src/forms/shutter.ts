import { lerp } from 'math';
import { vertex, type Mesh } from './geometry';

export function shutterSurface(mesh: Mesh, index: number) {
  for (let direction = 0; direction < 2; direction++) {
    for (let line = 0; line <= 28; line++) {
      for (let step = 0; step <= 96; step++) {
        const u = (direction ? line / 28 : step / 96) * Math.PI * 2;
        const v = (direction ? step / 96 : line / 28) * 2 - 1;
        let x = 0, y = 0, z = 0;
        switch (index) {
          case 34: {
            const radius = Math.cosh(v * 1.25);
            x = radius * Math.cos(u); y = v * 1.25; z = radius * Math.sin(u); break;
          }
          case 35: {
            const radius = (v + 1) * 1.2;
            x = radius * Math.cos(u); y = 1.8 - (v + 1) * 1.8; z = radius * Math.sin(u); break;
          }
          case 36: {
            const radius = Math.sqrt(1 + v * v * 3);
            x = radius * Math.cos(u); y = v * Math.sqrt(3); z = radius * Math.sin(u); break;
          }
          case 37: {
            const angle = v * Math.PI / 2;
            x = Math.cos(angle) * Math.cos(u) * 2.5;
            y = Math.sin(angle) * 1.25; z = Math.cos(angle) * Math.sin(u) * 1.65; break;
          }
          case 38: {
            const a = u / Math.PI - 1, b = v;
            x = (a - a ** 3 / 3 + a * b * b) * 1.5;
            y = (b - b ** 3 / 3 + b * a * a) * 1.5;
            z = (a * a - b * b) * 1.5; break;
          }
          case 39: {
            const angle = v * Math.PI;
            const radius = 1.7 + Math.cos(angle) * 0.65;
            x = radius * Math.cos(u); y = Math.sin(angle) * 0.65; z = radius * Math.sin(u); break;
          }
        }
        vertex(mesh, x, y, z, step === 0);
      }
    }
  }
}

export function shutterCurve(mesh: Mesh, index: number, time: number) {
  for (let layer = 0; layer < 8; layer++) {
    const scale = 1 - layer * 0.055;
    for (let step = 0; step <= 600; step++) {
      const t = step / 600 * Math.PI * 2;
      let x = 0, y = 0, z = 0;
      switch (index) {
        case 40: {
          const angle = t * 4 + time * 0.2;
          const radius = t / (Math.PI * 2) * 2.5;
          x = Math.cos(angle) * radius; y = Math.sin(angle) * radius; break;
        }
        case 41: {
          const angle = t * 2.5 + time * 0.2;
          const radius = 2.5 * Math.exp((t - Math.PI * 2) * 0.5);
          x = Math.cos(angle) * radius; y = Math.sin(angle) * radius; break;
        }
        case 42: {
          const denominator = 1 + Math.sin(t) ** 2;
          x = 2.8 * Math.cos(t) / denominator;
          y = 2.8 * Math.sin(t) * Math.cos(t) / denominator; break;
        }
        case 43: {
          const radius = 1.4 * (1 - Math.cos(t));
          x = radius * Math.cos(t); y = radius * Math.sin(t); break;
        }
        case 44: x = Math.cos(t) ** 3 * 2.5; y = Math.sin(t) ** 3 * 2.5; break;
        case 45: x = (2 * Math.cos(t) + Math.cos(2 * t)) * 0.85; y = (2 * Math.sin(t) - Math.sin(2 * t)) * 0.85; break;
        case 46: x = (3 * Math.cos(t) - Math.cos(3 * t)) * 0.65; y = (3 * Math.sin(t) - Math.sin(3 * t)) * 0.65; break;
        case 47: {
          const angle = t * 2;
          x = (angle - Math.sin(angle) - Math.PI * 2) * 0.42;
          y = (1 - Math.cos(angle)) * 0.42 - 0.42; break;
        }
        case 48: x = (Math.cos(t) + t * Math.sin(t)) * 0.45; y = (Math.sin(t) - t * Math.cos(t)) * 0.45; break;
        case 49: {
          const latitude = t / 2 - Math.PI / 2;
          x = Math.cos(latitude) * Math.cos(t * 12) * 2.3;
          y = Math.sin(latitude) * 2.3; z = Math.cos(latitude) * Math.sin(t * 12) * 2.3; break;
        }
        case 50: {
          const radius = t / (Math.PI * 2) * 2.3;
          x = Math.cos(t * 9) * radius; y = lerp(2.3, -2.3, step / 600); z = Math.sin(t * 9) * radius; break;
        }
        case 51: {
          const angle = t * 3 + (layer % 2) * Math.PI;
          x = Math.cos(angle); y = lerp(-2.4, 2.4, step / 600); z = Math.sin(angle); break;
        }
      }
      vertex(mesh, x * scale, y * scale, z * scale, step === 0, layer === 0 ? 2 : 1);
    }
  }
}

export function shutterSolid(mesh: Mesh, index: number) {
  for (let layer = 0; layer < 7; layer++) {
    const radius = 2.25 * (1 - layer * 0.105);
    const count = index === 52 ? 4 : 6;
    for (let a = 0; a < count; a++) {
      for (let b = a + 1; b < count; b++) {
        if (index === 53 && Math.floor(a / 2) === Math.floor(b / 2)) continue;
        for (let end = 0; end < 2; end++) {
          const id = end ? b : a;
          const x = index === 52 ? (id & 1 ? -1 : 1) / Math.sqrt(3) : id < 2 ? (id % 2 ? -1 : 1) : 0;
          const y = index === 52 ? (id & 2 ? -1 : 1) / Math.sqrt(3) : id >= 2 && id < 4 ? (id % 2 ? -1 : 1) : 0;
          const z = index === 52 ? ((id === 0 || id === 3) ? 1 : -1) / Math.sqrt(3) : id >= 4 ? (id % 2 ? -1 : 1) : 0;
          vertex(mesh, x * radius, y * radius, z * radius, end === 0, layer === 0 ? 2 : 1);
        }
      }
    }
  }
}
