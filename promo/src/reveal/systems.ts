import type { World } from 'koota';
import { clamp } from 'math';
import { easing } from 'math/time';
import { drop, markAt, pushIn, sweepTime } from '../sequence/cuts';
import { Sequence } from '../sequence/traits';
import { View } from '../view/traits';
import { sceneContext } from '../view/scene';
import { mark } from '../view/drawing';
import { palette } from '../view/theme';
import { renderGlitter } from '../view/glitter';
import { Time } from '../time/traits';
import { fieldHeight, paintTitle } from './actions';
import { displacementAt, drawEmbers, drawParticles } from './field';
import { Reveal } from './traits';

export function revealExposure(world: World) {
  const sequence = world.get(Sequence)!;
  const reveal = world.get(Reveal)!;
  return clamp((sequence.cut - reveal.firstCut + sequence.local / sequence.duration) / (reveal.lastCut - reveal.firstCut + 1), 0, 1);
}

/** How far the field has built: continuously with time across the shutter section. */
function fieldStrength(world: World) {
  const reveal = world.get(Reveal)!;
  const { elapsed } = world.get(Time)!;
  if (reveal.end <= reveal.start) return 0;
  return clamp((elapsed - reveal.start) / (reveal.end - reveal.start), 0, 1);
}

/** How far the ending has gathered: nothing until late in the build, then quickly to one. */
function gathering(strength: number) {
  const t = clamp((strength - gatherStart) / (1 - gatherStart), 0, 1);
  return t * t * (3 - 2 * t);
}

/** The rings' look at a given build strength, at absolute time `time`. */
function fieldLook(strength: number, time: number) {
  const settle = strength * strength;
  const gather = gathering(strength);
  return {
    amplitude: fieldAmplitude * settle,
    // The particle layer stays faint over the studies and brightens on the film's ramp.
    glow: particleGlow * (particleFloor + (1 - particleFloor) * strength * strength * strength),
    time,
    // The disturbance reaches further out as the strobe builds, then draws back in as it gathers.
    reach: (fieldReach[0] + (fieldReach[1] - fieldReach[0]) * settle) * (1 - gather * 0.75),
    wavelength: fieldWavelength,
    phase: time * fieldFlow,
  };
}

const shift = new Float32Array(2);

/**
 * Composites the live scene onto the frame, with the strip around the unseen type re-drawn as
 * tiles displaced by the field, then the particles settling into the letters over it.
 */
export function renderDistortion(world: World, scene: HTMLCanvasElement) {
  const strength = fieldStrength(world);
  const view = world.get(View)!;
  const ctx = view.context!;
  const scale = view.canvas!.width / 1000;
  ctx.drawImage(scene, 0, 0, 1000, view.height);
  if (strength <= 0) return;
  const reveal = world.get(Reveal)!;
  const look = fieldLook(strength, world.get(Time)!.elapsed);
  const top = view.height / 2 - fieldHeight / 2;
  const tile = fieldTile;
  for (let y = 0; y < fieldHeight; y += tile) {
    for (let x = 0; x < 1000; x += tile) {
      displacementAt(reveal.field!, x + tile / 2, y + tile / 2, look, shift);
      const sx = clamp(x - shift[0], 0, 1000 - tile), sy = clamp(top + y - shift[1], 0, view.height - tile);
      ctx.drawImage(scene, sx * scale, sy * scale, tile * scale, tile * scale, x, top + y, tile, tile);
    }
  }
  drawParticles(ctx, reveal.field!, 0, top, look.time, reveal.pulseTimes, reveal.start, reveal.end, look.glow);
}

