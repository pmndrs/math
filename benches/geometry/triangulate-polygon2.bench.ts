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

    const N = 5_000;

    bench('triangulatePolygon2 (14-gon, concave)', function* () {
        const out: number[] = [];
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                acc += triangulatePolygon2(out, comb, combN);
            }
            return acc;
        };
        // a simple polygon with n vertices always yields n - 2 triangles
        assert(acc === N * (combN - 2), 'triangle count must be n - 2 on every call');
        return [acc, ...out];
    });

    bench('triangulatePolygon2 (32-gon, convex)', function* () {
        const out: number[] = [];
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                acc += triangulatePolygon2(out, convex, CONVEX_N);
            }
            return acc;
        };
        assert(acc === N * (CONVEX_N - 2), 'triangle count must be n - 2 on every call');
        return [acc, ...out];
    });
});
