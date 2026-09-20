import type { World } from 'koota';
import { spring } from 'math/time';
import { Geometry, Study } from '../forms/traits';
import { Sequence } from '../sequence/traits';
import { Time } from '../time/traits';
import { pushIn, ramp } from '../sequence/cuts';
import { renderReveal, renderResidue, revealExposure } from '../reveal/systems';
import { projectGeometry, drawGeometry } from './geometry';
import { text } from './drawing';
import { View } from './traits';
import { accent, palette } from './theme';

export function resizeView(world: World, ratio: string, resolution = 1080) {
  const view = world.get(View)!;
  const [width, height] = ratio.split(':').map(Number);
  view.height = 1000 * height / width;
  view.canvas!.width = resolution;
  view.canvas!.height = Math.round(resolution * height / width);
  view.canvas!.parentElement!.style.aspectRatio = `${width} / ${height}`;
  view.canvas!.parentElement!.style.setProperty('--ratio', String(width / height));
  world.set(View, view);
}

export function renderFilm(world: World) {
  const view = world.get(View)!;
  const ctx = view.context!;
  const sequence = world.get(Sequence)!;
  const { elapsed } = world.get(Time)!;
  const h = view.height;
  ctx.setTransform(view.canvas!.width / 1000, 0, 0, view.canvas!.height / h, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, 1000, h);

  if (sequence.reveal) renderReveal(world);
  else {
    // The whole frame pushes in across the shutter section and releases when the type lands.
    const push = 1 + pushIn * ramp(revealExposure(world));
    ctx.save();
    ctx.translate(500, h / 2);
    ctx.scale(push, push);
    ctx.translate(-500, -h / 2);
    // Between pulses only the retained ink stays on screen.
    if (sequence.open) world.query(Study, Geometry).readEach(([study, mesh]) => {
      if (study.index !== sequence.index) return;
      const index = study.index;
      projectGeometry(view, mesh, study, elapsed, h);
      const progress = revealExposure(world);
      // Solve from the pulse's initial state so seeking and playback share the same response, and
      // every recalled screen arrives with the same pop.
      view.arrival.value = 0;
      view.arrival.velocity = 0;
      spring.update(view.arrival, 1, Math.min(0.085, sequence.duration * 0.18), 0.48, sequence.pulseLocal);
      const arrival = view.arrival.value;
      ctx.save();
      ctx.translate(500, (h - 165) / 2 + (1 - arrival) * 10);
      ctx.scale(0.95 + arrival * 0.05, 0.95 + arrival * 0.05);
      ctx.translate(-500, -(h - 165) / 2);
      // Each flash stays at full brightness through the shutter section; only the captions recede.
      drawGeometry(ctx, view, mesh, index, accent(sequence.cut + sequence.pulse));
      ctx.restore();
      // Captions recede a little through the shutter section but stay legible on any paused frame.
      ctx.globalAlpha = 1 - progress * 0.3;

      text(ctx, study.title, 500, h - 168, 32, palette.light, 'center', 'sans');
      text(ctx, study.equation, 500, h - 115, index === 0 ? 16 : 20, palette.muted, 'center');
    });
    ctx.globalAlpha = 1;
    renderResidue(world);
    ctx.restore();
  }
}
