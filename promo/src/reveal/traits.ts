import { trait } from 'koota';

export const Reveal = trait(() => ({
  mask: null as HTMLCanvasElement | null,
  source: null as HTMLCanvasElement | null,
  imprints: [] as HTMLCanvasElement[],
  firstCut: 0, lastCut: 0, start: 0, end: 0,
  /** Index of each shutter cut's first imprint; one imprint per pulse. */
  offsets: [] as number[],
}));
