import { bench, group } from '@pmndrs/labs';
import * as quat2 from '../../src/core/quat2';

group('quat2 rotation 10k @core', () => {
    for (const [name, rotate] of [
        ['rotateX', quat2.rotateX],
        ['rotateY', quat2.rotateY],
        ['rotateZ', quat2.rotateZ],
    ] as const) {
        for (const varying of [false, true]) {
            bench(`${name} (${varying ? 'varying' : 'fixed'} angle)`, function* () {
                const a = quat2.fromRotationTranslation(quat2.create(), [0.2, 0.4, 0.4, 0.8], [1, 2, 3]);
                const out = quat2.create();
                const sum = yield () => {
                    let sum = 0;
                    for (let i = 0; i < 10_000; i++) {
                        rotate(out, a, varying ? i * 0.001 : 0.35);
                        sum += out[0];
                    }
                    return sum;
                };
                return sum;
            });
        }
    }
    for (const varying of [false, true]) {
        bench(`rotateAroundAxis (${varying ? 'varying' : 'fixed'} angle)`, function* () {
            const a = quat2.fromRotationTranslation(quat2.create(), [0.2, 0.4, 0.4, 0.8], [1, 2, 3]);
            const axis: [number, number, number] = [1, 2, 3];
            const out = quat2.create();
            const sum = yield () => {
                let sum = 0;
                for (let i = 0; i < 10_000; i++) {
                    quat2.rotateAroundAxis(out, a, axis, varying ? i * 0.001 : 0.35);
                    sum += out[0];
                }
                return sum;
            };
            return sum;
        });
    }
});
