import * as g from 'gpucat';
import { d } from 'gpucat';
import { deltaAngle, mat4, type Vec3, vec3 } from 'math';
import { mulberry32, random } from 'math/random';
import { type Box3, box3, frustum, type Sphere } from 'math/shapes';
import { createPanel } from './common/dash';
import { createInfo } from './common/info';
import { ink, isoline, light, pixels } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, palette, rgb, spectrum } from './common/theme';

// A map of agents patrolling a little city, each seeing through a camera of its
// own. Every agent's six planes come from math's frustum, extracted from its own
// projection and view matrices, and every building and orb on the map is tested
// against every agent once a frame - frustum.intersectsBox3 and
// intersectsSphere. Accent fills mark visible objects, while faint neutral
// outlines keep unseen objects available for comparison.
//
// The cones are drawn from frustum.corners, which recovers the eight corners by
// intersecting the planes three at a time.
//
// The ZO in setFromViewProjectionMatrixZO matters. It reads clip space with
// depth running 0 to 1, which is what WebGPU, Metal and D3D use and what
// gpucat's cameras build. The NO variant is for OpenGL's -1 to 1, and choosing
// wrong leaves the near and far planes misplaced while the sides still look
// right, which is the worst way for it to fail.

const MAX_AGENTS = 16;
const ACCENT = spectrum[0];
const BLOCKS = 8; // city blocks per side, so BLOCKS + 1 streets and intersections
const BLOCK = 4; // centre to centre of neighbouring streets
const FIELD = BLOCKS * BLOCK;
const ROAD = 1.1; // kept clear of buildings
const PER_BLOCK = 22;
const ORBS = 420;
const EYE_HEIGHT = 0.75;
const TURN_RATE = 7; // how fast an agent swings to face a new street

/** World position of the street running along index `i`. */
function street(i: number): number {
    return -FIELD / 2 + i * BLOCK;
}

type Settings = { agents: number; fov: number; range: number; speed: number; cones: boolean };

const settings: Settings = { agents: 9, fov: 52, range: 5, speed: 2.2, cones: true };

/* the map */

const buildings: Box3[] = [];
const orbs: Sphere[] = [];
// which agent can see each object, or -1 for nobody
const seenBy: number[] = [];

const rng = mulberry32.create(11);
const nextRandom = () => mulberry32.sample(rng);
const _build_center = vec3.create();
const _build_size = vec3.create();

// buildings fill the inside of each block and never encroach on a street, so
// the grid between them stays walkable
for (let bz = 0; bz < BLOCKS; bz++) {
    for (let bx = 0; bx < BLOCKS; bx++) {
        const minX = street(bx) + ROAD / 2;
        const maxX = street(bx + 1) - ROAD / 2;
        const minZ = street(bz) + ROAD / 2;
        const maxZ = street(bz + 1) - ROAD / 2;
        for (let k = 0; k < PER_BLOCK; k++) {
            const width = random.float(nextRandom, 0.25, 0.6);
            const height = random.float(nextRandom, 0.4, 3.2);
            vec3.set(
                _build_center,
                random.float(nextRandom, minX + width / 2, maxX - width / 2),
                height / 2,
                random.float(nextRandom, minZ + width / 2, maxZ - width / 2),
            );
            vec3.set(_build_size, width, height, width);
            const box = box3.create();
            box3.setFromCenterAndSize(box, _build_center, _build_size);
            buildings.push(box);
            seenBy.push(-1);
        }
    }
}

// orbs hover over the intersections, so there is something to spot on the
// streets themselves as well as in the blocks
for (let i = 0; i < ORBS; i++) {
    orbs.push({
        center: [
            street(random.int(nextRandom, 0, BLOCKS)) + random.float(nextRandom, -0.4, 0.4),
            random.float(nextRandom, 0.4, 2.4),
            street(random.int(nextRandom, 0, BLOCKS)) + random.float(nextRandom, -0.4, 0.4),
        ],
        radius: random.float(nextRandom, 0.12, 0.24),
    });
    seenBy.push(-1);
}

