// Shared "flowing brand rainbow" shader nodes (adapted from makecat.io): a
// 5-stop palette (pink -> yellow -> blue -> purple -> pink) sampled by world
// position and animated over time, so the bands anchor to the geometry as the
// camera orbits. Built with gpucat's node DSL (no raw WGSL).

import * as g from 'gpucat';

const d = g.d;

// shared time uniform — advance `time.value` once per frame so every rainbow
// material stays phase-locked.
export const time = g.uniform(g.f32(0), 'time');

// palette stops, sRGB/255: #ff3ea5 #ffd23f #3fa7ff #8a2be2
const C0 = g.vec3(1.0, 0.243, 0.647);
const C1 = g.vec3(1.0, 0.824, 0.247);
const C2 = g.vec3(0.247, 0.655, 1.0);
const C3 = g.vec3(0.541, 0.169, 0.886);

// palette(t): wrap through the four stops, t in cycles
function palette(t: g.Node<typeof d.f32>): g.Node<typeof d.vec3f> {
    const x = g.mul(g.fract(t), g.f32(4));
    const i = g.floor(x);
    const f = g.sub(x, i);
    const ge1 = g.greaterThanEqual(i, g.f32(1));
    const ge2 = g.greaterThanEqual(i, g.f32(2));
    const ge3 = g.greaterThanEqual(i, g.f32(3));
    // segment start/end colours selected by which stop we're between
    const a = g.select(g.select(g.select(C0, C1, ge1), C2, ge2), C3, ge3);
    const b = g.select(g.select(g.select(C1, C2, ge1), C3, ge2), C0, ge3);
    return g.mix(a, b, f);
}

const SPEED = 0.15; // palette cycles per second along the flow
const AXIS = g.vec3f(0.5774, 0.5774, 0.5774); // (1,1,1)/sqrt(3)

// phase(worldPos) = dot(worldPos, axis)/period - time*SPEED
function phase(worldPos: g.Node<typeof d.vec3f>, period: number): g.Node<typeof d.f32> {
    const along = g.mul(g.dot(worldPos, AXIS), g.f32(1 / period));
    return g.sub(along, g.mul(time, g.f32(SPEED)));
}

/** Flowing rainbow RGB sampled at a world-space position. `period` = world units per cycle. */
export function rainbowRGB(worldPos: g.Node<typeof d.vec3f>, period = 2.5): g.Node<typeof d.vec3f> {
    return palette(phase(worldPos, period));
}

/**
 * Rainbow colour node for a `LineMaterial`. Recovers the fragment's world
 * position from the line's per-segment endpoints (`instanceStart`/`instanceEnd`
 * selected by `uv.x`), so the bands run along the line in world space.
 */
export function rainbowLineColor(alpha = 1, period = 2.5): g.Node<typeof d.vec4f> {
    const start = g.attribute('instanceStart', d.vec3f);
    const end = g.attribute('instanceEnd', d.vec3f);
    const u = g.attribute('uv', d.vec2f).x;
    const local = g.mix(start, end, u);
    const world = g.varying(g.mul(g.modelWorldMatrix, g.vec4(local, g.f32(1))).xyz);
    return g.vec4(rainbowRGB(world, period), g.f32(alpha));
}
