import { bench, group } from '@pmndrs/labs';
import { deltaAngle, degreesToRadians, radiansToDegrees, wrapAngle } from '../../src/core/angle';
import * as mulberry32 from '../../src/random/mulberry32';

const N = 10_000;

function makeAngles(seed: number): number[] {
    const rand = mulberry32.create(seed);
    const out: number[] = [];
    for (let i = 0; i < N; i++) {
        out.push(mulberry32.sample(rand) * 100 - 50);
    }
    return out;
}

group('angle ops 10k @core @angle', () => {
    bench('wrapAngle', function* () {
        const angles = makeAngles(1);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += wrapAngle(angles[i]);
            return sum;
        };
        return sum;
    });

    bench('deltaAngle', function* () {
        const a = makeAngles(1);
        const b = makeAngles(2);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += deltaAngle(a[i], b[i]);
            return sum;
        };
        return sum;
    });

    bench('degreesToRadians', function* () {
        const degrees = makeAngles(1);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += degreesToRadians(degrees[i]);
            return sum;
        };
        return sum;
    });

    bench('radiansToDegrees', function* () {
        const radians = makeAngles(1);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < N; i++) sum += radiansToDegrees(radians[i]);
            return sum;
        };
        return sum;
    });
});
