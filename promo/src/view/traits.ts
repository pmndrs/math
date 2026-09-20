import { trait } from 'koota';
import { quat, vec3 } from 'math';

export const View = trait(() => ({
  canvas: null as HTMLCanvasElement | null,
  context: null as CanvasRenderingContext2D | null,
  /** The live scene, rendered here first while the field distorts it. */
  scene: null as HTMLCanvasElement | null,
  width: 1000, height: 1250,
  point: vec3.create(), rotation: quat.create(), tilt: quat.create(),
  axis: vec3.fromValues(0, 1, 0),
  projected: new Float32Array(24000),
  arrival: { value: 0, velocity: 0 },
}));
