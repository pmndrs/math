import * as g from 'gpucat';
import { d } from 'gpucat';
import { type Vec2, vec2 } from 'math';
import { mulberry32, random } from 'math/random';
import { createPanel } from './common/dash';
import { ink, light } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, palette, spectrum } from './common/theme';

// A cluster of circles held together by its own gravity, solved with substepped
// XPBD - the small-steps formulation from "Detailed Rigid Body Simulation with
// Extended Position Based Dynamics" (Mueller et al. 2020), following Erin
// Catto's solve_xpbd.c in solver2d. There are no walls: every grain falls
// toward the origin, so the cluster is its own container. Move the pointer to
// plough through it.
//
// Each substep integrates, projects the overlaps out of the positions, reads
// velocity back from the position change, then relaxes that velocity for
// restitution and friction. Substeps do the work that solver iterations
// normally do, so a single projection pass per substep is enough.
//
// The pointer is not a special case: it is body 0 with an inverse mass of zero,
// so it collides through exactly the same contacts as everything else.

const GRAVITY = 5; // pull toward the origin, the same at any distance
const RADIUS_MIN = 0.026;
const RADIUS_MAX = 0.038;
const SPAWN_RADIUS = 1.45;
const SPIN = 0.6; // radians per second the cloud starts turning at, low enough that
// the collapse does not spin the rim up past what gravity can hold
const MAX_PUSHOUT = 5; // metres per second, so a deep overlap unpacks instead of exploding
const SPECULATIVE = 0.02; // contacts are found this early, see findContacts
const PARKED = 9; // where the pointer body waits while the pointer is away

// broadphase grid, one cell per grain diameter so a pair can only ever be in
// this cell or one of the four that follow it
const CELL = RADIUS_MAX * 2;
const EXTENT = 3.2; // the grid reaches this far from the origin, past the widest view
const GRID_SIDE = Math.ceil((EXTENT * 2) / CELL);
const NEIGHBOUR_X = [0, 1, -1, 0, 1];
const NEIGHBOUR_Y = [0, 0, 1, 1, 1];

type Body = { position: Vec2; previous: Vec2; velocity: Vec2; radius: number; inverseMass: number };

/** One non-penetration constraint. The normal points from `a` toward `b`. */
type Contact = { a: number; b: number; normal: Vec2; separation: number; approach: number; impulse: number };

function createWorld(capacity: number) {
    const bodies: Body[] = [];
    for (let i = 0; i < capacity; i++) {
        bodies.push({ position: [0, 0], previous: [0, 0], velocity: [0, 0], radius: 0, inverseMass: 0 });
    }
    // a grain in a settled pack touches six neighbours, and the pool is never
    // grown - a dropped contact costs one frame of overlap, nothing worse
    const contacts: Contact[] = [];
    for (let i = 0; i < capacity * 8; i++) {
        contacts.push({ a: 0, b: 0, normal: [0, 1], separation: 0, approach: 0, impulse: 0 });
    }
    return {
        capacity,
        count: 0,
        bodies,
        contacts,
        contactCount: 0,
        cellHead: new Array<number>(GRID_SIDE * GRID_SIDE).fill(-1),
        bodyNext: new Array<number>(capacity).fill(-1),
        pairsTested: 0,
    };
}

type World = ReturnType<typeof createWorld>;

function cell(v: number): number {
    return Math.min(GRID_SIDE - 1, Math.max(0, Math.floor((v + EXTENT) / CELL)));
}

/**
 * Body 0 is the pointer, then a sunflower spiral of grains turning as one. The
 * spiral spaces them evenly over the disc, so nothing starts overlapped and the
 * cluster collapses cleanly instead of exploding.
 */
function spawn(world: World, count: number, pointerRadius: number): void {
    world.count = Math.min(count + 1, world.capacity);

    const pointer = world.bodies[0];
    pointer.radius = pointerRadius;
    pointer.inverseMass = 0;
    vec2.set(pointer.position, PARKED, PARKED);
    vec2.copy(pointer.previous, pointer.position);
    vec2.zero(pointer.velocity);

    const rng = mulberry32.create(1337);
    const next = () => mulberry32.sample(rng);
    const grains = world.count - 1;
    for (let i = 1; i < world.count; i++) {
        const body = world.bodies[i];
        body.radius = random.float(next, RADIUS_MIN, RADIUS_MAX);
        body.inverseMass = 1 / (Math.PI * body.radius * body.radius); // area as mass, so big grains shove small ones
        // equal-area radius over the ring against the golden angle, the 2D
        // Fibonacci lattice, so nothing starts overlapped
        const radius = SPAWN_RADIUS * Math.sqrt((i - 0.5) / grains);
        const angle = (i - 1) * Math.PI * (3 - Math.sqrt(5));
        vec2.set(body.position, Math.cos(angle) * radius, Math.sin(angle) * radius);
        vec2.copy(body.previous, body.position);
        // turning as one, which survives the collapse as a slow spin
        vec2.set(body.velocity, -body.position[1] * SPIN, body.position[0] * SPIN);
    }
}

