import type { World } from 'koota';
import { Time } from './traits';

export function advanceTime(world: World, delta: number) {
  const time = world.get(Time)!;
  if (time.playing) {
    const elapsed = Math.min(time.elapsed + delta, time.duration);
    world.set(Time, { elapsed, playing: elapsed < time.duration });
  }
}
