import { clamp } from 'math';
import { lightRgb, spectrumAt } from './theme';

// The talk's starfield, ported from its TSL shader to Canvas 2D: a fixed lattice of tiny tilted
// facets, each catching a specular glint from a light that drifts across the sky. A ring around
// the light tints the glints through the brand spectrum; elsewhere they stay faint and white.
// Everything is a function of absolute time, so seeking and offline rendering match playback.

/** Facets per canvas height. The shader uses 191; fewer keeps Canvas 2D at 60 fps. */
const DENSITY = 96;

type Field = {
  height: number;
  count: number;
  x: Float32Array; y: Float32Array;
  tiltX: Float32Array; tiltY: Float32Array;
  seedY: Float32Array; seedZ: Float32Array;
};

const fields = new Map<number, Field>();
const color: [number, number, number] = [0, 0, 0];

function fract(value: number) { return value - Math.floor(value); }

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** The shader's hash21: two fract folds of a scaled point. */
function hash21(x: number, y: number) {
  let px = fract(x * 123.34), py = fract(y * 456.21);
  const dot = px * (px + 45.32) + py * (py + 45.32);
  px = fract(px + dot); py = fract(py + dot);
  return fract(px * py);
}

function field(height: number) {
  let result = fields.get(height);
  if (result) return result;
  const columns = Math.ceil(1000 / height * DENSITY) + 2;
  const rows = DENSITY + 2;
  const count = columns * rows;
  result = {
    height, count,
    x: new Float32Array(count), y: new Float32Array(count),
    tiltX: new Float32Array(count), tiltY: new Float32Array(count),
    seedY: new Float32Array(count), seedZ: new Float32Array(count),
  };
  const cell = height / DENSITY;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const i = row * columns + column;
      const cx = column - columns / 2, cy = row - rows / 2;
      const a = hash21(cx, cy);
      const b = hash21(cx + a + 3.71, cy + a + 3.71);
      const c = hash21(cx + b + 9.13, cy + b + 9.13);
      const d = hash21(cx + 11.71, cy + 11.71);
      const e = hash21(cx + 11.71 + d + 7.13, cy + 11.71 + d + 7.13);
      result.x[i] = 500 + (cx + 0.5 + (b - 0.5) * 0.82) * cell;
      result.y[i] = height / 2 + (cy + 0.5 + (c - 0.5) * 0.82) * cell;
      result.tiltX[i] = (d - 0.5) * 1.5;
      result.tiltY[i] = (e - 0.5) * 1.5;
      result.seedY[i] = b;
      result.seedZ[i] = c;
    }
  }
  fields.set(height, result);
  return result;
}

/** Seconds the ignition wave takes to cross the sky, and the extra scatter in each glint's moment. */
const igniteSpread = 0.9;
const igniteScatter = 0.45;
/** Seconds a glint takes to switch on, and the brief overshoot as it does. */
const igniteSnap = 0.06;
const igniteFlash = 1.8;

/**
 * `intensity` scales every glint. With `ignition`, the seconds since the sky was lit, glints
 * switch on one after another in a wave spreading out from the centre, each with a brief flash.
 */
export function renderGlitter(ctx: CanvasRenderingContext2D, height: number, time: number, intensity = 1, ignition = Infinity) {
  if (intensity <= 0 || ignition < 0) return;
  const glints = field(height);
  const lightX = Math.sin(time * 0.32) * 0.55, lightY = Math.cos(time * 0.23) * 0.3;

  const buckets = new Map<string, Path2D>();
  for (let i = 0; i < glints.count; i++) {
    const px = (glints.x[i] - 500) / height, py = (glints.y[i] - height / 2) / height;
    const dx = px - lightX, dy = py - lightY;
    const radius = Math.hypot(dx, dy);
    const cycle = radius * 1.55;
    const band = smoothstep(0.78, 1.12, cycle) * (1 - smoothstep(1.88, 2.22, cycle));
    // Glints cover the whole sky; the ring around the light only brightens and tints them.
    const visibility = 0.6 + 0.4 * band;

    const ry = glints.seedY[i], rz = glints.seedZ[i];
    // Facets wobble on their own clocks, which is what makes the glints twinkle.
    const tiltX = glints.tiltX[i] + Math.sin(time * (ry * 1.3 + 0.5) + rz * 21) * 0.05;
    const tiltY = glints.tiltY[i] + Math.cos(time * (rz * 1.1 + 0.4) + ry * 17) * 0.05;
    const normalScale = 1 / Math.hypot(tiltX, tiltY, 0.72);
    // Half vector between the light direction and the viewer.
    let hx = -dx, hy = -dy, hz = 0.62;
    const lightScale = 1 / Math.hypot(hx, hy, hz);
    hx *= lightScale; hy *= lightScale; hz = hz * lightScale + 1;
    const halfScale = 1 / Math.hypot(hx, hy, hz);
    const facing = (tiltX * hx + tiltY * hy + 0.72 * hz) * normalScale * halfScale;
    if (facing < 0.95) continue;
    const specular = facing ** 80 * (rz * 0.9 + 0.6);
    let lit = 1;
    if (Number.isFinite(ignition)) {
      // This glint's moment: its distance from the centre sets the wave, its seed the scatter.
      const moment = Math.hypot(px, py) / 0.7 * igniteSpread + rz * igniteScatter;
      const since = ignition - moment;
      if (since < 0) continue;
      const on = Math.min(1, since / igniteSnap);
      lit = on * (1 + (igniteFlash - 1) * Math.max(0, 1 - since / 0.12));
    }
    const alpha = clamp(specular * visibility * 2.4 * intensity * lit, 0, 1);
    if (alpha < 0.04) continue;

    const radial = radius > 1e-4 ? (tiltX * dx + tiltY * dy) / radius : 0;
    const hue = cycle - 1 + radial * 0.14 + ry * 0.1 - time * 0.02;
    spectrumAt(hue, color);
    const r = Math.round(lightRgb[0] + (color[0] * 1.15 - lightRgb[0]) * band);
    const g = Math.round(lightRgb[1] + (color[1] * 1.15 - lightRgb[1]) * band);
    const b = Math.round(lightRgb[2] + (color[2] * 1.15 - lightRgb[2]) * band);
    const level = Math.ceil(alpha * 4) / 4;
    const key = `rgba(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)},${level})`;
    let path = buckets.get(key);
    if (!path) buckets.set(key, path = new Path2D());
    const size = 1 + alpha * 1.8;
    path.moveTo(glints.x[i] + size, glints.y[i]);
    path.arc(glints.x[i], glints.y[i], size, 0, Math.PI * 2);
  }
  for (const [style, path] of buckets) {
    ctx.fillStyle = style;
    ctx.fill(path);
  }
}
