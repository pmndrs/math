import { bench, group } from '@pmndrs/labs';
import * as vec3 from '../../src/core/vec3';
import type { Vec3 } from '../../src/core/vec3';
import * as mulberry32 from '../../src/random/mulberry32';
import * as plane3 from '../../src/shapes/plane3';
import type { Plane3 } from '../../src/shapes/plane3';

// One full step of a minimal sphere physics world: integrate gravity and
// velocities, bounce off six arena wall planes, then resolve all pairwise
// sphere-sphere contacts with equal-mass impulses. State is restored between
// samples so every sample simulates the identical step.

const N = 512;
const RADIUS = 0.5;
const ARENA = 15;
const DT = 1 / 60;
const RESTITUTION = 0.6;

const GRAVITY: Vec3 = [0, -9.81, 0];

let sink = 0;

group('sphere physics step 512 @algo @physics', () => {
  bench('integrate + walls + pair resolve', function* () {
    const rand = mulberry32.create(42);

    const positions: Vec3[] = [];
    const velocities: Vec3[] = [];
    const initialPositions: Vec3[] = [];
    const initialVelocities: Vec3[] = [];
    for (let i = 0; i < N; i++) {
      const p: Vec3 = [
        (mulberry32.sample(rand) - 0.5) * 2 * (ARENA - RADIUS),
        (mulberry32.sample(rand) - 0.5) * 2 * (ARENA - RADIUS),
        (mulberry32.sample(rand) - 0.5) * 2 * (ARENA - RADIUS),
      ];
      const v: Vec3 = [
        (mulberry32.sample(rand) - 0.5) * 10,
        (mulberry32.sample(rand) - 0.5) * 10,
        (mulberry32.sample(rand) - 0.5) * 10,
      ];
      positions.push(vec3.clone(p));
      velocities.push(vec3.clone(v));
      initialPositions.push(p);
      initialVelocities.push(v);
    }

    const walls: Plane3[] = [];
    for (let axis = 0; axis < 3; axis++) {
      for (const sign of [1, -1]) {
        const normal = vec3.create();
        normal[axis] = sign;
        const wall = plane3.create();
        plane3.fromNormalAndConstant(wall, normal, ARENA);
        walls.push(wall);
      }
    }

    const contactNormal = vec3.create();
    const relativeVelocity = vec3.create();

    yield {
      bench: () => {
        // integrate
        for (let i = 0; i < N; i++) {
          vec3.scaleAndAdd(velocities[i], velocities[i], GRAVITY, DT);
          vec3.scaleAndAdd(positions[i], positions[i], velocities[i], DT);
        }

        // wall contacts
        for (let i = 0; i < N; i++) {
          const p = positions[i];
          const v = velocities[i];
          for (let w = 0; w < 6; w++) {
            const wall = walls[w];
            const distance = plane3.distanceToPoint(wall, p);
            if (distance < RADIUS) {
              vec3.scaleAndAdd(p, p, wall.normal, RADIUS - distance);
              const speedIntoWall = vec3.dot(v, wall.normal);
              if (speedIntoWall < 0) {
                vec3.scaleAndAdd(v, v, wall.normal, -(1 + RESTITUTION) * speedIntoWall);
              }
            }
          }
        }

        // pairwise sphere-sphere contacts
        const contactDistanceSq = (RADIUS * 2) * (RADIUS * 2);
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            if (vec3.squaredDistance(positions[i], positions[j]) >= contactDistanceSq) continue;

            vec3.subtract(contactNormal, positions[j], positions[i]);
            const distance = vec3.length(contactNormal);
            if (distance === 0) continue;
            vec3.scale(contactNormal, contactNormal, 1 / distance);

            // separate positions equally
            const overlap = RADIUS * 2 - distance;
            vec3.scaleAndAdd(positions[i], positions[i], contactNormal, -overlap / 2);
            vec3.scaleAndAdd(positions[j], positions[j], contactNormal, overlap / 2);

            // equal-mass impulse along the contact normal
            vec3.subtract(relativeVelocity, velocities[j], velocities[i]);
            const approachSpeed = vec3.dot(relativeVelocity, contactNormal);
            if (approachSpeed < 0) {
              const impulse = (-(1 + RESTITUTION) * approachSpeed) / 2;
              vec3.scaleAndAdd(velocities[i], velocities[i], contactNormal, -impulse);
              vec3.scaleAndAdd(velocities[j], velocities[j], contactNormal, impulse);
            }
          }
        }

        let energy = 0;
        for (let i = 0; i < N; i++) {
          energy += vec3.squaredLength(velocities[i]);
        }
        sink = energy;
      },
      after: () => {
        for (let i = 0; i < N; i++) {
          vec3.copy(positions[i], initialPositions[i]);
          vec3.copy(velocities[i], initialVelocities[i]);
        }
      },
    };
  }).gc('inner');
});

if (sink === Infinity) throw new Error('unreachable');