/* the agents */

// the four street directions, as steps on the intersection grid
const DIRS = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
];

// an agent stands at an intersection and walks to the next one, then picks a
// street to carry on down. Facing is damped toward the direction of travel
// rather than snapped, so corners are turned rather than teleported through
type Agent = {
    frustum: ReturnType<typeof frustum.create>;
    corners: [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3];
    eye: Vec3;
    target: Vec3;
    cellX: number;
    cellZ: number;
    dir: number;
    along: number; // 0 at the last intersection, 1 at the next
    pace: number;
    facing: number;
};

function createAgent(): Agent {
    const dir = random.int(nextRandom, 0, 3);
    return {
        frustum: frustum.create(),
        corners: [
            vec3.create(),
            vec3.create(),
            vec3.create(),
            vec3.create(),
            vec3.create(),
            vec3.create(),
            vec3.create(),
            vec3.create(),
        ],
        eye: vec3.create(),
        target: vec3.create(),
        cellX: random.int(nextRandom, 0, BLOCKS),
        cellZ: random.int(nextRandom, 0, BLOCKS),
        dir,
        along: 0,
        pace: random.float(nextRandom, 0.8, 1.3),
        facing: Math.atan2(DIRS[dir][0], DIRS[dir][1]),
    };
}

const agents: Agent[] = [];
for (let i = 0; i < MAX_AGENTS; i++) agents.push(createAgent());

/** Picks the next street at an intersection, favouring straight on and never doubling back. */
function turn(agent: Agent): void {
    const back = (agent.dir + 2) % 4;
    const options: number[] = [];
    for (let d = 0; d < 4; d++) {
        if (d === back) continue;
        const nx = agent.cellX + DIRS[d][0];
        const nz = agent.cellZ + DIRS[d][1];
        if (nx < 0 || nx > BLOCKS || nz < 0 || nz > BLOCKS) continue;
        options.push(d);
    }
    // a dead end is only possible in a corner, and there the only way out is back
    if (options.length === 0) agent.dir = back;
    else if (options.includes(agent.dir) && random.bool(nextRandom, 0.62)) return;
    else agent.dir = random.choice(nextRandom, options);
}

/** Walks one agent along its street, stepping to the next intersection when it arrives. */
function walk(agent: Agent, delta: number): void {
    agent.along += (delta * agent.pace * settings.speed) / BLOCK;
    while (agent.along >= 1) {
        agent.cellX += DIRS[agent.dir][0];
        agent.cellZ += DIRS[agent.dir][1];
        agent.along -= 1;
        turn(agent);
    }

    const dx = DIRS[agent.dir][0];
    const dz = DIRS[agent.dir][1];
    vec3.set(
        agent.eye,
        street(agent.cellX) + dx * agent.along * BLOCK,
        EYE_HEIGHT,
        street(agent.cellZ) + dz * agent.along * BLOCK,
    );

    // deltaAngle takes the short way round, so a turn past the wrap at pi does
    // not send the agent spinning the long way
    agent.facing += deltaAngle(agent.facing, Math.atan2(dx, dz)) * Math.min(1, delta * TURN_RATE);
    vec3.set(
        agent.target,
        agent.eye[0] + Math.sin(agent.facing) * 4,
        EYE_HEIGHT * 0.75,
        agent.eye[2] + Math.cos(agent.facing) * 4,
    );
}

const view = mat4.create();
const projection = mat4.create();
const UP: Vec3 = [0, 1, 0];

