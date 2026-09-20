import { createWorld } from 'koota';
import { spawnStudies } from './forms/actions';
import { initializeForms } from './forms/setup';
import { FormWorkspace } from './forms/traits';
import { Reveal } from './reveal/traits';
import { createCuts, filmDuration } from './sequence/cuts';
import { Edit, Sequence } from './sequence/traits';
import { Time } from './time/traits';
import { View } from './view/traits';

export function createPromoWorld() {
  const cuts = createCuts();
  const world = createWorld(Time({ duration: filmDuration(cuts) }), Edit({ cuts }), Sequence, View, Reveal, FormWorkspace);
  initializeForms(world);
  spawnStudies(world, cuts);
  return world;
}
