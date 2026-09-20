import { trait } from 'koota';

/** `index` is the study on screen this frame: the cut's own on the first pulse, a recalled one after. */
export const Sequence = trait({ index: 0, cut: 0, local: 0, duration: 0, exposure: 0, pulse: 0, pulseLocal: 0, open: true, reveal: false });

/** `exposure` is how long each pulse of the live study stays visible; pulses repeat through the cut with dark between. */
export type Cut = { at: number; form: number; exposure: number };

export const Edit = trait(() => ({ cuts: [] as Cut[] }));
