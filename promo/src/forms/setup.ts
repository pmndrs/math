import type { World } from 'koota';
import { vec2 } from 'math';
import { quickhull2 } from 'math/geometry';
import { fabrik2, fabrik3 } from 'math/ik';
import { simplex3d } from 'math/noise';
import { mulberry32 } from 'math/random';
import { circle } from 'math/shapes';
import { spring } from 'math/time';
import { FormWorkspace } from './traits';

export function initializeForms(world: World) {
  const work = world.get(FormWorkspace)!;
  work.noise = simplex3d.create(42);
  work.circle = circle.create();
  work.chain = fabrik2.createChain2();
  vec2.set(work.a, 0, 0); vec2.set(work.b, 0.42, 0);
  fabrik2.addBone(work.chain, work.a, work.b);
  vec2.set(work.a, 1, 0);
  for (let i = 0; i < 9; i++) fabrik2.addConsecutiveBone(work.chain, work.a, 0.42);

  // A spine held in a cone at its base, with two arms hanging off it. The arms' base bones turn
  // freely about Y, their other joints are ball joints, and each arm reaches for its own target.
  const structure = fabrik3.createStructure3();
  const spine = fabrik3.createChain3();
  fabrik3.addBone(spine, [0, -2.3, 0], [0, -1.75, 0]);
  for (let i = 1; i < 6; i++) fabrik3.addConsecutiveBone(spine, [0.03, 1, 0], 0.55, fabrik3.setBallJoint(fabrik3.createJoint3(), Math.PI / 4));
  fabrik3.setBaseboneRotorConstraint(spine, fabrik3.BaseboneConstraintType.GLOBAL_ROTOR, [0, 1, 0], Math.PI / 5);
  fabrik3.addChain(structure, spine);
  for (const side of [-1, 1]) {
    const arm = fabrik3.createChain3();
    fabrik3.addBone(arm, [0, 0, 0], [side * 0.5, 0, 0]);
    for (let i = 1; i < 4; i++) fabrik3.addConsecutiveBone(arm, [side, 0, 0], 0.5, fabrik3.setBallJoint(fabrik3.createJoint3(), Math.PI / 3));
    fabrik3.setBaseboneHingeConstraint(arm, fabrik3.BaseboneConstraintType.GLOBAL_HINGE, [0, 1, 0], Math.PI, Math.PI, [side, 0, 0]);
    arm.useEmbeddedTarget = true;
    fabrik3.connectChain(structure, arm, 0, side < 0 ? 3 : 4, fabrik3.BoneConnectionPoint.END);
  }
  work.structure = structure;

  const random = mulberry32.create(76);
  for (let i = 0; i < 60; i++) {
    const angle = mulberry32.sample(random) * Math.PI * 2;
    const radius = Math.sqrt(mulberry32.sample(random)) * 2.4;
    work.cloud[i * 2] = Math.cos(angle) * radius;
    work.cloud[i * 2 + 1] = Math.sin(angle) * radius;
  }
  work.hull = quickhull2(work.cloud);
  for (let i = 0; i < 48; i++) {
    const theta = Math.acos(1 - 2 * mulberry32.sample(random));
    const phi = mulberry32.sample(random) * Math.PI * 2;
    const radius = 1.1 + Math.cbrt(mulberry32.sample(random)) * 1.3;
    work.cloud3[i * 3] = Math.sin(theta) * Math.cos(phi) * radius;
    work.cloud3[i * 3 + 1] = Math.cos(theta) * radius;
    work.cloud3[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * radius;
  }

  // Cache fixed-step motion once so seeking has no simulation history.
  for (let row = 0; row < 3; row++) {
    const state = spring.create(0);
    for (let frame = 0; frame < 360; frame++) {
      spring.update(state, 1, 0.32 + row * 0.055, 0.16 + row * 0.2, 1 / 60);
      work.springs[row * 360 + frame] = state.value;
    }
  }

  const positions = new Float64Array(50);
  const velocities = new Float64Array(50);
  for (let i = 0; i < 25; i++) {
    positions[i * 2] = (i % 5 - 2) * 0.8;
    positions[i * 2 + 1] = (Math.floor(i / 5) - 2) * 0.8;
    const angle = mulberry32.sample(random) * Math.PI * 2;
    velocities[i * 2] = Math.cos(angle) * 1.2;
    velocities[i * 2 + 1] = Math.sin(angle) * 1.2;
  }
  for (let frame = 0; frame < 360; frame++) {
    for (let i = 0; i < 25; i++) {
      for (let axis = 0; axis < 2; axis++) {
        const p = i * 2 + axis;
        positions[p] += velocities[p] / 60;
        if (Math.abs(positions[p]) > 2.15) {
          positions[p] = Math.sign(positions[p]) * 2.15;
          velocities[p] *= -1;
        }
      }
      for (let j = 0; j < i; j++) {
        vec2.set(work.a, positions[i * 2] - positions[j * 2], positions[i * 2 + 1] - positions[j * 2 + 1]);
        const distance = vec2.length(work.a);
        if (distance >= 0.48 || distance < 1e-8) continue;
        vec2.scale(work.a, work.a, 1 / distance);
        vec2.set(work.b, velocities[i * 2] - velocities[j * 2], velocities[i * 2 + 1] - velocities[j * 2 + 1]);
        const speed = vec2.dot(work.a, work.b);
        for (let axis = 0; axis < 2; axis++) {
          positions[i * 2 + axis] += work.a[axis] * (0.48 - distance) / 2;
          positions[j * 2 + axis] -= work.a[axis] * (0.48 - distance) / 2;
          if (speed < 0) {
            velocities[i * 2 + axis] -= speed * work.a[axis];
            velocities[j * 2 + axis] += speed * work.a[axis];
          }
        }
      }
    }
    work.collisions.set(positions, frame * 50);
  }
  world.set(FormWorkspace, work);
}
