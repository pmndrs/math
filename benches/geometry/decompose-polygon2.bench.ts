import { bench, group } from '@pmndrs/labs';
import { decomposePolygon2Quality, decomposePolygon2Quick } from '../../src/geometry';

group('polygon2 decomposition @geometry @polygon2', () => {
    // A concave comb shape with several reflex vertices.
    const comb = [0, 0, 6, 0, 6, 3, 5, 3, 5, 1, 4, 1, 4, 3, 3, 3, 3, 1, 2, 1, 2, 3, 1, 3, 1, 1, 0, 1];
    const combN = comb.length / 2;

    // Decomposition allocates and is heavier than the per-frame ops, so use a
    // smaller repeat count than the 10k primitive benches.
    const DECOMP_N = 1_000;

    bench('decomposePolygon2Quick (14-gon)', function* () {
        let acc = 0;
        yield () => {
            for (let i = 0; i < DECOMP_N; i++) {
                acc += decomposePolygon2Quick(comb, combN).length;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('decomposePolygon2Quality (14-gon)', function* () {
        let acc = 0;
        yield () => {
            for (let i = 0; i < DECOMP_N; i++) {
                acc += decomposePolygon2Quality(comb, combN).length;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });
});
