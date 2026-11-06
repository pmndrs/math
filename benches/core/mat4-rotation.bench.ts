import { bench, group } from '@pmndrs/labs';
import * as mat4 from '../../src/core/mat4';

group('mat4 rotation 10k @core', () => {
    for (const varying of [false, true]) {
        bench(`rotate (${varying ? 'varying' : 'fixed'} angle)`, function* () {
            const a = mat4.fromRotationTranslation(mat4.create(), [0.2, 0.4, 0.4, 0.8], [1, 2, 3]);
            const axis: [number, number, number] = [1, 2, 3];
            const out = mat4.create();
            const sum = yield () => {
                let sum = 0;
                for (let i = 0; i < 10_000; i++) {
                    mat4.rotate(out, a, varying ? i * 0.001 : 0.35, axis);
                    sum += out[0];
                }
                return sum;
            };
            return sum;
        });
    }
    bench('fromRotation (varying angle)', function* () {
        const axis: [number, number, number] = [1, 2, 3];
        const out = mat4.create();
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < 10_000; i++) {
                mat4.fromRotation(out, i * 0.001, axis);
                sum += out[0];
            }
            return sum;
        };
        return sum;
    });
});
