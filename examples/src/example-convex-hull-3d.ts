import * as g from 'gpucat';
import { d } from 'gpucat';
import GUI from 'lil-gui';
import { mat4, quat, vec3 as v3 } from 'math';
import { quickhull3 } from 'math/geometry';
import { mulberry32 } from 'math/random';
import { rainbowRGB, time } from './common/rainbow';

// A point cloud and its convex hull (math's quickhull3), rendered with gpucat:
// a translucent hull shell + instanced spheres, coloured by a flowing "brand
// rainbow" (see common/rainbow) — a palette sampled by world position and
// animated over time, so the bands anchor to the geometry as the camera orbits.
// On-hull points glow rainbow; interior points stay grey. Pick a point set from
// the dropdown (the Stanford bunny, primitives, or random).

/* ------------------------------------------------------------------ point sets */

// minimal .glb reader — pulls just the POSITION accessors (all we need for a hull)
async function loadGlbPositions(url: string): Promise<number[]> {
    const buf = await (await fetch(url)).arrayBuffer();
    const dv = new DataView(buf);
    let offset = 12; // skip 12-byte header
    let json: any = null;
    let bin: ArrayBuffer | null = null;
    while (offset < dv.byteLength) {
        const len = dv.getUint32(offset, true);
        const type = dv.getUint32(offset + 4, true);
        const data = buf.slice(offset + 8, offset + 8 + len);
        if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(data));
        else if (type === 0x004e4942) bin = data;
        offset += 8 + len;
    }
    const positions: number[] = [];
    const binView = new DataView(bin as ArrayBuffer);
    for (const mesh of json.meshes) {
        for (const prim of mesh.primitives) {
            const accIdx = prim.attributes?.POSITION;
            if (accIdx == null) continue;
            const acc = json.accessors[accIdx];
            const view = json.bufferViews[acc.bufferView];
            const base = (view.byteOffset ?? 0) + (acc.byteOffset ?? 0);
            const stride = view.byteStride ?? 12;
            for (let i = 0; i < acc.count; i++) {
                const o = base + i * stride;
                positions.push(binView.getFloat32(o, true), binView.getFloat32(o + 4, true), binView.getFloat32(o + 8, true));
            }
        }
    }
    return positions;
}

function gridCube(): number[] {
    const pts: number[] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) pts.push(x, y, z);
    return pts;
}

function pyramid(): number[] {
    return [-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 0, 1.5, 0, 0, 0.5, 0, 0.5, 0.3, 0.5];
}

function sphereShell(seed: number): number[] {
    const rng = mulberry32.create(seed);
    const pts: number[] = [];
    for (let i = 0; i < 80; i++) {
        const u = mulberry32.sample(rng) * 2 - 1;
        const t = mulberry32.sample(rng) * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        pts.push(Math.cos(t) * s, Math.sin(t) * s, u);
    }
    return pts;
}

function randomCloud(n: number, seed: number): number[] {
    const rng = mulberry32.create(seed);
    const pts: number[] = [];
    while (pts.length < n * 3) {
        const x = mulberry32.sample(rng) * 2 - 1;
        const y = mulberry32.sample(rng) * 2 - 1;
        const z = mulberry32.sample(rng) * 2 - 1;
        if (x * x + y * y + z * z <= 1) pts.push(x, y, z);
    }
    return pts;
}

const VARIATIONS: Record<string, () => number[] | Promise<number[]>> = {
    bunny: () => loadGlbPositions('./models/bunny.glb'),
    cube: gridCube,
    sphere: () => sphereShell(7),
    pyramid,
    'random 50': () => randomCloud(50, 11),
    'random 500': () => randomCloud(500, 23),
};

// centre a point set at the origin and scale its largest extent to ~3 units,
// so every variation frames the same regardless of its native size
function normalize(pts: number[]): number[] {
    const n = pts.length / 3;
    let minx = Infinity, miny = Infinity, minz = Infinity;
    let maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
    for (let i = 0; i < n; i++) {
        minx = Math.min(minx, pts[i * 3]); maxx = Math.max(maxx, pts[i * 3]);
        miny = Math.min(miny, pts[i * 3 + 1]); maxy = Math.max(maxy, pts[i * 3 + 1]);
        minz = Math.min(minz, pts[i * 3 + 2]); maxz = Math.max(maxz, pts[i * 3 + 2]);
    }
    const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2, cz = (minz + maxz) / 2;
    const scale = 3 / (Math.max(maxx - minx, maxy - miny, maxz - minz) || 1);
    const out = new Array<number>(pts.length);
    for (let i = 0; i < n; i++) {
        out[i * 3] = (pts[i * 3] - cx) * scale;
        out[i * 3 + 1] = (pts[i * 3 + 1] - cy) * scale;
        out[i * 3 + 2] = (pts[i * 3 + 2] - cz) * scale;
    }
    return out;
}

/* ------------------------------------------------------------------ renderer */

const renderer = new g.WebGPURenderer({ antialias: true });
await renderer.init();

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[0] = -1.8;
camera.position[1] = 1.9;
camera.position[2] = 4;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

