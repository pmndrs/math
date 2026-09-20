import { trait } from 'koota';
import type { Field } from './field';

export const Reveal = trait(() => ({
  /** The type's signed distance field as contour segments, 1000 × 400 with the type centred. */
  field: null as Field | null,
  firstCut: 0, lastCut: 0, start: 0, end: 0,
  /** When each pulse of the shutter section opens; each releases a batch of particles. */
  pulseTimes: [] as number[],
}));