/* broadphase and contacts */

/**
 * Rebuilds the grid and the pair list for this frame. Pairs are found with a
 * speculative margin: the list has to outlive every substep, and a pair that is
 * not quite touching now may well be touching by the last one.
 */
function findContacts(world: World): void {
    world.cellHead.fill(-1);
    for (let i = 1; i < world.count; i++) {
        const position = world.bodies[i].position;
        const index = cell(position[1]) * GRID_SIDE + cell(position[0]);
        world.bodyNext[i] = world.cellHead[index];
        world.cellHead[index] = i;
    }

    world.contactCount = 0;
    world.pairsTested = 0;

    for (let i = 1; i < world.count; i++) {
        const body = world.bodies[i];
        const cx = cell(body.position[0]);
        const cy = cell(body.position[1]);

        // this cell and the four that follow it, so every pair is visited once
        for (let n = 0; n < 5; n++) {
            const nx = cx + NEIGHBOUR_X[n];
            const ny = cy + NEIGHBOUR_Y[n];
            if (nx < 0 || nx >= GRID_SIDE || ny >= GRID_SIDE) continue;
            for (let j = world.cellHead[ny * GRID_SIDE + nx]; j >= 0; j = world.bodyNext[j]) {
                if (n === 0 && j <= i) continue;
                world.pairsTested++;
                if (touching(world, i, j)) addContact(world, i, j);
            }
        }

        // the pointer is wider than a cell, so it is tested against every grain
        // rather than through the grid. One extra distance test each
        world.pairsTested++;
        if (touching(world, 0, i)) addContact(world, 0, i);
    }
}

function touching(world: World, a: number, b: number): boolean {
    const bodyA = world.bodies[a];
    const bodyB = world.bodies[b];
    const reach = bodyA.radius + bodyB.radius + SPECULATIVE;
    return vec2.squaredDistance(bodyA.position, bodyB.position) <= reach * reach;
}

function addContact(world: World, a: number, b: number): void {
    if (world.contactCount >= world.contacts.length) return;
    const contact = world.contacts[world.contactCount++];
    contact.a = a;
    contact.b = b;
    contact.impulse = 0;
}

const _update_delta = vec2.create();

/**
 * Re-derives the normal and separation from the live positions. Only the pair
 * list is per-frame, the geometry is per-substep, so a grain rolling around its
 * neighbour keeps a correct normal all the way through the step.
 */
function updateContact(world: World, contact: Contact): void {
    const a = world.bodies[contact.a];
    const b = world.bodies[contact.b];

    vec2.subtract(_update_delta, b.position, a.position);
    const distance = vec2.length(_update_delta);
    // concentric centres have no normal to recover, so push straight up rather
    // than divide by zero. 1e-9 is well under a grain radius but far above the
    // rounding noise of positions this size
    if (distance > 1e-9) vec2.scale(contact.normal, _update_delta, 1 / distance);
    else vec2.set(contact.normal, 0, 1);
    contact.separation = distance - a.radius - b.radius;
}

/* solver */

type Settings = { grains: number; substeps: number; restitution: number; friction: number; gravity: number; pointer: number };

const _step_tangent = vec2.create();

