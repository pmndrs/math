import * as g from 'gpucat';
import { d } from 'gpucat';
import { mat3, quat, type Vec3 } from 'math';
import { box3, type Box3, obb3, type OBB3, sphere, type Sphere } from 'math/shapes';
import { createPanel } from './common/dash';
import { rainbowRGB, time } from './common/rainbow';
import { createRenderer } from './common/renderer';

// A lattice of points, and three shapes from math/shapes drifting through it: an
// axis-aligned box (box3), a spinning oriented box (obb3), and a pulsing sphere.
// Every frame each point asks the shapes `containsPoint` — inside points glow the
// flowing rainbow, outside points fade to a faint lattice. The solids are never
// drawn; you see them purely as the region of lit points they carve out. The
// oriented box is the one to watch: its containsPoint projects each point onto
// the box's own rotated axes, so the glowing slab tumbles with it.

const N = 20; // points per axis
const EXTENT = 3.0; // half-width of the lattice cube
const MARKER = 0.05;
const COUNT = N * N * N;

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[0] = 6.5;
camera.position[1] = 5;
camera.position[2] = 7.5;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* lattice: static per-instance transforms + a live per-instance intensity */

const positions: Vec3[] = [];
const instanceMatrices = new Float32Array(COUNT * 16);
let idx = 0;
for (let ix = 0; ix < N; ix++) {
    for (let iy = 0; iy < N; iy++) {
        for (let iz = 0; iz < N; iz++) {
            const x = -EXTENT + (ix / (N - 1)) * 2 * EXTENT;
            const y = -EXTENT + (iy / (N - 1)) * 2 * EXTENT;
            const z = -EXTENT + (iz / (N - 1)) * 2 * EXTENT;
            positions.push([x, y, z]);
            // translation + uniform scale, column-major
            const o = idx * 16;
            instanceMatrices[o + 0] = MARKER;
            instanceMatrices[o + 5] = MARKER;
            instanceMatrices[o + 10] = MARKER;
            instanceMatrices[o + 12] = x;
            instanceMatrices[o + 13] = y;
            instanceMatrices[o + 14] = z;
            instanceMatrices[o + 15] = 1;
            idx++;
        }
    }
}

// per-instance glow, eased toward its inside/outside target each frame
const intensity = new Float32Array(COUNT);
const intensityBuffer = g.createVertexBuffer(d.f32, intensity);

const sphereGeometry = g.createSphereGeometry(1, 8, 6);

const stride = 16 * 4;
const col0 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 0, instanced: true });
const col1 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 16, instanced: true });
const col2 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 32, instanced: true });
const col3 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 48, instanced: true });
const instanceTransform = g.mat4(col0, col1, col2, col3);
const instanceGlow = g.attribute(intensityBuffer, { stride: 4, offset: 0, instanced: true });

const pos = g.attribute('position', d.vec3f);
const nrm = g.attribute('normal', d.vec3f);
// inside points swell, outside points shrink — so the lit region reads boldly
const grow = g.mul(pos, g.f32(0.5).add(instanceGlow.mul(g.f32(1.2))));
const world = g.mul(instanceTransform, g.vec4(grow, g.f32(1)));
const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
const vNormal = g.varying(g.normalize(nrm), 'v_n');
const vWorld = g.varying(world.xyz, 'v_w');
const vGlow = g.varying(instanceGlow, 'v_g');

const lightDirection = g.vec3(0.5, 1.0, 0.7).normalize();
const diffuse = g.Var('diffuse', vNormal.dot(lightDirection).max(g.f32(0)));
const shade = g.Var('shade', g.f32(0.55).add(diffuse.mul(g.f32(0.55))));
const rainbow = g.Var('rainbow', rainbowRGB(vWorld));
// outside: a faint lattice; inside: full rainbow, lit and glowing
const dim = g.Var('dim', rainbow.mul(g.f32(0.08)));
const lit = g.Var('lit', rainbow.mul(shade));
const color = g.Var('color', g.mix(dim, lit, vGlow));
const material = new g.Material({ vertex: clip, fragment: g.vec4(color, g.f32(1)) });

const points = new g.Mesh(sphereGeometry, material);
points.count = COUNT;
scene.add(points);
scene.updateWorldMatrix();

/* the three shapes (never drawn — only their containsPoint matters) */

const aabb: Box3 = box3.create();
const obb: OBB3 = obb3.create();
obb.halfExtents = [1.9, 0.6, 1.9]; // a slab, so the rotation reads clearly
const sph: Sphere = sphere.create();
const spin = quat.create();
const SPIN_AXIS: Vec3 = [0.32, 0.9, 0.28];

const settings = { speed: 1, box: true, obb: true, sphere: true };

/* ui */

const panel = createPanel('contains point');
panel.add(settings, 'speed', { min: 0, max: 3, step: 0.01, label: 'Speed' });
panel.add(settings, 'box', { label: 'AABB (box3)' });
panel.add(settings, 'obb', { label: 'OBB (obb3)' });
panel.add(settings, 'sphere', { label: 'Sphere' });
let insideCount = 0;
panel.monitor(() => insideCount, { label: 'inside' });

/* render loop */

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let clock = 0;
let lastT = performance.now();

function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    clock += dt * settings.speed;
    time.value = now / 1000;

    // animate the shapes along their own drifting paths
    box3.setFromCenterAndSize(aabb, [Math.sin(clock * 0.5) * 1.7, Math.cos(clock * 0.37) * 1.4, Math.cos(clock * 0.6) * 1.7], [2.6, 2.6, 2.6]);

    obb.center = [Math.cos(clock * 0.43) * 1.7, Math.sin(clock * 0.6) * 1.3, Math.sin(clock * 0.31) * 1.7];
    quat.setAxisAngle(spin, SPIN_AXIS, clock * 0.9);
    mat3.fromQuat(obb.rotation, spin);

    sph.center = [Math.sin(clock * 0.66) * 1.9, Math.sin(clock * 0.5 + 1) * 1.5, Math.cos(clock * 0.48) * 1.9];
    sph.radius = 1.3 + Math.sin(clock * 1.1) * 0.4;

    // every lattice point asks the shapes whether it's inside
    const k = Math.min(1, dt * 9); // glow-fade rate
    insideCount = 0;
    for (let i = 0; i < COUNT; i++) {
        const p = positions[i];
        const inside =
            (settings.box && box3.containsPoint(aabb, p)) ||
            (settings.obb && obb3.containsPoint(obb, p)) ||
            (settings.sphere && sphere.containsPoint(sph, p));
        if (inside) insideCount++;
        intensity[i] += ((inside ? 1 : 0) - intensity[i]) * k;
    }
    intensityBuffer.needsUpdate = true;

    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
