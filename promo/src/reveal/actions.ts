import type { World } from 'koota';
import { Geometry, Study } from '../forms/traits';
import { updateForms } from '../forms/systems';
import { bandGrowth, ramp, shutterCuts, strobeGap } from '../sequence/cuts';
import { mulberry32 } from 'math/random';
import { Edit, Sequence } from '../sequence/traits';
import { sequenceFilm } from '../sequence/systems';
import { Time } from '../time/traits';
import { View } from '../view/traits';
import { drawGeometry, projectGeometry } from '../view/geometry';
import { Reveal } from './traits';
import { palette } from '../view/theme';

function canvas(width: number, height: number) {
  const result = document.createElement('canvas');
  result.width = width; result.height = height;
  return result;
}

/** The install command, centred in the 1000 × 240 title strip. */
export function paintTitle(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = palette.light;
  ctx.font = '500 112px "Geist Mono"';
  ctx.textAlign = 'center';
  ctx.fillText('npm i math', 500, 154);
}

/** The same type as an outline: what the shutter flashes build before the sweep fills it. */
export function outlineTitle(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = palette.light;
  ctx.lineWidth = outlineWidth;
  ctx.lineJoin = 'round';
  ctx.font = '500 112px "Geist Mono"';
  ctx.textAlign = 'center';
  ctx.strokeText('npm i math', 500, 154);
}

/** Stroke width of the outline the flashes build, in strip units. */
const outlineWidth = 6;
/** How far each band's slice of the outline may slip sideways, in strip units. */
const outlineSlip = 8;

/** A row stride coprime with the band count, so the scattered bands visit every row once. */
export function bandStride(total: number) {
  for (let stride = 5; ; stride += 2) {
    let a = stride, b = total;
    while (b) [a, b] = [b, a % b];
    if (a === 1) return stride;
  }
}

export function prepareReveal(world: World) {
  const reveal = world.get(Reveal)!;
  const view = world.get(View)!;
  const savedTime = { ...world.get(Time)! };
  const cuts = world.get(Edit)!.cuts;
  // The reveal runs over the shutter cuts.
  reveal.firstCut = cuts.length - 1 - shutterCuts;
  reveal.lastCut = cuts.length - 2;
  reveal.start = cuts[reveal.firstCut].at;
  reveal.end = cuts[cuts.length - 1].at;
  reveal.mask = canvas(1000, 240);
  outlineTitle(reveal.mask.getContext('2d')!);
  const slips = mulberry32.create(9);

  const source = canvas(1000, 1250);
  const sourceContext = source.getContext('2d')!;
  reveal.imprints.length = 0;
  reveal.offsets.length = 0;
  // Every pulse prints a band, so the type gains one sliver per beat early on and several per
  // beat by the end, following the strobe's own ramp.
  const pulses: number[] = [];
  let total = 0;
  for (let i = reveal.firstCut; i <= reveal.lastCut; i++) {
    const period = cuts[i].exposure * (1 + strobeGap);
    const count = Math.max(1, Math.ceil((cuts[i + 1].at - cuts[i].at) / period - 1e-6));
    pulses.push(count);
    reveal.offsets.push(total);
    total += count;
  }
  // Band thickness follows the strobe's ramp: hairlines from the first pulses, slabs from the
  // last, so the type fills at the pace of the flashes. Rows are scattered by a coprime stride.
  const stride = bandStride(total);
  const weights: number[] = [];
  for (let i = reveal.firstCut; i <= reveal.lastCut; i++) {
    const growth = ramp((i - reveal.firstCut) / Math.max(1, shutterCuts - 1));
    for (let pulse = 0; pulse < pulses[i - reveal.firstCut]; pulse++) weights.push(1 + (bandGrowth - 1) * growth * growth);
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  const heights = weights.map(weight => 110 * weight / sum);
  const rows = weights.map((_, k) => (k * stride + 6) % total);
  const tops = new Array<number>(total).fill(0);
  let y = 58;
  for (const k of [...rows.keys()].sort((a, b) => rows[a] - rows[b])) { tops[k] = y; y += heights[k]; }
  try {
    let k = 0;
    for (let i = reveal.firstCut; i <= reveal.lastCut; i++) {
      const period = cuts[i].exposure * (1 + strobeGap);
      for (let pulse = 0; pulse < pulses[i - reveal.firstCut]; pulse++, k++) {
        // Sample whatever is on screen as this pulse closes.
        const elapsed = Math.min(cuts[i].at + pulse * period + cuts[i].exposure, cuts[i + 1].at) - 1 / 120;
        world.set(Time, { elapsed, playing: false });
        sequenceFilm(world);
        updateForms(world);
        const shown = world.get(Sequence)!.index;
        const entity = world.query(Study, Geometry).find(entity => entity.get(Study)!.index === shown)!;
        const study = entity.get(Study)!;
        const mesh = entity.get(Geometry)!;
        sourceContext.clearRect(0, 0, 1000, 1250);
        projectGeometry(view, mesh, study, elapsed, 1250);
        drawGeometry(sourceContext, view, mesh, study.index);

        const imprint = canvas(1000, 240);
        const ctx = imprint.getContext('2d')!;
        // Each exposure retains real construction strokes inside the letter shapes.
        for (let offset = -3; offset <= 3; offset++) {
          ctx.drawImage(source, 60, 150, 880, 800, 60, offset * 2, 880, 240);
        }
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = palette.light;
        ctx.fillRect(0, 0, 1000, 240);
        ctx.globalCompositeOperation = 'destination-in';
        const y = tops[k], band = heights[k];
        ctx.beginPath();
        ctx.moveTo(0, y - 10); ctx.lineTo(1000, y + 10);
        ctx.lineTo(1000, y + 10 + band); ctx.lineTo(0, y - 10 + band); ctx.closePath();
        ctx.fill();
        // Each band keeps a slice of the outline, slipped sideways so the outline reads as glitched.
        ctx.drawImage(reveal.mask, Math.round((mulberry32.sample(slips) - 0.5) * outlineSlip), 0);
        ctx.globalCompositeOperation = 'destination-over';
        if (reveal.imprints.length) ctx.drawImage(reveal.imprints[reveal.imprints.length - 1], 0, 0);
        reveal.imprints.push(imprint);
      }
    }
    reveal.source = source;
    world.set(Reveal, reveal);
  } finally {
    world.set(Time, savedTime);
    sequenceFilm(world);
    updateForms(world);
  }
}