function stepWorld(world: World, delta: number, settings: Settings): void {
    findContacts(world);

    const h = delta / settings.substeps;
    const inverseH = 1 / h;
    // under this closing speed a contact is resting rather than landing, so it
    // gets no bounce. Two substeps of gravity, as solver2d uses
    const bounceThreshold = 2 * settings.gravity * h;

    for (let s = 0; s < settings.substeps; s++) {
        for (let i = 1; i < world.count; i++) {
            const body = world.bodies[i];
            // gravity is the same strength everywhere and always points at the
            // origin, so the cluster packs like a little planet rather than
            // spreading out the way an inverse-square field would let it
            const distance = vec2.length(body.position);
            if (distance > 1e-4) {
                vec2.scaleAndAdd(body.velocity, body.velocity, body.position, (-settings.gravity * h) / distance);
            }
            vec2.copy(body.previous, body.position);
            vec2.scaleAndAdd(body.position, body.position, body.velocity, h);
        }

        // project the overlaps out of the positions
        for (let c = 0; c < world.contactCount; c++) {
            const contact = world.contacts[c];
            updateContact(world, contact);

            const a = world.bodies[contact.a];
            const b = world.bodies[contact.b];
            const normal = contact.normal;
            // the closing speed before anything is corrected, which is what
            // restitution has to bounce back off in the relax pass below
            contact.approach = (b.velocity[0] - a.velocity[0]) * normal[0] + (b.velocity[1] - a.velocity[1]) * normal[1];
            contact.impulse = 0;

            const weight = a.inverseMass + b.inverseMass;
            if (contact.separation > 0 || weight === 0) continue;

            // clamping the correction is not in the paper, but every solver does
            // it - without it a deep overlap fires the pair apart
            const lambda = -Math.max(-MAX_PUSHOUT * h, contact.separation) / weight;
            contact.impulse = lambda;
            vec2.scaleAndAdd(a.position, a.position, normal, -a.inverseMass * lambda);
            vec2.scaleAndAdd(b.position, b.position, normal, b.inverseMass * lambda);
        }

        // velocity is whatever the positions actually moved by, projection included
        for (let i = 1; i < world.count; i++) {
            const body = world.bodies[i];
            vec2.subtract(body.velocity, body.position, body.previous);
            vec2.scale(body.velocity, body.velocity, inverseH);
        }

        // relax: take back the energy the projection added, then bounce and rub
        for (let c = 0; c < world.contactCount; c++) {
            const contact = world.contacts[c];
            if (contact.impulse === 0) continue;

            const a = world.bodies[contact.a];
            const b = world.bodies[contact.b];
            const normal = contact.normal;
            const weight = a.inverseMass + b.inverseMass;

            const target = -contact.approach > bounceThreshold ? -settings.restitution * contact.approach : 0;
            const vn = (b.velocity[0] - a.velocity[0]) * normal[0] + (b.velocity[1] - a.velocity[1]) * normal[1];
            let lambda = (target - vn) / weight;
            vec2.scaleAndAdd(a.velocity, a.velocity, normal, -a.inverseMass * lambda);
            vec2.scaleAndAdd(b.velocity, b.velocity, normal, b.inverseMass * lambda);

            // coulomb friction along the tangent, capped by the normal impulse
            // this substep spent. The impulse is a distance, so the cap is
            // divided by h to land back in velocity
            vec2.set(_step_tangent, -normal[1], normal[0]);
            const vt = (b.velocity[0] - a.velocity[0]) * _step_tangent[0] + (b.velocity[1] - a.velocity[1]) * _step_tangent[1];
            if (vt === 0) continue;
            const cap = settings.friction * contact.impulse * inverseH * weight;
            lambda = (-Math.sign(vt) * Math.min(cap, Math.abs(vt))) / weight;
            vec2.scaleAndAdd(a.velocity, a.velocity, _step_tangent, -a.inverseMass * lambda);
            vec2.scaleAndAdd(b.velocity, b.velocity, _step_tangent, b.inverseMass * lambda);
        }
    }
}

/* world */

const world = createWorld(900);
const settings: Settings = { grains: 560, substeps: 8, restitution: 0.1, friction: 0.35, gravity: GRAVITY, pointer: 0.22 };
spawn(world, settings.grains, settings.pointer);

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.style.touchAction = 'none';

const scene = new g.Scene();

const camera = new g.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position[2] = 5;
scene.add(camera);

function fitCamera(): void {
    camera.top = 1.5;
    camera.bottom = -1.5;
    camera.left = -1.5 * (window.innerWidth / window.innerHeight);
    camera.right = -camera.left;
    camera.updateProjectionMatrix();
}
fitCamera();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    fitCamera();
});

/* bodies */

// Instanced discs, per-body vec4 = (x, y, radius, isPointer).
const ACCENT = spectrum[1];
const bodyData = new Float32Array(world.capacity * 4);
const bodyBuffer = new g.GpuBuffer(d.array(d.vec4f), { data: bodyData, usage: 'storage' });
const instance = g.index(g.storage(bodyBuffer), g.instanceIndex);

const position = g.attribute('position', d.vec3f);
const worldPosition = g.add(g.mul(position, instance.z), g.vec3(instance.xy, g.f32(0)));
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.vec4(worldPosition, g.f32(1))));
const vPosition = g.varying(position.xy, 'v_position');
const vPointer = g.varying(instance.w, 'v_pointer').setInterpolation('flat');