/** Walks every agent, rebuilds its planes, then paints the map with who sees what. */
function look(delta: number): number {
    for (let i = 0; i < seenBy.length; i++) seenBy[i] = -1;

    mat4.perspectiveZO(projection, (settings.fov * Math.PI) / 180, 1.9, 0.25, settings.range);

    let seen = 0;
    for (let a = 0; a < settings.agents; a++) {
        const agent = agents[a];
        walk(agent, delta);

        mat4.lookAt(view, agent.eye, agent.target, UP);
        frustum.setFromViewProjectionMatrixZO(agent.frustum, projection, view);
        frustum.corners(agent.corners, agent.frustum);

        // first agent to see an object claims it, so the colour says who
        for (let i = 0; i < buildings.length; i++) {
            if (seenBy[i] >= 0 || !frustum.intersectsBox3(agent.frustum, buildings[i])) continue;
            seenBy[i] = a;
            seen++;
        }
        for (let i = 0; i < orbs.length; i++) {
            const at = buildings.length + i;
            if (seenBy[at] >= 0 || !frustum.intersectsSphere(agent.frustum, orbs[i])) continue;
            seenBy[at] = a;
            seen++;
        }
    }
    return seen;
}

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.style.touchAction = 'none';

const scene = new g.Scene();

// high and angled, so the map reads flat but the buildings still have height
const camera = new g.PerspectiveCamera(Math.PI / 5, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position[0] = 0;
camera.position[1] = 36;
camera.position[2] = 36;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* the city */

// three per-instance vec4s: where the object sits, how big it is on each axis,
// and its outline colour. Extent must be a vector rather than one scale or a tower
// would come out a cube
function createField(geometry: g.Geometry, count: number, box: boolean) {
    const placement = new Float32Array(count * 4);
    const extent = new Float32Array(count * 4);
    const lighting = new Float32Array(count * 4);
    const placementBuffer = new g.GpuBuffer(d.array(d.vec4f), { data: placement, usage: 'storage' });
    const extentBuffer = new g.GpuBuffer(d.array(d.vec4f), { data: extent, usage: 'storage' });
    const lightingBuffer = new g.GpuBuffer(d.array(d.vec4f), { data: lighting, usage: 'storage' });

    const place = g.index(g.storage(placementBuffer), g.instanceIndex);
    const size = g.index(g.storage(extentBuffer), g.instanceIndex);
    const shading = g.index(g.storage(lightingBuffer), g.instanceIndex);
    const position = g.attribute('position', d.vec3f);
    const normal = g.attribute('normal', d.vec3f);
    const world = g.add(g.mul(position, size.xyz), place.xyz);
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.vec4(world, g.f32(1))));
    const vNormal = g.varying(g.mul(g.cameraViewMatrix, g.vec4(normal, g.f32(0))).xyz, 'v_n');
    const vSeen = g.varying(shading.x, 'v_seen').setInterpolation('flat');
    const vTint = g.varying(shading.yzw, 'v_tint');
    const uv = g.varying(g.attribute('uv', d.vec2f), 'v_uv');
    const edge = box
        ? g.max(isoline(uv.x, 1.25), isoline(uv.y, 1.25))
        : g.f32(1).sub(g.smoothstep(g.f32(0.35), g.f32(0.55), vNormal.z.abs()));
    const unseenColor = g.mix(ink(palette.base), light, edge.mul(g.f32(0.28)));
    const seenColor = g.mix(vTint, ink(palette.base), edge.mul(g.f32(0.65)));
    const color = g.mix(unseenColor, seenColor, vSeen);
    const mesh = new g.Mesh(geometry, new g.Material({ vertex: clip, fragment: g.vec4(color, g.f32(1)) }));
    mesh.count = count;
    scene.add(mesh);

    return { placement, extent, lighting, placementBuffer, extentBuffer, lightingBuffer };
}

const cityField = createField(g.createBoxGeometry(1, 1, 1), buildings.length, true);
const orbField = createField(g.createSphereGeometry(1, 10, 8), orbs.length, false);

