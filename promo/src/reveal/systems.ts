import type { World } from 'koota';
import { clamp } from 'math';
import { easing } from 'math/time';
import { drop, markAt, pressFrames, pushIn, sweepTime } from '../sequence/cuts';
import { Sequence } from '../sequence/traits';
import { View } from '../view/traits';
import { mark } from '../view/drawing';
import { palette } from '../view/theme';
import { renderGlitter } from '../view/glitter';
import { Time } from '../time/traits';
import { paintTitle } from './actions';
import { Reveal } from './traits';

export function revealExposure(world: World) {
  const sequence = world.get(Sequence)!;
  const reveal = world.get(Reveal)!;
  return clamp((sequence.cut - reveal.firstCut + sequence.local / sequence.duration) / (reveal.lastCut - reveal.firstCut + 1), 0, 1);
}

export function renderResidue(world: World) {
  const sequence = world.get(Sequence)!;
  const reveal = world.get(Reveal)!;
  const shutterCut = sequence.cut - reveal.firstCut;
  if (shutterCut < 0 || shutterCut >= reveal.offsets.length) return;
  const index = Math.min(reveal.offsets[shutterCut] + sequence.pulse, reveal.imprints.length - 1);
  const view = world.get(View)!;
  const ctx = view.context!;
  const y = view.height / 2 - 120;
  // Each pulse's band prints as that pulse closes.
  const press = easing.cubicOut(clamp((sequence.pulseLocal - sequence.exposure) * 60 / pressFrames + 1, 0, 1));
  if (index > 0) ctx.drawImage(reveal.imprints[index - 1], 0, y);
  ctx.globalAlpha = press;
  ctx.drawImage(reveal.imprints[index], 0, y);
  ctx.globalAlpha = 1;
}

export function renderReveal(world: World) {
  const { local } = world.get(Sequence)!;
  const view = world.get(View)!;
  const ctx = view.context!;
  const reveal = world.get(Reveal)!;
  const cy = view.height / 2;
  // Once the type has closed, the talk's glitter sky fades in behind it and keeps twinkling.
  const sky = easing.cubicOut(clamp((local - drop - sweepTime) / skyFade, 0, 1));
  renderGlitter(ctx, view.height, world.get(Time)!.elapsed, sky);
  if (local < drop) {
    // The drop: the last exposure has closed and the partial type holds, still pushed in.
    ctx.save();
    ctx.translate(500, cy);
    ctx.scale(1 + pushIn, 1 + pushIn);
    ctx.drawImage(reveal.imprints[reveal.imprints.length - 1], -500, -120);
    ctx.restore();
    return;
  }
  if (local >= markAt) {
    // After the type has held, the pmndrs mark cuts in on the same spot with the same settle.
    const wobble = settle(local - markAt);
    ctx.save();
    ctx.translate(500, cy);
    ctx.scale(1 + wobble, 1 + wobble);
    mark(ctx, 0, 0, 288, palette.light);
    ctx.restore();
    return;
  }
  const sweep = easing.cubicOut(clamp((local - drop) / sweepTime, 0, 1));
  const wobble = release(local - drop);

  ctx.save();
  ctx.translate(500, cy);
  ctx.scale(1 + wobble, 1 + wobble);
  ctx.translate(-500, -120);

  if (local - drop < sweepTime) {
    // The last construction retains its lateral motion as it flattens into the type.
    const height = 700 * (1 - sweep) + 2;
    ctx.globalAlpha = (1 - sweep) * 0.3;
    ctx.drawImage(reveal.source!, 0, 150, 1000, 800, -sweep * 60, 120 - height / 2, 1000 + sweep * 120, height);
  }
  // The glitched outline gives way to the solid fill as the front crosses.
  ctx.globalAlpha = 1 - sweep;
  ctx.drawImage(reveal.imprints[reveal.imprints.length - 1], 0, 0);
  ctx.globalAlpha = 1;

  // A slanted pressure front closes the remaining gaps in one continuous sweep.
  ctx.save();
  const front = -160 + sweep * 1320;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(front + 90, 0);
  ctx.lineTo(front - 90, 240); ctx.lineTo(0, 240); ctx.closePath();
  ctx.clip();
  paintTitle(ctx);
  ctx.restore();
  ctx.restore();
}

/** Seconds the sky takes to fade in after the type closes. */
const skyFade = 1.2;


/** A damped scale overshoot for the mark's arrival. */
function settle(t: number) {
  return t < 0.8 ? Math.sin(t * 19) * Math.exp(-t * 8) * 0.055 : 0;
}

/** The push-in lets go as the type lands: a spring from the pushed scale back to rest, with overshoot. */
function release(t: number) {
  return t < 0.8 ? pushIn * Math.exp(-t * 9) * Math.cos(t * 18) : 0;
}
