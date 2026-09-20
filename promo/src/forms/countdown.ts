import { lerp } from 'math';
import { face, ring, segment, vertex, type Mesh } from './geometry';

function square(mesh: Mesh, ax: number, ay: number, bx: number, by: number, shade: number) {
    const dx = bx - ax,
        dy = by - ay;
    const start = mesh.count;
    vertex(mesh, ax, ay, 0, true, 2);
    vertex(mesh, bx, by, 0, false, 2);
    vertex(mesh, bx + dy, by - dx, 0, false, 2);
    vertex(mesh, ax + dy, ay - dx, 0, false, 2);
    vertex(mesh, ax, ay, 0, false, 2);
    face(mesh, start, start + 1, start + 2, shade);
    face(mesh, start, start + 2, start + 3, shade);
    for (let i = 1; i < 14; i++) {
        const t = i / 14;
        segment(mesh, ax + dy * t, ay - dx * t, bx + dy * t, by - dx * t, 1);
    }
}

export function pythagoras(mesh: Mesh, time: number) {
    const a = 1.6 + Math.sin(time * 0.7) * 0.25;
    const b = 1.7 - Math.sin(time * 0.7) * 0.25;
    square(mesh, -a / 2, -b / 2, a / 2, -b / 2, 0.08);
    square(mesh, a / 2, -b / 2, a / 2, b / 2, 0.16);
    square(mesh, a / 2, b / 2, -a / 2, -b / 2, 0.45);
    segment(mesh, a / 2 - 0.2, -b / 2, a / 2 - 0.2, -b / 2 + 0.2, 2);
    segment(mesh, a / 2 - 0.2, -b / 2 + 0.2, a / 2, -b / 2 + 0.2, 2);
}

function koch(mesh: Mesh, ax: number, ay: number, bx: number, by: number, depth: number, ink: number) {
    if (depth === 0) {
        vertex(mesh, bx, by, 0, false, ink);
        return;
    }
    const dx = (bx - ax) / 3,
        dy = (by - ay) / 3;
    const px = ax + dx * 1.5 - (dy * Math.sqrt(3)) / 2;
    const py = ay + dy * 1.5 + (dx * Math.sqrt(3)) / 2;
    koch(mesh, ax, ay, ax + dx, ay + dy, depth - 1, ink);
    koch(mesh, ax + dx, ay + dy, px, py, depth - 1, ink);
    koch(mesh, px, py, ax + dx * 2, ay + dy * 2, depth - 1, ink);
    koch(mesh, ax + dx * 2, ay + dy * 2, bx, by, depth - 1, ink);
}

export function snowflake(mesh: Mesh, time: number) {
    for (let layer = 0; layer < 5; layer++) {
        const radius = 2.6 * (1 - layer * 0.15);
        const angle = time * 0.12 + layer * 0.035;
        const ink = layer === 0 ? 2 : 1;
        vertex(mesh, Math.cos(angle) * radius, Math.sin(angle) * radius, 0, true, ink);
        for (let side = 0; side < 3; side++) {
            const a = angle - (side / 3) * Math.PI * 2;
            const b = angle - ((side + 1) / 3) * Math.PI * 2;
            koch(mesh, Math.cos(a) * radius, Math.sin(a) * radius, Math.cos(b) * radius, Math.sin(b) * radius, 4, ink);
        }
    }
}

export function epicycles(mesh: Mesh, time: number) {
    let x = -1.1,
        y = 0;
    for (let i = 0; i < 6; i++) {
        const n = i * 2 + 1;
        const radius = 1.25 / n;
        ring(mesh, x, y, radius, i === 0 ? 1 : 0, 72);
        const nx = x + Math.cos(time * n * 1.4) * radius;
        const ny = y + Math.sin(time * n * 1.4) * radius;
        segment(mesh, x, y, nx, ny, 2);
        vertex(mesh, x, y, 0, true, 2, 2.5);
        x = nx;
        y = ny;
    }
    vertex(mesh, x, y, 0, true, 2, 4);
    segment(mesh, x, y, 1.15, y, 0);
    for (let step = 0; step <= 300; step++) {
        let value = 0;
        for (let i = 0; i < 6; i++) {
            const n = i * 2 + 1;
            value += (Math.sin((time * 1.4 - (step / 300) * 5) * n) * 1.25) / n;
        }
        vertex(mesh, lerp(1.15, 3.7, step / 300), value, 0, step === 0, 1);
    }
}
