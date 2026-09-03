import { assert, bench, group } from '@pmndrs/labs';
import { decomposePolygon2Quality, decomposePolygon2Quick } from '../../src/geometry';

// A star/gear polygon with `spikes` points: alternating outer/inner radii make
// every inner vertex reflex, so it stresses the decomposition and scales cleanly.
function makeGear(spikes: number): number[] {
    const v: number[] = [];
    const n = spikes * 2;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = i % 2 === 0 ? 5 : 2.5;
        v.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    return v;
}

group('polygon2 quick decomposition @geometry @polygon2', () => {
    const gears = [
        { label: '12-gon', verts: makeGear(6), n: 12 },
        { label: '24-gon', verts: makeGear(12), n: 24 },
        { label: '48-gon', verts: makeGear(24), n: 48 },
    ];
    const N = 2_000;

    for (const g of gears) {
        bench(`decomposePolygon2Quick (${g.label})`, function* () {
            const acc = yield () => {
                let acc = 0;
                for (let i = 0; i < N; i++) {
                    acc += decomposePolygon2Quick(g.verts, g.n).length;
                }
                return acc;
            };
            const pieces = decomposePolygon2Quick(g.verts, g.n);
            assert(pieces.length > 1, 'a gear must decompose into several convex pieces');
            assert(acc === N * pieces.length, 'piece count must be identical on every call');
            return [acc, ...pieces];
        });
    }
});

group('polygon2 quality decomposition @geometry @polygon2', () => {
    // Quality is ~O(n^4) and grows explosively with reflex count, so keep the
    // polygons small.
    const gears = [
        { label: '6-gon', verts: makeGear(3), n: 6 },
        { label: '8-gon', verts: makeGear(4), n: 8 },
    ];
    const N = 500;

    for (const g of gears) {
        bench(`decomposePolygon2Quality (${g.label})`, function* () {
            const acc = yield () => {
                let acc = 0;
                for (let i = 0; i < N; i++) {
                    acc += decomposePolygon2Quality(g.verts, g.n).length;
                }
                return acc;
            };
            const pieces = decomposePolygon2Quality(g.verts, g.n);
            assert(pieces.length > 1, 'a gear must decompose into several convex pieces');
            assert(acc === N * pieces.length, 'piece count must be identical on every call');
            return [acc, ...pieces];
        });
    }
});
