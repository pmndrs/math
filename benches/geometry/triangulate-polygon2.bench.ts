import { assert, bench, group } from '@pmndrs/labs';
import { triangulatePolygon2 } from '../../src/geometry';

group('polygon2 triangulation @geometry @polygon2', () => {
    // A concave comb shape with several reflex vertices.
    const comb = [0, 0, 6, 0, 6, 3, 5, 3, 5, 1, 4, 1, 4, 3, 3, 3, 3, 1, 2, 1, 2, 3, 1, 3, 1, 1, 0, 1];
    const combN = comb.length / 2;

    // A convex n-gon.
    const convex: number[] = [];
    const CONVEX_N = 32;
    for (let i = 0; i < CONVEX_N; i++) {
        const a = (i / CONVEX_N) * Math.PI * 2;
        convex.push(Math.cos(a) * 5, Math.sin(a) * 5);
    }

    for (const [label, vertices, n] of [
        ['14-gon, concave', comb, combN],
        ['32-gon, convex', convex, CONVEX_N],
    ] as const) {
        for (const reuseScratch of [false, true]) {
            bench(`triangulatePolygon2 (${label}${reuseScratch ? ', reused scratch' : ''})`, function* () {
                const out: number[] = [];
                const scratch = reuseScratch ? new Array<number>(n).fill(0) : undefined;
                // Short batches let the workload reach its optimized tier during warmup.
                const acc = yield () => {
                    let acc = 0;
                    for (let i = 0; i < 100; i++) acc += triangulatePolygon2(out, vertices, n, scratch);
                    return acc;
                };
                assert(acc === 100 * (n - 2), 'triangle count must be n - 2 on every call');
                return [acc, ...out];
            });
        }
    }
});
