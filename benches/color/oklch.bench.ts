import { bench, group } from '@pmndrs/labs';
import type { Color } from '../../src/color/color';
import { clamp } from '../../src/color/color';
import * as oklch from '../../src/color/oklch';
import type { Oklch } from '../../src/color/oklch';
import * as mulberry32 from '../../src/random/mulberry32';

const N = 10_000;

function makeOklch(seed: number, maxChroma: number): Oklch[] {
    const rand = mulberry32.create(seed);
    const out: Oklch[] = [];
    for (let i = 0; i < N; i++) {
        out.push([0.05 + mulberry32.sample(rand) * 0.9, mulberry32.sample(rand) * maxChroma, mulberry32.sample(rand) * 360]);
    }
    return out;
}

group('oklch 10k @color', () => {
    bench('fromColor', function* () {
        const colors = makeOklch(1, 0.1).map((c) => oklch.toColor([0, 0, 0], c));
        const out = oklch.create();
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += oklch.fromColor(out, colors[i])[1];
            return sum;
        };
        return sum;
    });

    bench('toColor', function* () {
        const values = makeOklch(1, 0.1);
        const out: Color = [0, 0, 0];
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += oklch.toColor(out, values[i])[0];
            return sum;
        };
        return sum;
    });

    bench('toColor + clamp, mostly out of gamut', function* () {
        const values = makeOklch(2, 0.4);
        const out: Color = [0, 0, 0];
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += clamp(out, oklch.toColor(out, values[i]))[0];
            return sum;
        };
        return sum;
    });

    bench('toColorInGamut, mostly out of gamut', function* () {
        const values = makeOklch(2, 0.4);
        const out: Color = [0, 0, 0];
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += oklch.toColorInGamut(out, values[i])[0];
            return sum;
        };
        return sum;
    });
});
