import type { World } from 'koota';
import { shutterCuts, strobeGap } from '../sequence/cuts';
import { Edit } from '../sequence/traits';
import { palette } from '../view/theme';
import { buildField } from './field';
import { Reveal } from './traits';

/** The field canvas is this tall, with the type's 240-unit strip centred in it. */
export const fieldHeight = 400;
/** Grid cell size for the distance field, in strip units. */
const fieldCell = 2;

/** The install command, centred in the 1000 × 240 title strip. */
export function paintTitle(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = palette.light;
  ctx.font = '500 112px "Geist Mono"';
  ctx.textAlign = 'center';
  ctx.fillText('npm i math', 500, 154);
}

export function prepareReveal(world: World) {
  const reveal = world.get(Reveal)!;
  const cuts = world.get(Edit)!.cuts;
  // The reveal runs over the shutter cuts.
  reveal.firstCut = cuts.length - 1 - shutterCuts;
  reveal.lastCut = cuts.length - 2;
  reveal.start = cuts[reveal.firstCut].at;
  reveal.end = cuts[cuts.length - 1].at;

  // Rasterise the type at the field's grid resolution and build its signed distance field.
  const width = 1000 / fieldCell, height = fieldHeight / fieldCell;
  const mask = document.createElement('canvas');
  mask.width = width; mask.height = height;
  const ctx = mask.getContext('2d', { willReadFrequently: true })!;
  ctx.scale(1 / fieldCell, 1 / fieldCell);
  ctx.translate(0, (fieldHeight - 240) / 2);
  paintTitle(ctx);
  reveal.field = buildField(ctx.getImageData(0, 0, width, height).data, width, height, fieldCell);

  // Every pulse releases a batch of particles, so the batches come faster as the strobe builds.
  reveal.pulseTimes.length = 0;
  for (let i = reveal.firstCut; i <= reveal.lastCut; i++) {
    const period = cuts[i].exposure * (1 + strobeGap);
    for (let at = cuts[i].at; at < cuts[i + 1].at - 1e-6; at += period) reveal.pulseTimes.push(at);
  }
  world.set(Reveal, reveal);
}