// Measure the stroke in screen pixels so the pointer radius cannot blur or widen it.
const radius = g.length(vPosition);
const footprint = g.length(g.vec2(g.dpdx(radius), g.dpdy(radius))).max(g.f32(1e-5));
const edgeDistance = g.f32(1).sub(radius).div(footprint);
const strokeWidth = g.mix(g.f32(1.5 * devicePixelRatio), g.f32(3 * devicePixelRatio), vPointer);
const stroke = g.f32(1).sub(g.smoothstep(strokeWidth.sub(g.f32(0.5)), strokeWidth.add(g.f32(0.5)), edgeDistance));
const discGeometry = new g.Geometry();
discGeometry.setBuffer('position', g.createVertexBuffer(d.vec3f, new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0])));
discGeometry.setIndex(g.createIndexBuffer(new Uint16Array([0, 1, 2, 0, 2, 3])));
const discs = new g.Mesh(
    discGeometry,
    new g.Material({
        vertex: clip,
        fragment: g.vec4(
            g.mix(ink(palette.base), g.select(ink(ACCENT), light, g.greaterThanEqual(vPointer, g.f32(0.5))), stroke),
            g.smoothstep(g.f32(-0.5), g.f32(0.5), edgeDistance),
        ),
        transparent: true,
        depthWrite: false,
    }),
);
discs.count = world.count;
scene.add(discs);

/* pointer */

const pointerTarget: Vec2 = [PARKED, PARKED];

function pointerToWorld(clientX: number, clientY: number): void {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    vec2.set(pointerTarget, ndcX * camera.right, ndcY * camera.top);
}

canvas.addEventListener('pointermove', (e) => pointerToWorld(e.clientX, e.clientY));
canvas.addEventListener('pointerdown', (e) => {
    pointerToWorld(e.clientX, e.clientY);
    canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerleave', () => vec2.set(pointerTarget, PARKED, PARKED));

/* panel */

let stepMs = 0;

const panel = createPanel('circle physics', ACCENT);
panel
    .add(settings, 'grains', { min: 100, max: 880, step: 10, label: 'Grains' })
    .onChange(() => spawn(world, settings.grains, settings.pointer));
panel.add(settings, 'substeps', { min: 1, max: 16, step: 1, label: 'Substeps' });
panel.add(settings, 'gravity', { min: 0, max: 12, step: 0.1, label: 'Gravity' });
panel.add(settings, 'restitution', { min: 0, max: 0.6, step: 0.01, label: 'Restitution' });
panel.add(settings, 'friction', { min: 0, max: 1, step: 0.01, label: 'Friction' });
panel.add(settings, 'pointer', { min: 0.08, max: 0.5, step: 0.01, label: 'Pointer' }).onChange(() => {
    world.bodies[0].radius = settings.pointer;
});
panel.button('↻ Reset', () => spawn(world, settings.grains, settings.pointer));
panel.monitor(() => world.count - 1, { label: 'grains' });
panel.monitor(() => world.contactCount, { label: 'contacts' });
panel.monitor(() => `${world.pairsTested} / ${((world.count - 1) * (world.count - 2)) / 2}`, { label: 'pairs tested' });
panel.monitor(() => stepMs, { label: 'step', unit: 'duration' });

/* render */

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let last = -1;
let accumulator = 0;

function frame(tms: number) {
    const t = tms / 1000;
    if (last < 0) last = t;
    const delta = Math.min(t - last, 0.05);
    last = t;

    // the pointer body is moved by hand rather than integrated, so it carries
    // the pointer's own velocity into the contacts it makes
    const pointer = world.bodies[0];
    vec2.subtract(pointer.velocity, pointerTarget, pointer.position);
    vec2.scale(pointer.velocity, pointer.velocity, delta > 0 ? 1 / delta : 0);
    vec2.copy(pointer.position, pointerTarget);

    // fixed step, capped so a slow frame cannot spiral into more and more work
    const started = performance.now();
    accumulator += delta;
    let steps = 0;
    while (accumulator >= 1 / 60 && steps < 4) {
        stepWorld(world, 1 / 60, settings);
        accumulator -= 1 / 60;
        steps++;
    }
    if (steps === 4) accumulator = 0;
    if (steps > 0) stepMs = (performance.now() - started) / steps;

    for (let i = 0; i < world.count; i++) {
        const body = world.bodies[i];
        bodyData[i * 4] = body.position[0];
        bodyData[i * 4 + 1] = body.position[1];
        bodyData[i * 4 + 2] = body.radius;
        // Small balls carry the accent and the pointer stays neutral.
        bodyData[i * 4 + 3] = i === 0 ? 1 : 0;
    }
    bodyBuffer.needsUpdate = true;
    discs.count = world.count;

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
