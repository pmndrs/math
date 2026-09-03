import { assert, bench, group } from '@pmndrs/labs';
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
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                acc += polygon2.area(poly, SIDES);
            }
            return acc;
        };
        // the polygon is a regular 12-gon of circumradius 5
        const expected = 0.5 * SIDES * 25 * Math.sin((2 * Math.PI) / SIDES);
        assert(Math.abs(acc / N - expected) < 1e-9, 'area of a regular polygon');
        return acc;
    });

    bench('containsPoint', function* () {
        const points = makePoints(1);
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                if (polygon2.containsPoint(poly, SIDES, points[i])) acc++;
            }
            return acc;
        };
        return acc;
    });

    bench('centroid', function* () {
        const out: Vec2 = [0, 0];
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                polygon2.centroid(out, poly, SIDES);
                acc += out[0];
            }
            return acc;
        };
        // a regular polygon about the origin has its centroid at the origin
        assert(Math.abs(out[0]) < 1e-9 && Math.abs(out[1]) < 1e-9, 'centroid must be at the origin');
        return [acc, ...out];
    });

    bench('perimeter', function* () {
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                acc += polygon2.perimeter(poly, SIDES);
            }
            return acc;
        };
        const expected = SIDES * 2 * 5 * Math.sin(Math.PI / SIDES);
        assert(Math.abs(acc / N - expected) < 1e-9, 'perimeter of a regular polygon');
        return acc;
    });

    bench('isConvex', function* () {
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                if (polygon2.isConvex(poly, SIDES)) acc++;
            }
            return acc;
        };
        assert(acc === N, 'a regular polygon is convex');
        return acc;
    });

    bench('bounds', function* () {
        const out: [number, number, number, number] = [0, 0, 0, 0];
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                polygon2.bounds(out, poly, SIDES);
                acc += out[0];
            }
            return acc;
        };
        assert(Math.abs(out[0] + 5) < 1e-9 && Math.abs(out[2] - 5) < 1e-9, 'bounds must span the circumradius');
        return [acc, ...out];
    });

    bench('closestPoint', function* () {
        const points = makePoints(1);
        const out: Vec2 = [0, 0];
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                polygon2.closestPoint(out, poly, SIDES, points[i]);
                acc += out[0];
            }
            return acc;
        };
        return [acc, ...out];
    });

    bench('signedDistance', function* () {
        const points = makePoints(1);
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                acc += polygon2.signedDistance(poly, SIDES, points[i]);
            }
            return acc;
        };
        return acc;
    });

    bench('overlapConvex', function* () {
        // A second polygon translated so it partially overlaps the first.
        const other = poly.map((v, i) => (i % 2 === 0 ? v + 4 : v));
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                if (polygon2.overlapConvex(poly, SIDES, other, SIDES)) acc++;
            }
            return acc;
        };
        assert(acc === N, 'the translated polygon overlaps on every query');
        return acc;
    });

    bench('intersectsSegment', function* () {
        const points = makePoints(1);
        const points2 = makePoints(2);
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                if (polygon2.intersectsSegment(poly, SIDES, points[i], points2[i])) acc++;
            }
            return acc;
        };
        return acc;
    });
});
