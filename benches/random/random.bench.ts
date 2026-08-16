import { bench, group } from '@pmndrs/labs';
import * as isaac32 from '../../src/random/isaac32';
import * as isaac64 from '../../src/random/isaac64';
import * as mulberry32 from '../../src/random/mulberry32';

const N = 10_000;

// Draw N floats in [0, 1) from each generator — the common `sample` interface,
// shown side by side so the relative cost of each PRNG is directly comparable.
group('random sample 10k @random', () => {
    bench('mulberry32', function* () {
        const state = mulberry32.create(1);
        yield () => {
            let sink = 0;
            for (let i = 0; i < N; i++) sink += mulberry32.sample(state);
            return sink;
        };
    });

    bench('isaac32', function* () {
        const state = isaac32.create(1);
        yield () => {
            let sink = 0;
            for (let i = 0; i < N; i++) sink += isaac32.sample(state);
            return sink;
        };
    });

    bench('isaac64', function* () {
        const state = isaac64.create(1n);
        yield () => {
            let sink = 0;
            for (let i = 0; i < N; i++) sink += isaac64.sample(state);
            return sink;
        };
    });
});

// Draw N raw integer words — isolates the ISAAC64 bigint tax from the
// bigint→double conversion that `sample` adds on top.
group('random next 10k @random', () => {
    bench('mulberry32', function* () {
        const state = mulberry32.create(1);
        yield () => {
            let sink = 0;
            for (let i = 0; i < N; i++) sink += mulberry32.next(state);
            return sink;
        };
    });

    bench('isaac32', function* () {
        const state = isaac32.create(1);
        yield () => {
            let sink = 0;
            for (let i = 0; i < N; i++) sink += isaac32.next(state);
            return sink;
        };
    });

    bench('isaac64', function* () {
        const state = isaac64.create(1n);
        yield () => {
            let sink = 0n;
            for (let i = 0; i < N; i++) sink += isaac64.next(state);
            return sink;
        };
    });
});

// Seeding cost: mulberry32 is a trivial struct, whereas ISAAC runs a full
// 256-word init on every create. Fewer iterations here — a single ISAAC64
// create is ~1000x a mulberry32 one, so 10k would blow the sampling budget.
const CREATE_N = 1_000;

group('random create 1k @random', () => {
    bench('mulberry32', function* () {
        yield () => {
            let sink = 0;
            for (let i = 0; i < CREATE_N; i++) sink += mulberry32.create(i).a;
            return sink;
        };
    });

    bench('isaac32', function* () {
        yield () => {
            let sink = 0;
            for (let i = 0; i < CREATE_N; i++) sink += isaac32.create(i).m[0];
            return sink;
        };
    });

    bench('isaac64', function* () {
        yield () => {
            let sink = 0;
            for (let i = 0; i < CREATE_N; i++) sink += isaac64.create(BigInt(i)).mLo[0];
            return sink;
        };
    });
});
