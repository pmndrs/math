import * as g from 'gpucat';
import { d } from 'gpucat';
import { mat3, quat, type Vec3 } from 'math';
import { obb3, type OBB3 } from 'math/shapes';
import { createPanel } from './common/dash';
import { rainbowRGB, time } from './common/rainbow';
import { createRenderer } from './common/renderer';

// A lattice of points, and an oriented box (obb3) tumbling through it. Every
// frame each point asks obb3.containsPoint - inside points glow the flowing
// rainbow, outside points fade to a faint lattice. The box itself is never
// drawn; you see it purely as the region of lit points it carves out.
// obb3.containsPoint projects each point onto the box's own rotated axes and
// compares against its half-extents, so the glowing slab tumbles with it.

const N = 30; // points per axis
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
// inside points swell, outside points shrink - so the lit region reads boldly
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
const dim = g.Var('dim', rainbow.mul(g.f32(0.5)));
const lit = g.Var('lit', rainbow.mul(shade));
const color = g.Var('color', g.mix(dim, lit, vGlow));
// non-active points stay faint, active points fade up to solid
const alpha = g.Var('alpha', g.f32(0.2).add(vGlow.mul(g.f32(0.8))));
const material = new g.Material({
    vertex: clip,
    fragment: g.vec4(color, alpha),
    transparent: true,
    depthWrite: false,
    blend: {
        color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
        alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
    },
});

const points = new g.Mesh(sphereGeometry, material);
points.count = COUNT;
scene.add(points);
scene.updateWorldMatrix();

/* the oriented box (never drawn - only its containsPoint matters) */

const obb: OBB3 = obb3.create();
obb.halfExtents = [2.1, 0.8, 1.3]; // a distinct, non-cube box so the rotation reads clearly
const spin = quat.create();
const SPIN_AXIS: Vec3 = [0.32, 0.9, 0.28];

const settings = { speed: 1 };

/* ui */

const panel = createPanel('contains point');
panel.add(settings, 'speed', { min: 0, max: 3, step: 0.01, label: 'Speed' });
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

    // drift the box through the lattice while tumbling it about a tilted axis
    obb.center = [Math.cos(clock * 0.43) * 1.6, Math.sin(clock * 0.6) * 1.2, Math.sin(clock * 0.31) * 1.6];
    quat.setAxisAngle(spin, SPIN_AXIS, clock * 0.9);
    mat3.fromQuat(obb.rotation, spin);

    // every lattice point asks the box whether it's inside
    const k = Math.min(1, dt * 9); // glow-fade rate
    insideCount = 0;
    for (let i = 0; i < COUNT; i++) {
        const inside = obb3.containsPoint(obb, positions[i]);
        if (inside) insideCount++;
        intensity[i] += ((inside ? 1 : 0) - intensity[i]) * k;
    }
    intensityBuffer.needsUpdate = true;

    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