renderer.setInspector(new g.Inspector());

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const sphereGeometry = g.createSphereGeometry(1, 12, 8);
const HULL_MARKER_RADIUS = 0.03;
const INNER_MARKER_RADIUS = 0.009;
const HULL_OPACITY = 0.16;

/* ------------------------------------------------------------------ (re)build */

let pointsMesh: g.Mesh | null = null;
let hullMesh: g.Mesh | null = null;

function buildPoints(points: number[], hullSet: Set<number>): g.Mesh {
    const numPoints = points.length / 3;
    const instanceMatrices = new Float32Array(numPoints * 16);
    const instanceHull = new Float32Array(numPoints); // 1 = on hull, 0 = interior
    const t = v3.create();
    const s = v3.create();
    const q = quat.create();
    const m = mat4.create();
    for (let i = 0; i < numPoints; i++) {
        const onHull = hullSet.has(i);
        const r = onHull ? HULL_MARKER_RADIUS : INNER_MARKER_RADIUS;
        v3.set(t, points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
        v3.set(s, r, r, r);
        mat4.fromRotationTranslationScale(m, q, t, s);
        instanceMatrices.set(m, i * 16);
        instanceHull[i] = onHull ? 1 : 0;
    }

    const stride = 16 * 4;
    const col0 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 0, instanced: true });
    const col1 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 16, instanced: true });
    const col2 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 32, instanced: true });
    const col3 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 48, instanced: true });
    const instanceTransform = g.mat4(col0, col1, col2, col3);
    const instanceHullFlag = g.attribute(instanceHull, d.f32, { stride: 4, offset: 0, instanced: true });

    const pos = g.attribute('position', d.vec3f);
    const nrm = g.attribute('normal', d.vec3f);
    const world = g.mul(instanceTransform, g.vec4(pos, g.f32(1)));
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
    const vNormal = g.varying(g.normalize(nrm), 'v_snormal');
    const vWorld = g.varying(world.xyz, 'v_pworld');
    const vHull = g.varying(instanceHullFlag, 'v_ishull');

    const lightDirection = g.vec3(0.6, 1.0, 0.8).normalize();
    const diffuse = g.Var('diffuse', vNormal.dot(lightDirection).max(g.f32(0)));
    const light = g.Var('light', g.f32(0.4).add(diffuse.mul(g.f32(0.7))));
    // interior points stay grey; on-hull points glow with the flowing rainbow
    const grey = g.vec3(0.32, 0.32, 0.35);
    const base = g.Var('base', g.mix(grey, rainbowRGB(vWorld), vHull));
    const lit = g.Var('lit', base.mul(light));

    const material = new g.Material({ vertex: clip, fragment: g.vec4(lit, g.f32(1)) });
    const mesh = new g.Mesh(sphereGeometry, material);
    mesh.count = numPoints;
    return mesh;
}

function buildHull(points: number[], hullIndices: number[]): g.Mesh {
    const geometry = new g.Geometry();
    geometry.setBuffer('hullPosition', g.createVertexBuffer(d.vec3f, new Float32Array(points)));
    geometry.setIndex(g.createIndexBuffer(new Uint32Array(hullIndices)));

    const pos = g.attribute('hullPosition', d.vec3f);
    const world = g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)));
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
    const vWorld = g.varying(world.xyz, 'v_hworld');

    const material = new g.Material({
        vertex: clip,
        fragment: g.vec4(rainbowRGB(vWorld), g.f32(HULL_OPACITY)),
        transparent: true,
        cullMode: 'back',
        depthWrite: false,
        blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        },
    });
    return new g.Mesh(geometry, material);
}

function rebuild(rawPoints: number[]) {
    const points = normalize(rawPoints);
    const numPoints = points.length / 3;

    const t0 = performance.now();
    const hullIndices = quickhull3(points);
    const hullMs = performance.now() - t0;
    const hullSet = new Set(hullIndices);

    if (pointsMesh) scene.remove(pointsMesh);
    if (hullMesh) scene.remove(hullMesh);

    pointsMesh = buildPoints(points, hullSet);
    hullMesh = buildHull(points, hullIndices);
    scene.add(pointsMesh);
    scene.add(hullMesh);
    scene.updateWorldMatrix();

    updateStats(numPoints, hullSet.size, hullMs);
}

/* ------------------------------------------------------------------ ui + stats */

const stats = document.createElement('div');
stats.className = 'mc-info';
stats.style.top = '10px';
stats.style.left = '10px';
document.body.appendChild(stats);
function updateStats(points: number, hullVerts: number, ms: number) {
    stats.innerHTML = `points: ${points}<br>hull vertices: ${hullVerts}<br>quickhull3: ${ms.toFixed(2)}ms`;
}

const settings = { variation: 'bunny' };
async function select(name: string) {
    rebuild(await VARIATIONS[name]());
}

const gui = new GUI();
gui.add(settings, 'variation', Object.keys(VARIATIONS)).name('Point set').onChange((v: string) => select(v));
gui.add({ regenerate: () => select(settings.variation) }, 'regenerate').name('↻ Regenerate');

await select(settings.variation);
camera.updateViewMatrix();

/* ------------------------------------------------------------------ render loop */

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function frame() {
    time.value = performance.now() / 1000;
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