export function renderReveal(world: World) {
  const { local } = world.get(Sequence)!;
  const view = world.get(View)!;
  const ctx = view.context!;
  const cy = view.height / 2;
  const elapsed = world.get(Time)!.elapsed;
  const reveal = world.get(Reveal)!;
  const t = local - drop;
  const held = t < 0;
  // The letters fill once the last particles have settled; the impact sends a ripple outward.
  const fillAt = sweepTime * 0.7;
  const impact = held ? -1 : t - fillAt;
  const rippling = impact >= 0 && impact < rippleLife;
  // While the ripple runs, the whole cut renders offscreen so the ring can displace all of it.
  const target = rippling ? sceneContext(view) : ctx;
  if (rippling) {
    target.fillStyle = palette.base;
    target.fillRect(0, 0, 1000, view.height);
  }
  // The talk's glitter sky lights up glint by glint after the impact, then keeps twinkling.
  renderGlitter(target, view.height, elapsed, 1, impact);
  if (local >= markAt) {
    // After the type has held, the pmndrs mark cuts in on the same spot with the same settle.
    const wobble = settle(local - markAt);
    target.save();
    target.translate(500, cy);
    target.scale(1 + wobble, 1 + wobble);
    mark(target, 0, 0, 288, palette.light);
    target.restore();
  } else {
    // The reveal: the settled particles blast off as the solid letters land, and the push-in lets go.
    const letters = held ? 0 : easing.cubicOut(clamp((t - fillAt) / lettersTime, 0, 1));
    const wobble = held ? pushIn : release(t);
    target.save();
    target.translate(500, cy);
    target.scale(1 + wobble, 1 + wobble);
    target.translate(-500, 0);
    drawParticles(target, reveal.field!, 0, -fieldHeight / 2, elapsed, reveal.pulseTimes, reveal.start, reveal.end, particleGlow, impact);
    drawEmbers(target, reveal.field!, 0, -fieldHeight / 2, impact, emberGlow);
    if (letters > 0) {
      target.globalAlpha = letters;
      target.translate(0, -120);
      paintTitle(target);
    }
    target.globalAlpha = 1;
    target.restore();
  }
  if (rippling) renderRipple(view, impact);
}

/**
 * The impact ripple: a ring expanding from the type's centre that displaces the scene outward as
 * it passes, drawn by re-copying only the tiles near the ring.
 */
function renderRipple(view: ReturnType<typeof View.schema>, age: number) {
  const ctx = view.context!;
  const scene = view.scene!;
  const scale = view.canvas!.width / 1000;
  ctx.drawImage(scene, 0, 0, 1000, view.height);
  const radius = age * rippleSpeed;
  const strength = rippleAmplitude * (1 - age / rippleLife) ** 1.5;
  const cx = 500, cy = view.height / 2;
  const tile = rippleTile;
  const inner = Math.max(0, radius - rippleWidth * 2), outer = radius + rippleWidth * 2;
  for (let y = Math.floor((cy - outer) / tile) * tile; y < cy + outer; y += tile) {
    for (let x = Math.floor((cx - outer) / tile) * tile; x < cx + outer; x += tile) {
      if (x < 0 || y < 0 || x + tile > 1000 || y + tile > view.height) continue;
      const dx = x + tile / 2 - cx, dy = y + tile / 2 - cy;
      const distance = Math.hypot(dx, dy);
      if (distance < inner || distance > outer || distance < 1e-3) continue;
      const band = (distance - radius) / rippleWidth;
      const shift = strength * Math.exp(-(band * band));
      const sx = clamp(x - dx / distance * shift, 0, 1000 - tile), sy = clamp(y - dy / distance * shift, 0, view.height - tile);
      ctx.drawImage(scene, sx * scale, sy * scale, tile * scale, tile * scale, x, y, tile, tile);
    }
  }
}

/** The ripple's outward speed in strip units per second, peak displacement, ring width and life in seconds. */
const rippleSpeed = 1100;
const rippleAmplitude = 34;
const rippleWidth = 70;
const rippleLife = 0.75;
const rippleTile = 14;

/** Peak alpha of the particles once settled. */
const particleGlow = 0.85;
/** Peak alpha of the motes that drift off as the letters fill. */
const emberGlow = 0.58;
/** The particle layer's opacity at the start of the section, as a fraction of its peak. */
const particleFloor = 0.22;
/** How far the rings reach at the start and end of the build, in strip units. */
const fieldAmplitude = 12;
const fieldReach = [30, 170] as const;
/** Ring wavelength in strip units. */
const fieldWavelength = 44;
/** Ring flow outward, in wavelengths per second. */
const fieldFlow = 0.55;
/** Tile size for the displaced re-draw, in strip units. */
const fieldTile = 10;
/** The build strength at which the refraction draws back in as the particles settle. */
const gatherStart = 0.86;
/** Seconds the letters take to come up once the contours are most of the way in. */
const lettersTime = 0.14;



/** A damped scale overshoot for the mark's arrival. */
function settle(t: number) {
  return t < 0.8 ? Math.sin(t * 19) * Math.exp(-t * 8) * 0.055 : 0;
}

/** The push-in lets go as the type lands: a spring from the pushed scale back to rest, with overshoot. */
function release(t: number) {
  return t < 0.8 ? pushIn * Math.exp(-t * 9) * Math.cos(t * 18) : 0;
}