const _center = vec3.create();
const _size = vec3.create();
for (let i = 0; i < buildings.length; i++) {
    box3.center(_center, buildings[i]);
    box3.size(_size, buildings[i]);
    cityField.placement[i * 4] = _center[0];
    cityField.placement[i * 4 + 1] = _center[1];
    cityField.placement[i * 4 + 2] = _center[2];
    cityField.extent[i * 4] = _size[0];
    cityField.extent[i * 4 + 1] = _size[1];
    cityField.extent[i * 4 + 2] = _size[2];
}
for (let i = 0; i < orbs.length; i++) {
    orbField.placement[i * 4] = orbs[i].center[0];
    orbField.placement[i * 4 + 1] = orbs[i].center[1];
    orbField.placement[i * 4 + 2] = orbs[i].center[2];
    orbField.extent[i * 4] = orbs[i].radius;
    orbField.extent[i * 4 + 1] = orbs[i].radius;
    orbField.extent[i * 4 + 2] = orbs[i].radius;
}
cityField.placementBuffer.needsUpdate = true;
cityField.extentBuffer.needsUpdate = true;
orbField.placementBuffer.needsUpdate = true;
orbField.extentBuffer.needsUpdate = true;

/* the cones */

// the twelve edges of the eight corners: near ring, far ring, and the struts
const EDGES = [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7];

const coneMaterial = new g.LineMaterial({ color: g.vec4(light, g.f32(1)), lineWidth: pixels(1.75), transparent: true });
coneMaterial.depthTest = false;
coneMaterial.depthWrite = false;

const cones = agents.map(() => {
    const points = new Float32Array(EDGES.length * 3);
    const geometry = new g.LineSegmentsGeometry(points, EDGES.length);
    const line = new g.LineSegments(geometry, coneMaterial);
    scene.add(line);
    return { points, geometry, line };
});

/* panel */

let lookMs = 0;
let seen = 0;

const panel = createPanel('frustum culling', ACCENT);
panel.add(settings, 'agents', { min: 1, max: MAX_AGENTS, step: 1, label: 'Agents' });
panel.add(settings, 'fov', { min: 15, max: 110, step: 1, label: 'Field of view' });
panel.add(settings, 'range', { min: 1.5, max: 12, step: 0.1, label: 'Sight range' });
panel.add(settings, 'speed', { min: 0, max: 6, step: 0.05, label: 'Patrol speed' });
panel.add(settings, 'cones', { label: 'Cones' });
panel.monitor(() => `${seen} / ${seenBy.length}`, { label: 'seen' });
panel.monitor(() => settings.agents * seenBy.length, { label: 'tests' });
panel.monitor(() => lookMs, { label: 'culling', unit: 'duration' });

const readout = createInfo();
readout.innerHTML =
    `<span style="color:${ACCENT}">■</span> Seen by an agent · <span style="opacity:0.4">□ Unseen</span>` + '<br>━ Camera bounds';

/* render */

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

const seenTint = rgb(ACCENT);
const unseen = rgb(palette.light);

function paint(field: { lighting: Float32Array; lightingBuffer: g.GpuBuffer }, offset: number, count: number): void {
    for (let i = 0; i < count; i++) {
        const agent = seenBy[offset + i];
        const tint = agent >= 0 ? seenTint : null;
        // Neutral outlines keep rejected objects visible for comparison.
        field.lighting[i * 4] = tint ? 1 : 0;
        field.lighting[i * 4 + 1] = tint ? tint[0] : unseen[0];
        field.lighting[i * 4 + 2] = tint ? tint[1] : unseen[1];
        field.lighting[i * 4 + 3] = tint ? tint[2] : unseen[2];
    }
    field.lightingBuffer.needsUpdate = true;
}

let last = -1;

function frame(tms: number) {
    const t = tms / 1000;
    if (last < 0) last = t;
    const delta = Math.min(t - last, 0.05);
    last = t;

    const started = performance.now();
    seen = look(delta);
    lookMs = performance.now() - started;

    paint(cityField, 0, buildings.length);
    paint(orbField, buildings.length, orbs.length);

    for (let a = 0; a < cones.length; a++) {
        const cone = cones[a];
        cone.line.visible = settings.cones && a < settings.agents;
        if (!cone.line.visible) continue;
        for (let e = 0; e < EDGES.length; e++) {
            const corner = agents[a].corners[EDGES[e]];
            cone.points[e * 3] = corner[0];
            cone.points[e * 3 + 1] = corner[1];
            cone.points[e * 3 + 2] = corner[2];
        }
        cone.geometry.update(cone.points);
    }

    controls.update();
    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
