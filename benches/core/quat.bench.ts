import { bench, group } from '@pmndrs/labs';
import * as quat from '../../src/core/quat';
import type { Quat } from '../../src/core/quat';
import * as mulberry32 from '../../src/random/mulberry32';

const N = 10_000;

function makeQuats(seed: number): Quat[] {
  const rand = mulberry32.create(seed);
  const quats: Quat[] = [];
  for (let i = 0; i < N; i++) {
    const q = quat.create();
    quat.setAxisAngle(q, [0.267261, 0.534522, 0.801784], mulberry32.sample(rand) * Math.PI * 2);
    quats.push(q);
  }
  return quats;
}

group('quat ops 10k @core @quat', () => {
  bench('multiply', function* () {
    const a = makeQuats(1);
    const b = makeQuats(2);
    const out = quat.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat.multiply(out, a[i], b[i]);
      }
    };
  }).gc('inner');

  bench('slerp', function* () {
    const a = makeQuats(1);
    const b = makeQuats(2);
    const out = quat.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat.slerp(out, a[i], b[i], 0.5);
      }
    };
  }).gc('inner');

  bench('setAxisAngle', function* () {
    const axis: [number, number, number] = [0.267261, 0.534522, 0.801784];
    const out = quat.create();

    yield () => {
      for (let i = 0; i < N; i++) {
        quat.setAxisAngle(out, axis, i * 0.001);
      }
    };
  }).gc('inner');
});
