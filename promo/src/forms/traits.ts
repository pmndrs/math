import { trait } from 'koota';
import { mat4, vec2, vec3, quat, quat2, spherical, type Vec3 } from 'math';
import type { simplex3d } from 'math/noise';
import type { fabrik2, fabrik3 } from 'math/ik';
import { box3, frustum, type circle } from 'math/shapes';

export const Study = trait({ index: 0, title: '', equation: '', planar: false });
export const Geometry = trait(() => ({
  positions: new Float32Array(24000),
  starts: new Uint8Array(8000),
  ink: new Uint8Array(8000), radii: new Float32Array(8000),
  faces: new Uint16Array(12000), shades: new Float32Array(4000), faceCount: 0,
  count: 0,
  dots: false,
}));

export const FormWorkspace = trait(() => ({
  noise: null as ReturnType<typeof simplex3d.create> | null, point: vec3.create(), velocity: vec3.create(),
  tangent: vec3.create(), normal: vec3.create(), binormal: vec3.create(),
  next: vec3.create(), polar: spherical.create(),
  a: vec2.create(), b: vec2.create(), c: vec2.create(), target: vec2.create(),
  circle: null as ReturnType<typeof circle.create> | null,
  chain: null as ReturnType<typeof fabrik2.createChain2> | null,
  structure: null as ReturnType<typeof fabrik3.createStructure3> | null,
  aim: vec3.create(),
  cloud3: new Array<number>(144).fill(0), moving3: new Array<number>(144).fill(0),
  polygon: new Array<number>(24).fill(0), indices: new Array<number>(30).fill(0),
  cloud: new Array<number>(120).fill(0), hull: [] as number[],
  springs: new Float32Array(1080),
  collisions: new Float32Array(18000),
  rotation: quat.create(), real: quat.create(), dual: quat2.create(),
  rest: quat2.create(), blend: quat2.create(),
  projection: mat4.create(), view: mat4.create(), frustum: frustum.create(),
  corners: Array.from({ length: 8 }, () => vec3.create()) as [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3],
  eye: vec3.create(), box: box3.create(), size: vec3.create(),
}));
