import { bench, group } from '@pmndrs/labs';
import * as spring from '../../src/time/spring';
import * as spring3 from '../../src/time/spring3';

group('spring 1k @time', () => {
    bench('critical damping, varying delta', function* () {
        const state = spring.create(0.5);
        let phase = 0;
        const value = yield () => {
            phase = (phase + 1) % 1000;
            for (let i = 0; i < 1000; i++) {
                spring.update(state, (i + phase) % 13, 0.15 + (i % 11) * 0.01, 1, 1 / 60 + (i % 7) * 0.0001);
            }
            return state.value;
        };
        return value;
    });
});

group('spring3 1k @time', () => {
    bench('critical damping, varying delta', function* () {
        const state = spring3.create([0.5, 1.5, 2.5]);
        const target: [number, number, number] = [0.5, 1.5, 2.5];
        let phase = 0;
        const value = yield () => {
            phase = (phase + 1) % 1000;
            for (let i = 0; i < 1000; i++) {
                target[0] = (i + phase) % 13;
                target[1] = (i + phase + 1) % 13;
                target[2] = (i + phase + 2) % 13;
                spring3.update(state, target, 0.15 + (i % 11) * 0.01, 1, 1 / 60 + (i % 7) * 0.0001);
            }
            return state.value[0];
        };
        return value;
    });
    bench('over damping, varying delta', function* () {
        const state = spring3.create([0.5, 1.5, 2.5]);
        const target: [number, number, number] = [0.5, 1.5, 2.5];
        let phase = 0;
        const value = yield () => {
            phase = (phase + 1) % 1000;
            for (let i = 0; i < 1000; i++) {
                target[0] = (i + phase) % 13;
                target[1] = (i + phase + 1) % 13;
                target[2] = (i + phase + 2) % 13;
                spring3.update(state, target, 0.15 + (i % 11) * 0.01, 1.5, 1 / 60 + (i % 7) * 0.0001);
            }
            return state.value[0];
        };
        return value;
    });
});
