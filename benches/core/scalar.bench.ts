import { bench, group } from '@pmndrs/labs';
import * as mulberry32 from '../../src/random/mulberry32';
import { repeat, round, wrap } from '../../src/core/scalar';

const N = 10_000;

function makeValues(seed: number, spread: number): number[] {
    const rand = mulberry32.create(seed);
    const out: number[] = [];
    for (let i = 0; i < N; i++) {
        out.push((mulberry32.sample(rand) * 2 - 1) * spread);
    }
    return out;
}

group('scalar wrap 10k @core @scalar', () => {
    bench('wrap inside the range', function* () {
        const values = makeValues(1, Math.PI);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += wrap(values[i], -Math.PI, Math.PI);
            return sum;
        };
        return sum;
    });

    bench('wrap a few periods out', function* () {
        const values = makeValues(1, 3 * 2 * Math.PI);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += wrap(values[i], -Math.PI, Math.PI);
            return sum;
        };
        return sum;
    });

    bench('wrap far out', function* () {
        const values = makeValues(1, 1e6);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += wrap(values[i], -Math.PI, Math.PI);
            return sum;
        };
        return sum;
    });

    bench('repeat inside the range', function* () {
        const values = makeValues(1, Math.PI);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += repeat(values[i], 2 * Math.PI);
            return sum;
        };
        return sum;
    });

    bench('repeat far out', function* () {
        const values = makeValues(1, 1e6);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += repeat(values[i], 2 * Math.PI);
            return sum;
        };
        return sum;
    });
});

group('scalar round 10k @core @scalar', () => {
    bench('round', function* () {
        const values = makeValues(1, 1000);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += round(values[i]);
            return sum;
        };
        return sum;
    });
});
