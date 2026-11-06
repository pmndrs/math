import { assert, bench, group } from '@pmndrs/labs';
import type { Mat4 } from '../../src/core/mat4';
import * as mat4 from '../../src/core/mat4';

group('mat4 multiply 1k @core', () => {
    for (const kind of ['dense', 'affine', 'in-place left', 'in-place right']) {
        bench(kind, function* () {
            let seed = 4713;
            const random = () => {
                seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
                return (seed / 4294967296) * 2 - 1;
            };
            const a: Mat4[] = [],
                b: Mat4[] = [],
                out: Mat4[] = [];
            let expected = 0;
            for (let i = 0; i < 1000; i++) {
                const x = Array.from({ length: 16 }, random) as Mat4;
                const y = Array.from({ length: 16 }, random) as Mat4;
                if (kind === 'affine')
                    for (const m of [x, y]) {
                        m[3] = m[7] = m[11] = 0;
                        m[15] = 1;
                    }
                a.push(x);
                b.push(y);
                out.push(kind === 'in-place left' ? x : kind === 'in-place right' ? y : mat4.create());
                expected += y[0] * x[0] + y[1] * x[4] + y[2] * x[8] + y[3] * x[12];
            }
            const initialA = a.map(mat4.clone),
                initialB = b.map(mat4.clone);
            const value = yield {
                bench: () => {
                    let sum = 0;
                    for (let i = 0; i < 1000; i++) {
                        mat4.multiply(out[i], a[i], b[i]);
                        sum += out[i][0];
                    }
                    return sum;
                },
                after: () => {
                    if (kind === 'in-place left') for (let i = 0; i < 1000; i++) mat4.copy(a[i], initialA[i]);
                    if (kind === 'in-place right') for (let i = 0; i < 1000; i++) mat4.copy(b[i], initialB[i]);
                },
            };
            assert(value === expected, 'matrix product checksum');
            return value;
        });
    }
});
