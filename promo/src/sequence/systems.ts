import type { World } from 'koota';
import { Time } from '../time/traits';
import { strobeGap, strobeStride } from './cuts';
import { Edit, Sequence } from './traits';

export function sequenceFilm(world: World) {
  const { elapsed, duration } = world.get(Time)!;
  const { cuts } = world.get(Edit)!;
  let cut = 0;
  while (cut + 1 < cuts.length && elapsed >= cuts[cut + 1].at) cut++;
  const local = elapsed - cuts[cut].at;
  const exposure = cuts[cut].exposure;
  // A cut strobes in pulses: on for one exposure, off for the gap. The first pulse shows the cut's
  // own study; each later pulse recalls another screen from the edit, striding through the film.
  const period = exposure * (1 + strobeGap);
  const pulse = period > 0 && Number.isFinite(period) ? Math.max(0, Math.floor(local / period)) : 0;
  const pulseLocal = local - pulse * period;
  const screens = cuts.length - 1;
  const form = cuts[cut].form;
  const recalled = (((cut + pulse * strobeStride) % screens) + screens) % screens;
  world.set(Sequence, {
    index: form < 0 || pulse === 0 ? form : cuts[recalled].form,
    cut, local, pulse, pulseLocal,
    open: pulseLocal < exposure,
    duration: (cuts[cut + 1]?.at ?? duration) - cuts[cut].at,
    exposure,
    reveal: form === -1,
  });
}
