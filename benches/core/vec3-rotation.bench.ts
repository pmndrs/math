import { bench, group } from '@pmndrs/labs';
import * as vec3 from '../../src/core/vec3';

group('vec3 rotation 10k @core', () => {
    bench('signedAngle', function* () {
        const from: vec3.Vec3 = [1, 0.2, 0.5];
        const axis: vec3.Vec3 = [0, 0, 1];
        const targets: vec3.Vec3[] = [];
        for (let i = 0; i < 1000; i++) targets.push([Math.cos(i * 0.01), Math.sin(i * 0.01), 0.7]);
        const sum = yield () => {
            let sum = 0;
            for (let i = 0; i < 10_000; i++) sum += vec3.signedAngle(from, targets[i % 1000], axis);
            return sum;
        };
        return sum;
    });

    for (const varyingLimit of [false, true]) {
        bench(`rotateTowards (${varyingLimit ? 'varying' : 'fixed'} limit)`, function* () {
            const from: vec3.Vec3 = [1, 0, 0];
            const out = vec3.create();
            const targets: vec3.Vec3[] = [];
            for (let i = 0; i < 1000; i++) {
                const angle = i * 0.01;
                targets.push([Math.cos(angle), Math.sin(angle), 0]);
            }
            const sum = yield () => {
                let sum = 0;
                for (let i = 0; i < 10_000; i++) {
                    vec3.rotateTowards(out, from, targets[i % 1000], varyingLimit ? 0.1 + i * 0.00001 : 0.35);
                    sum += out[0];
                }
                return sum;
            };
            return sum;
        });
    }
});
