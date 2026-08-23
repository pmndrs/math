import { bench, group } from '@pmndrs/labs';
import type { Vec2 } from '../../src/core/vec2';
import * as mulberry32 from '../../src/random/mulberry32';
import * as polygon2 from '../../src/shapes/polygon2';

const N = 10_000;

// A fixed convex n-gon reused across iterations, laid out as [x0,y0,x1,y1,...].
function makePolygon(sides: number): number[] {
    const verts: number[] = [];
    for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        verts.push(Math.cos(a) * 5, Math.sin(a) * 5);
    }
    return verts;
}

function makePoints(seed: number): Vec2[] {
    const rand = mulberry32.create(seed);
    const out: Vec2[] = [];
    for (let i = 0; i < N; i++) {
        out.push([(mulberry32.sample(rand) - 0.5) * 12, (mulberry32.sample(rand) - 0.5) * 12]);
    }
    return out;
}

group('polygon2 ops 10k @shapes @polygon2', () => {
    const SIDES = 12;
    const poly = makePolygon(SIDES);

    bench('area', function* () {
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                acc += polygon2.area(poly, SIDES);
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('containsPoint', function* () {
        const points = makePoints(1);
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                if (polygon2.containsPoint(poly, SIDES, points[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('centroid', function* () {
        const out: Vec2 = [0, 0];
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                polygon2.centroid(out, poly, SIDES);
                acc += out[0];
            }
        };
        if (acc === Number.POSITIVE_INFINITY) throw new Error('unreachable');
    });

    bench('perimeter', function* () {
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                acc += polygon2.perimeter(poly, SIDES);
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('isConvex', function* () {
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                if (polygon2.isConvex(poly, SIDES)) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('bounds', function* () {
        const out: [number, number, number, number] = [0, 0, 0, 0];
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                polygon2.bounds(out, poly, SIDES);
                acc += out[0];
            }
        };
        if (acc === Number.POSITIVE_INFINITY) throw new Error('unreachable');
    });

    bench('closestPoint', function* () {
        const points = makePoints(1);
        const out: Vec2 = [0, 0];
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                polygon2.closestPoint(out, poly, SIDES, points[i]);
                acc += out[0];
            }
        };
        if (acc === Number.POSITIVE_INFINITY) throw new Error('unreachable');
    });

    bench('signedDistance', function* () {
        const points = makePoints(1);
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                acc += polygon2.signedDistance(poly, SIDES, points[i]);
            }
        };
        if (acc === Number.POSITIVE_INFINITY) throw new Error('unreachable');
    });

    bench('overlapConvex', function* () {
        // A second polygon translated so it partially overlaps the first.
        const other = poly.map((v, i) => (i % 2 === 0 ? v + 4 : v));
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                if (polygon2.overlapConvex(poly, SIDES, other, SIDES)) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });

    bench('intersectsSegment', function* () {
        const points = makePoints(1);
        const points2 = makePoints(2);
        let acc = 0;
        yield () => {
            for (let i = 0; i < N; i++) {
                if (polygon2.intersectsSegment(poly, SIDES, points[i], points2[i])) acc++;
            }
        };
        if (acc < 0) throw new Error('unreachable');
    });
});
