import type { World } from 'koota';
import { updateForms } from './forms/systems';
import { sequenceFilm } from './sequence/systems';
import { advanceTime } from './time/systems';
import { renderFilm } from './view/systems';

export function frame(world: World, delta: number) {
  advanceTime(world, delta);
  sequenceFilm(world);
  updateForms(world);
  renderFilm(world);
}
