import { bench, group } from '@pmndrs/labs';
import * as easing from '../../src/time/easing';

group('polynomial easing 10k @time', () => {
    for (const [name, ease] of [
        ['cubicOut', easing.cubicOut],
        ['cubicInOut', easing.cubicInOut],
        ['quintIn', easing.quintIn],
        ['quintOut', easing.quintOut],
        ['quintInOut', easing.quintInOut],
    ] as const) {
        bench(name, function* () {
            const sum = yield () => {
                let sum = 0;
                for (let i = 0; i < 10_000; i++) sum += ease(i / 10_000);
                return sum;
            };
            return sum;
        });
    }
});
