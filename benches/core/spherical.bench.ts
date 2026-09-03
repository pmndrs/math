import { bench, group } from '@pmndrs/labs';
import * as spherical from '../../src/core/spherical';
import type { Spherical } from '../../src/core/spherical';
import type { Vec3 } from '../../src/core/vec3';
import type { Vec2 } from '../../src/core/vec2';
import * as mulberry32 from '../../src/random/mulberry32';

const N = 10_000;

function makeSphericals(seed: number): Spherical[] {
    const rand = mulberry32.create(seed);
    const out: Spherical[] = [];
    for (let i = 0; i < N; i++) {
        out.push([
            mulberry32.sample(rand) * 10 + 0.1, // r
            mulberry32.sample(rand) * 2 * Math.PI - Math.PI, // theta [-π, π]
            mulberry32.sample(rand) * Math.PI, // phi [0, π]
        ]);
    }
    return out;
}

function makeVec3s(seed: number): Vec3[] {
    const rand = mulberry32.create(seed);
    const out: Vec3[] = [];
    for (let i = 0; i < N; i++) {
        out.push([mulberry32.sample(rand) * 20 - 10, mulberry32.sample(rand) * 20 - 10, mulberry32.sample(rand) * 20 - 10]);
    }
    return out;
}

group('spherical ops 10k @core @spherical', () => {
    bench('setFromVec3', function* () {
        const v = makeVec3s(1);
        const out = spherical.create();
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                spherical.setFromVec3(out, v[i]);
                acc += out[0];
            }
            return acc;
        };
        return [acc, ...out];
    });

    bench('toVec3', function* () {
        const s = makeSphericals(1);
        const out: Vec3 = [0, 0, 0];
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                spherical.toVec3(out, s[i]);
                acc += out[0];
            }
            return acc;
        };
        return [acc, ...out];
    });

    bench('toVec2', function* () {
        const s = makeSphericals(1);
        const out: Vec2 = [0, 0];
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                spherical.toVec2(out, s[i]);
                acc += out[0];
            }
            return acc;
        };
        return [acc, ...out];
    });

    bench('fromVec2', function* () {
        const rand = mulberry32.create(2);
        const v: Vec2[] = [];
        for (let i = 0; i < N; i++) v.push([mulberry32.sample(rand) * 20 - 10, mulberry32.sample(rand) * 20 - 10]);
        const out = spherical.create();
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                spherical.fromVec2(out, v[i]);
                acc += out[0];
            }
            return acc;
        };
        return [acc, ...out];
    });

    bench('lerp', function* () {
        const a = makeSphericals(1);
        const b = makeSphericals(2);
        const out = spherical.create();
        const acc = yield () => {
            let acc = 0;
            for (let i = 0; i < N; i++) {
                spherical.lerp(out, a[i], b[i], 0.5);
                acc += out[0];
            }
            return acc;
        };
        return [acc, ...out];
    });

    bench('angleTo', function* () {
        const a = makeSphericals(1);
        const b = makeSphericals(2);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += spherical.angleTo(a[i], b[i]);
            return sum;
        };
        return sum;
    });
});
