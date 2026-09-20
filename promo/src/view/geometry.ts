import { clamp, quat, vec3 } from 'math';
import type { Mesh } from '../forms/geometry';
import type { View } from './traits';
import { lightRgb, palette } from './theme';

type Projection = ReturnType<typeof View.schema>;

export function projectGeometry(view: Projection, mesh: Mesh, study: { index: number; planar: boolean }, elapsed: number, height: number) {
  const index = study.index;
  const cy = (height - 165) / 2;
  const scale = Math.min(138, (height - 400) / 5.6);
  vec3.set(view.axis, 0, 1, 0);
  quat.setAxisAngle(view.rotation, view.axis, elapsed * 0.6 + (index === 2 ? 0.15 : -0.5));
  vec3.set(view.axis, 1, 0, 0);
  quat.setAxisAngle(view.tilt, view.axis, (index === 2 || index === 3 ? -0.12 : 0.53) + Math.sin(elapsed * 0.8) * 0.16);
  quat.multiply(view.rotation, view.tilt, view.rotation);
  if (study.planar) quat.identity(view.rotation);
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < mesh.count; i++) {
    vec3.fromBuffer(view.point, mesh.positions, i * 3);
    vec3.transformQuat(view.point, view.point, view.rotation);
    const perspective = study.planar ? 1 : 9 / (9 + view.point[2]);
    view.projected[i * 3] = 500 + view.point[0] * scale * perspective;
    view.projected[i * 3 + 1] = cy - view.point[1] * scale * perspective;
    view.projected[i * 3 + 2] = view.point[2];
    minX = Math.min(minX, view.projected[i * 3]);
    maxX = Math.max(maxX, view.projected[i * 3]);
    minY = Math.min(minY, view.projected[i * 3 + 1]);
    maxY = Math.max(maxY, view.projected[i * 3 + 1]);
  }
  // Flow trails keep their world framing and may extend beyond the canvas.
  if (index === 9) return;
  const fit = Math.min(1, 840 / (maxX - minX), (height - 440) / (maxY - minY));
  for (let i = 0; i < mesh.count; i++) {
    view.projected[i * 3] = 500 + (view.projected[i * 3] - (minX + maxX) / 2) * fit;
    view.projected[i * 3 + 1] = cy + (view.projected[i * 3 + 1] - (minY + maxY) / 2) * fit;
  }
}

export function drawGeometry(ctx: CanvasRenderingContext2D, view: Projection, mesh: Mesh, index: number, accent: readonly [number, number, number] = lightRgb) {
  for (let i = 0; i < mesh.faceCount; i++) {
    const a = mesh.faces[i * 3] * 3, b = mesh.faces[i * 3 + 1] * 3, c = mesh.faces[i * 3 + 2] * 3;
    const shade = Math.round(8 + mesh.shades[i] * 224);
    ctx.fillStyle = `rgb(${shade},${Math.round(shade * 0.98)},${Math.round(shade * 0.93)})`;
    ctx.beginPath();
    ctx.moveTo(view.projected[a], view.projected[a + 1]);
    ctx.lineTo(view.projected[b], view.projected[b + 1]);
    ctx.lineTo(view.projected[c], view.projected[c + 1]);
    ctx.closePath(); ctx.fill();
  }
  
  // Batch depth and line weight so diagrams can mix guides and construction lines.
  for (let band = 0; band < 6; band++) {
    for (let ink = 0; ink < 3; ink++) {
      const [r, g, b] = ink === 2 ? accent : lightRgb;
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.24 + (5 - band) * 0.13) * (ink === 0 ? 0.3 : ink === 2 ? 1.45 : 1)})`;
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = ink === 2 ? 1.9 : index === 11 ? 1.65 : index === 2 ? 1.05 : 1.15;
      ctx.beginPath();
      for (let i = 0; i < mesh.count; i++) {
        const p = i * 3;
        if (mesh.ink[i] !== ink) continue;
        if (clamp(Math.floor((view.projected[p + 2] + 3.8) / 7.6 * 6), 0, 5) !== band) continue;
        const x = view.projected[p];
        const y = view.projected[p + 1];
        if (mesh.dots) {
          const radius = 1.1 + (5 - band) * 0.26;
          ctx.moveTo(x + radius, y); ctx.arc(x, y, radius, 0, Math.PI * 2);
        } else if (i > 0 && !mesh.starts[i]) {
          ctx.moveTo(view.projected[p - 3], view.projected[p - 2]); ctx.lineTo(x, y);
        }
      }
      if (mesh.dots) ctx.fill(); else ctx.stroke();
    }
  }
  for (let i = 0; i < mesh.count; i++) {
    if (mesh.radii[i] === 0) continue;
    ctx.fillStyle = mesh.ink[i] === 0 ? palette.dim : mesh.ink[i] === 2 ? `rgb(${accent[0]},${accent[1]},${accent[2]})` : palette.light;
    ctx.beginPath(); ctx.arc(view.projected[i * 3], view.projected[i * 3 + 1], mesh.radii[i], 0, Math.PI * 2); ctx.fill();
  }
}
