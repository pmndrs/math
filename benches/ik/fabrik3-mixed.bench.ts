import { bench, group } from '@pmndrs/labs';
import type { Vec3 } from '../../src/core/vec3';
import * as fabrik3 from '../../src/ik/fabrik3';

group('fabrik3 mixed constraints @ik', () => {
    const chain = fabrik3.createChain3();
    fabrik3.addBone(chain, [0, 0, 0], [0, 1, 0]);
    for (let i = 1; i < 10; i++) {
        const joint = fabrik3.createJoint3();
        if (i % 3 === 0) fabrik3.setBallJoint(joint, 0.6);
        else
            fabrik3.setHingeJoint(
                joint,
                i % 3 === 1 ? fabrik3.JointType.GLOBAL_HINGE : fabrik3.JointType.LOCAL_HINGE,
                [1, 0, 0],
                0.2 + i * 0.08,
                0.3 + i * 0.06,
                [0, 0, 1],
            );
        fabrik3.addConsecutiveBone(chain, [0, 1, 0], 1, joint);
    }
    const target: Vec3 = [0, 0, 0];
    let step = 0;
    bench('solve, 10 bones, mixed ball and hinges', () => {
        step = (step + 1) % 100000;
        const phase = step * 0.05;
        target[0] = Math.cos(phase) * 6;
        target[1] = Math.sin(phase * 0.7) * 6;
        target[2] = Math.sin(phase) * 3;
        fabrik3.solve(chain, target);
    });
});
