import { clamp } from 'math';
import { simplex3d } from 'math/noise';
import { mulberry32 } from 'math/random';
import { lightRgb, spectrumRgb } from '../view/theme';

// The reveal's field is a refraction that radiates from the unseen type. Rings travel outward
// along the gradient of the type's signed distance field and displace whatever is drawn around
// it, so the letters are felt as a shape bending the scene rather than seen. The distance
// transform is exact (Felzenszwalb and Huttenlocher's separable parabola method), computed once.

export type Field = {
  /** Distance grid cell size in strip units. */
  cell: number;
  width: number; height: number;
  /** Signed distance to the letters in strip units, negative inside. */
  sdf: Float32Array;
  /** Particles that settle into the letters: target x y, start x y, birth rank, pull factor, size. */
  particles: Float32Array;
  count: number;
  /** Embers that fly off once the letters fill: origin x y, velocity x y, life, size, tint. */
  embers: Float32Array;
  /** Slow noise that drifts the particles before they settle. */
  noise: ReturnType<typeof simplex3d.create>;
};

/** One-dimensional squared distance transform, in place, over `n` values with stride `stride`. */
function transform1d(values: Float32Array, offset: number, stride: number, n: number, v: Int32Array, z: Float32Array, out: Float32Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  const f = (i: number) => values[offset + i * stride];
  for (let q = 1; q < n; q++) {
    let s = ((f(q) + q * q) - (f(v[k]) + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f(q) + q * q) - (f(v[k]) + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    out[q] = (q - v[k]) * (q - v[k]) + f(v[k]);
  }
  for (let q = 0; q < n; q++) values[offset + q * stride] = out[q];
}

/** Squared Euclidean distance from every cell to the nearest cell where `inside` is true. */
function distanceTransform(inside: Uint8Array, width: number, height: number) {
  const values = new Float32Array(width * height);
  for (let i = 0; i < values.length; i++) values[i] = inside[i] ? 0 : 1e12;
  const n = Math.max(width, height);
  const v = new Int32Array(n), z = new Float32Array(n + 1), out = new Float32Array(n);
  for (let x = 0; x < width; x++) transform1d(values, x, width, height, v, z, out);
  for (let y = 0; y < height; y++) transform1d(values, y * width, 1, width, v, z, out);
  return values;
}

/** Builds the field from a rasterised RGBA mask of the type at `width × height` cells of `cell` units. */
export function buildField(alpha: Uint8ClampedArray, width: number, height: number, cell: number): Field {
  const inside = new Uint8Array(width * height);
  const outside = new Uint8Array(width * height);
  for (let i = 0; i < inside.length; i++) { inside[i] = alpha[i * 4 + 3] > 127 ? 1 : 0; outside[i] = inside[i] ^ 1; }
  const toInk = distanceTransform(inside, width, height);
  const toAir = distanceTransform(outside, width, height);
  const sdf = new Float32Array(width * height);
  for (let i = 0; i < sdf.length; i++) sdf[i] = (Math.sqrt(toInk[i]) - Math.sqrt(toAir[i])) * cell;
  // Particles target an even lattice of points inside the letters, jittered so they read as a
  // scatter, and start from a wide spread around them.
  const random = mulberry32.create(23);
  const next = () => mulberry32.sample(random);
  const targets: number[] = [];
  for (let y = particleSpacing / 2; y < height * cell; y += particleSpacing) {
    for (let x = particleSpacing / 2; x < width * cell; x += particleSpacing) {
      const tx = x + (next() - 0.5) * particleSpacing * 0.7, ty = y + (next() - 0.5) * particleSpacing * 0.7;
      const gx = Math.floor(tx / cell), gy = Math.floor(ty / cell);
      if (gx < 0 || gy < 0 || gx >= width || gy >= height || sdf[gy * width + gx] > -1.5) continue;
      targets.push(tx, ty);
    }
  }
  const count = targets.length / 2;
  const particles = new Float32Array(count * 7);
  for (let i = 0; i < count; i++) {
    const p = i * 7;
    const angle = next() * Math.PI * 2, spread = 50 + Math.sqrt(next()) * 230;
    particles[p] = targets[i * 2];
    particles[p + 1] = targets[i * 2 + 1];
    particles[p + 2] = targets[i * 2] + Math.cos(angle) * spread;
    particles[p + 3] = targets[i * 2 + 1] + Math.sin(angle) * spread * 0.55;
    particles[p + 4] = next();
    particles[p + 5] = 0.75 + next() * 0.5;
    particles[p + 6] = 1.3 + next() * 1.1;
  }
  // A few motes leave the settled silhouette when the letters fill and wander off, whimsically.
  const embers = new Float32Array(emberCount * 7);
  for (let i = 0; i < emberCount; i++) {
    const e = i * 7, from = Math.floor(next() * count) * 7;
    const angle = -Math.PI / 2 + (next() - 0.5) * 2.6, speed = 8 + next() * 22;
    embers[e] = particles[from];
    embers[e + 1] = particles[from + 1];
    embers[e + 2] = Math.cos(angle) * speed;
    embers[e + 3] = Math.sin(angle) * speed;
    embers[e + 4] = 2.2 + next() * 2.4;
    embers[e + 5] = 1.1 + next() * 1.2;
    embers[e + 6] = next() < 0.3 ? Math.floor(next() * spectrumRgb.length) : -1;
  }
  return { cell, width, height, sdf, particles, count, embers, noise: simplex3d.create(23) };
}

/** Spacing of the particle lattice inside the letters, in strip units. */
const particleSpacing = 6.5;
/** Attraction toward each particle's place, per second, at the start and end of the section. */
const particlePull = [0.06, 7] as const;
/** The pull's ramp exponent across the section: higher holds the particles off until later, then rushes. */
const pullRamp = 6;
/** Batch growth: birth ranks are skewed so later pulses release more particles. Lower skews later. */
const batchSkew = 0.45;
/** Seconds of motion each particle's streak shows, as motion blur. */
const blurTime = 0.045;
/** The share of particles that catch the light once they fly, how often each glints per second, and how long a glint lasts. */
const glintShare = 0.14;
const glintRate = 1.3;
const glintLength = 0.12;

/** How brightly particle `i` catches the light at `time`: brief seeded flares, or zero. */
function glintAt(i: number, time: number) {
  if (hash(i + 0.33) > glintShare) return 0;
  const cycle = time * glintRate * (0.7 + hash(i + 0.61) * 0.6) + hash(i + 0.77);
  const phase = cycle - Math.floor(cycle);
  // A glint occupies a short window at the start of each cycle, easing up then down.
  const t = phase / (glintLength * glintRate);
  return t < 1 ? Math.sin(t * Math.PI) : 0;
}
/** The blast when the letters fill: launch speed range in strip units per second, drag per second, and life in seconds. */
const blastSpeed = [500, 1500] as const;
const blastDrag = 2.3;
const blastLife = 1.2;
/** Each particle's life is the base life scaled by a factor in this range, so they wink out staggered. */
const blastLifeSpread = [0.5, 1.6] as const;
/** Seconds over which the launches are staggered, so the burst is a volley rather than one frame. */
const blastStagger = 0.07;
/** Seconds of motion a blasted particle's tail shows, and the longest tail drawn, in strip units. */
const blastBlur = 0.055;
const blastTail = 44;
/** The tail's alpha relative to the particle's bright head, and how many segments it tapers over. */
const blastTailAlpha = 0.55;
const tailSteps = 3;
/** How fast a blasted particle's heading turns, at most, in radians per second: spirals and loops. */
const blastTurn = 9;
/** The little circles: epicycle radius range in strip units and rate range in radians per second. */
const blastLoopRadius = [3, 14] as const;
const blastLoopRate = [9, 26] as const;

function hash(value: number) {
  const x = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Displacement along a blasted particle's path at `age`: a heading that turns at `turn` while the
 * speed decays under drag, in closed form, plus a small epicycle. Written to `out` in a frame whose
 * x axis is the launch direction.
 */
function blastAt(speed: number, turn: number, loopRadius: number, loopRate: number, age: number, out: Float32Array) {
  if (age <= 0) { out[0] = 0; out[1] = 0; return; }
  // Integral of speed · e^(-drag t) · e^(i turn t) from 0 to age.
  const a = -blastDrag, b = turn;
  const growth = Math.exp(a * age);
  const nx = growth * Math.cos(b * age) - 1, ny = growth * Math.sin(b * age);
  const denominator = a * a + b * b;
  out[0] = speed * (nx * a + ny * b) / denominator;
  out[1] = speed * (ny * a - nx * b) / denominator;
  // The little circles, growing in over the first moments and fading with the flight.
  const loop = loopRadius * Math.min(1, age / 0.12) * Math.exp(-age * 0.9);
  out[0] += Math.cos(loopRate * age) * loop;
  out[1] += Math.sin(loopRate * age) * loop;
}

const path = new Float32Array(2);
/** How many motes drift off when the letters fill, and how far their wander swings, in strip units. */
const emberCount = 36;
const emberWander = 26;

/** Bilinear signed distance at a strip position, clamped to the grid. */
export function distanceAt(field: Field, x: number, y: number) {
  const gx = clamp(x / field.cell, 0, field.width - 1.001), gy = clamp(y / field.cell, 0, field.height - 1.001);
  const x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const i = y0 * field.width + x0;
  const top = field.sdf[i] * (1 - fx) + field.sdf[i + 1] * fx;
  const bottom = field.sdf[i + field.width] * (1 - fx) + field.sdf[i + field.width + 1] * fx;
  return top * (1 - fy) + bottom * fy;
}

export type FieldLook = {
  /** Peak displacement in strip units. */
  amplitude: number;
  /** Peak alpha of the particles. */
  glow: number;
  /** Absolute time, for the particles' drift. */
  time: number;
  /** How far from the letters the rings reach before fading, in strip units. */
  reach: number;
  /** Ring wavelength in strip units. */
  wavelength: number;
  /** Ring phase in wavelengths; advancing it sends the rings outward. */
  phase: number;
};

/**
 * The displacement at a strip position: rings of the distance, pushed along its gradient, fading
 * with distance. Inside the letters the field barely moves, which is what makes the shape felt.
 */
export function displacementAt(field: Field, x: number, y: number, look: FieldLook, out: Float32Array) {
  const d = distanceAt(field, x, y);
  const gx = distanceAt(field, x + field.cell, y) - distanceAt(field, x - field.cell, y);
  const gy = distanceAt(field, x, y + field.cell) - distanceAt(field, x, y - field.cell);
  const length = Math.hypot(gx, gy) || 1;
  const away = Math.abs(d);
  const ring = Math.sin(Math.PI * 2 * (away / look.wavelength - look.phase));
  const envelope = Math.exp(-away / look.reach) * (1 - Math.exp(-away / 6));
  const magnitude = look.amplitude * ring * envelope * (d < 0 ? 0.3 : 1);
  out[0] = gx / length * magnitude;
  out[1] = gy / length * magnitude;
  return out;
}

const trail = new Float32Array(2);

/** A particle's position at `time`, given its birth and the section's pull, written to `out`. */
function particleAt(field: Field, i: number, time: number, birth: number, start: number, duration: number, end: number, out: Float32Array) {
  const p = i * 7;
  const pulled = (s: number) => duration * (particlePull[0] * s + (particlePull[1] - particlePull[0]) * s ** (pullRamp + 1) / (pullRamp + 1));
  const now = clamp((time - start) / duration, 0, 1);
  const born = clamp((birth - start) / duration, 0, 1);
  const after = Math.max(0, time - end);
  const ease = 1 - Math.exp(-(pulled(now) - pulled(born) + particlePull[1] * after) * field.particles[p + 5]);
  // Drift fades out as the particle settles.
  const drift = (1 - ease) * 14;
  const nx = simplex3d.sample(field.noise, field.particles[p + 2] * 0.01, field.particles[p + 3] * 0.01, time * 0.25 + i * 0.01) * drift;
  const ny = simplex3d.sample(field.noise, field.particles[p + 3] * 0.01 + 40, field.particles[p + 2] * 0.01, time * 0.25 - i * 0.01) * drift;
  out[0] = field.particles[p + 2] + (field.particles[p] - field.particles[p + 2]) * ease + nx;
  out[1] = field.particles[p + 3] + (field.particles[p + 1] - field.particles[p + 3]) * ease + ny;
  return ease;
}

/**
 * The particles. Each pulse of the shutter releases a batch, larger toward the end. From its birth
 * a particle is pulled toward its place in the letters at a rate proportional to its distance, so
 * it never stands still, and the pull grows with the film's ramp, so everything converges in the
 * last stretch. The position is the closed form of that attraction integrated since birth. Each
 * drifts on slow noise as it goes, brightens as it lands, and is drawn as a streak over its last
 * moment of motion, so speed reads as blur.
 */
export function drawParticles(ctx: CanvasRenderingContext2D, field: Field, x: number, y: number, time: number, pulseTimes: number[], start: number, end: number, glow: number, blast = -1) {
  if (glow <= 0.002 || pulseTimes.length === 0 || blast > blastLife * blastLifeSpread[1]) return;
  const duration = end - start;
  // Once the letters fill, every particle is shot outward from the type's centre with drag, streaking hard.
  const centreX = 500, centreY = field.height * field.cell / 2;
  const blasted = blast >= 0;
  const [r, g, b] = lightRgb;
  const levels = 6, sizes = 2;
  const buckets: Path2D[] = [];
  for (let i = 0; i < levels * sizes; i++) buckets.push(new Path2D());
  const heads: Path2D[] = [];
  for (let i = 0; i < levels; i++) heads.push(new Path2D());
  // Blasted particles catching the light: a bright flare with a small four-point star.
  const flares = new Path2D();
  const stars = new Path2D();
  // Flying particles get tapered tails: three segments back along the path, thinning and dimming.
  const tails: Path2D[] = [];
  for (let i = 0; i < levels * sizes * tailSteps; i++) tails.push(new Path2D());
  const point = new Float32Array(2);
  const samples = new Float32Array(2 * (tailSteps + 1));
  for (let i = 0; i < field.count; i++) {
    const p = i * 7;
    const birth = pulseTimes[Math.min(pulseTimes.length - 1, Math.floor(field.particles[p + 4] ** batchSkew * pulseTimes.length))];
    if (time < birth) continue;
    const ease = particleAt(field, i, time, birth, start, duration, end, point);
    particleAt(field, i, Math.max(birth, time - blurTime), birth, start, duration, end, trail);
    let flying = false;
    let blastFade = 1;
    if (blasted) {
      // Each particle launches on its own moment within the stagger, away from the centre with a
      // wide jitter; its speed and jitter come from its seeds, and it lives its own span.
      const age = blast - field.particles[p + 4] * blastStagger;
      if (age > 0) {
        const life = blastLife * (blastLifeSpread[0] + hash(i + 0.9) * (blastLifeSpread[1] - blastLifeSpread[0]));
        if (age > life) continue;
        blastFade = 1 - (age / life) ** 2;
        flying = true;
        let dx = point[0] - centreX, dy = point[1] - centreY;
        const length = Math.hypot(dx, dy) || 1;
        dx /= length; dy /= length;
        const jitter = (field.particles[p + 5] - 1) * 3.6;
        const c = Math.cos(jitter), s = Math.sin(jitter);
        const vx = (dx * c - dy * s), vy = (dx * s + dy * c);
        const speed = blastSpeed[0] + (1 - field.particles[p + 4]) * (blastSpeed[1] - blastSpeed[0]);
        // Each particle's own curl and little circle.
        const turn = (hash(i) - 0.5) * 2 * blastTurn;
        const loopRadius = blastLoopRadius[0] + hash(i + 0.5) * (blastLoopRadius[1] - blastLoopRadius[0]);
        const loopRate = (blastLoopRate[0] + hash(i + 0.25) * (blastLoopRate[1] - blastLoopRate[0])) * (turn < 0 ? -1 : 1);
        // Sample the curved path back from the head, capping the tail's total length.
        const ox = point[0], oy = point[1];
        let tailSoFar = 0;
        for (let k = 0; k <= tailSteps; k++) {
          blastAt(speed, turn, loopRadius, loopRate, age - blastBlur * k / tailSteps, path);
          let sx = ox + vx * path[0] - vy * path[1], sy = oy + vy * path[0] + vx * path[1];
          if (k > 0) {
            const px = samples[(k - 1) * 2], py = samples[(k - 1) * 2 + 1];
            const step = Math.hypot(sx - px, sy - py);
            if (tailSoFar + step > blastTail) {
              const keep = Math.max(0, blastTail - tailSoFar) / (step || 1);
              sx = px + (sx - px) * keep; sy = py + (sy - py) * keep;
            }
            tailSoFar += step;
          }
          samples[k * 2] = sx; samples[k * 2 + 1] = sy;
        }
        point[0] = samples[0]; point[1] = samples[1];
      }
    }
    const arrived = clamp((time - birth) / 0.25, 0, 1);
    const alpha = glow * arrived * (0.22 + 0.78 * ease) * blastFade;
    const size = field.particles[p + 6] * (0.7 + 0.3 * ease) * (flying ? 1.3 : 1);
    const level = Math.min(levels - 1, Math.floor(alpha * levels));
    // Only the blasted particles catch the light: while they gather, the letters are not there yet.
    const glint = flying ? glintAt(i, time) * arrived * blastFade : 0;
    if (glint > 0.05) {
      const reach = size * (2 + glint * 6);
      flares.moveTo(x + point[0] + size * 1.6, y + point[1]);
      flares.arc(x + point[0], y + point[1], size * 1.6, 0, Math.PI * 2);
      stars.moveTo(x + point[0] - reach, y + point[1]); stars.lineTo(x + point[0] + reach, y + point[1]);
      stars.moveTo(x + point[0], y + point[1] - reach); stars.lineTo(x + point[0], y + point[1] + reach);
    }
    if (flying) {
      // A bright head with a tail that tapers off behind it.
      const sizeClass = size > 1.9 ? 1 : 0;
      for (let k = 0; k < tailSteps; k++) {
        const taper = 1 - k / tailSteps;
        const tailLevel = Math.min(levels - 1, Math.floor(alpha * blastTailAlpha * taper * levels));
        const tail = tails[(tailLevel * sizes + sizeClass) * tailSteps + k];
        tail.moveTo(x + samples[k * 2], y + samples[k * 2 + 1]);
        tail.lineTo(x + samples[(k + 1) * 2] + 0.01, y + samples[(k + 1) * 2 + 1]);
      }
      heads[level].moveTo(x + point[0] + size, y + point[1]);
      heads[level].arc(x + point[0], y + point[1], size, 0, Math.PI * 2);
      continue;
    }
    const bucket = level * sizes + (size > 1.9 ? 1 : 0);
    buckets[bucket].moveTo(x + trail[0], y + trail[1]);
    buckets[bucket].lineTo(x + point[0] + 0.01, y + point[1]);
  }
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < levels * sizes; i++) {
    ctx.strokeStyle = `rgba(${r},${g},${b},${((Math.floor(i / sizes) + 0.5) / levels).toFixed(3)})`;
    ctx.lineWidth = i % sizes ? 4.2 : 2.9;
    ctx.stroke(buckets[i]);
  }
  for (let i = 0; i < levels * sizes * tailSteps; i++) {
    const level = Math.floor(i / (sizes * tailSteps)), sizeClass = Math.floor(i / tailSteps) % sizes, k = i % tailSteps;
    ctx.strokeStyle = `rgba(${r},${g},${b},${((level + 0.5) / levels).toFixed(3)})`;
    ctx.lineWidth = (sizeClass ? 4.6 : 3.2) * (1 - k / (tailSteps + 0.5));
    ctx.stroke(tails[i]);
  }
  for (let i = 0; i < levels; i++) {
    ctx.fillStyle = `rgba(${r},${g},${b},${((i + 0.5) / levels).toFixed(3)})`;
    ctx.fill(heads[i]);
  }
  ctx.strokeStyle = `rgba(255,253,250,${(0.55 * glow).toFixed(3)})`;
  ctx.lineWidth = 1;
  ctx.stroke(stars);
  ctx.fillStyle = `rgba(255,253,250,${(0.95 * glow).toFixed(3)})`;
  ctx.fill(flares);
  ctx.restore();
}

/** Mote position at `age` seconds after release: a slow drift plus a curly noise wander, written to `out`. */
function emberAt(field: Field, i: number, age: number, out: Float32Array) {
  const e = i * 7;
  const swing = emberWander * Math.min(1, age / 0.8);
  out[0] = field.embers[e] + field.embers[e + 2] * age + simplex3d.sample(field.noise, i * 0.37, age * 0.45, 3.1) * swing;
  out[1] = field.embers[e + 1] + field.embers[e + 3] * age + simplex3d.sample(field.noise, age * 0.45, i * 0.37 + 9, 5.7) * swing;
}

const emberTrail = new Float32Array(2);
const emberPoint = new Float32Array(2);

/** The motes, `age` seconds after the letters filled: they ease out, wander, twinkle and fade. */
export function drawEmbers(ctx: CanvasRenderingContext2D, field: Field, x: number, y: number, age: number, glow: number) {
  if (age < 0 || glow <= 0.002) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < emberCount; i++) {
    const e = i * 7;
    const life = field.embers[e + 4];
    if (age > life) continue;
    const fade = Math.min(1, age / 0.5) * (1 - (age / life) ** 3);
    const flicker = 0.55 + 0.45 * Math.sin(age * (4 + (i % 5)) + i * 1.7);
    emberAt(field, i, age, emberPoint);
    emberAt(field, i, Math.max(0, age - blurTime), emberTrail);
    const tint = field.embers[e + 6];
    const [r, g, b] = tint >= 0 ? spectrumRgb[tint] : lightRgb;
    ctx.strokeStyle = `rgba(${r},${g},${b},${(glow * fade * flicker).toFixed(3)})`;
    ctx.lineWidth = field.embers[e + 5] * 1.6 * (0.5 + 0.5 * fade);
    ctx.beginPath();
    ctx.moveTo(x + emberTrail[0], y + emberTrail[1]);
    ctx.lineTo(x + emberPoint[0] + 0.01, y + emberPoint[1]);
    ctx.stroke();
  }
  ctx.restore();
}
