import * as g from 'gpucat';
import { d } from 'gpucat';
import { mat4, quat, type Spherical, spherical, vec3 as v3 } from 'math';
import { createPanel } from './common/dash';
import { ink, light } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, palette, spectrum } from './common/theme';

// Points spread evenly over a sphere with the Fibonacci lattice, built directly
// in math's spherical coordinates (spherical.toVec3). Each point steps one band
// down in equal-area height while turning by the golden angle (~137.5 deg, the
// "most irrational" turn) - so nothing ever lines up and the gaps stay even.
// The interlocking spiral arms that emerge are the same phyllotaxis a sunflower
// head uses; their counts are consecutive Fibonacci numbers. Every 21st point
// from the pole lies on one arm, drawn in the accent. Nudge the twist off the
// golden angle and watch the spirals shear into bare spokes.

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.507 deg
const SPHERE_RADIUS = 2.3;
const ACCENT = spectrum[3];

// N points on the unit sphere via the Fibonacci lattice. `turn` is the azimuthal
// step per point (radians) - the golden angle gives the even spread; anything
// else collapses the arms into spokes.
function fibonacciPoints(n: number, turn: number): number[] {
    const s: Spherical = spherical.create();
    const p = v3.create();
    const pts: number[] = new Array(n * 3);
    for (let i = 0; i < n; i++) {
        const y = 1 - (2 * (i + 0.5)) / n; // band centre height, +1 -> -1 (equal area)
        spherical.set(s, 1, turn * i, Math.acos(y)); // [r, theta, phi]
        spherical.toVec3(p, s);
        pts[i * 3] = p[0] * SPHERE_RADIUS;
        pts[i * 3 + 1] = p[1] * SPHERE_RADIUS;
        pts[i * 3 + 2] = p[2] * SPHERE_RADIUS;
    }
    return pts;
}

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[0] = 0;
camera.position[1] = 0.6;
camera.position[2] = 6.5;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const sphereGeometry = g.createSphereGeometry(1, 12, 8);

// Hide the rear hemisphere so overlapping projections cannot merge the dots.
const shellPosition = g.attribute('position', d.vec3f);
const shellClip = g.mul(
    g.cameraProjectionMatrix,
    g.mul(g.cameraViewMatrix, g.mul(g.modelWorldMatrix, g.vec4(shellPosition, g.f32(1)))),
);
scene.add(
    new g.Mesh(
        g.createSphereGeometry(SPHERE_RADIUS * 0.997, 64, 48),
        new g.Material({ vertex: shellClip, fragment: g.vec4(ink(palette.base), g.f32(1)) }),
    ),
);

/* build the instanced point cloud */

// nearest-neighbour spacing on the sphere scales as ~1/sqrt(n); size the dots to
// match so the shell stays dense-but-distinct as N changes.
function markerRadius(n: number): number {
    return Math.max(0.006, Math.min(0.06, (SPHERE_RADIUS * 0.42) / Math.sqrt(n)));
}

function buildPoints(points: number[]): g.Mesh {
    const numPoints = points.length / 3;
    const r = markerRadius(numPoints);
    const instanceMatrices = new Float32Array(numPoints * 16);
    const instanceArm = new Float32Array(numPoints); // 1 = on the accent arm
    const t = v3.create();
    const s = v3.fromValues(r, r, r);
    const q = quat.create();
    const m = mat4.create();
    for (let i = 0; i < numPoints; i++) {
        v3.set(t, points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
        mat4.fromRotationTranslationScale(m, q, t, s);
        instanceMatrices.set(m, i * 16);
        instanceArm[i] = i % 21 === 0 ? 1 : 0;
    }

    const stride = 16 * 4;
    const col0 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 0, instanced: true });
    const col1 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 16, instanced: true });
    const col2 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 32, instanced: true });
    const col3 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 48, instanced: true });
    const instanceTransform = g.mat4(col0, col1, col2, col3);
    const instanceOnArm = g.attribute(instanceArm, d.f32, { stride: 4, offset: 0, instanced: true });

    const pos = g.attribute('position', d.vec3f);
    // instanceTransform is model-local; modelWorldMatrix carries the auto-spin
    const local = g.mul(instanceTransform, g.vec4(pos, g.f32(1)));
    const world = g.mul(g.modelWorldMatrix, local);
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
    const vArm = g.varying(instanceOnArm, 'v_arm');

    const lit = g.Var('lit', g.mix(light, ink(ACCENT), vArm));

    const material = new g.Material({ vertex: clip, fragment: g.vec4(lit, g.f32(1)) });
    const mesh = new g.Mesh(sphereGeometry, material);
    mesh.count = numPoints;
    return mesh;
}

let cloud: g.Mesh | null = null;

function rebuild() {
    const turn = GOLDEN_ANGLE + (settings.twist * Math.PI) / 180;
    const points = fibonacciPoints(settings.points, turn);
    if (cloud) scene.remove(cloud);
    cloud = buildPoints(points);
    scene.add(cloud);
}

/* ui */

const settings = {
    points: 800,
    twist: 0, // degrees offset from the golden angle
    spin: true,
};

const panel = createPanel('fibonacci sphere', ACCENT);
panel.add(settings, 'points', { min: 24, max: 3000, step: 1, label: 'Points' }).onChange(rebuild);
panel.add(settings, 'twist', { min: -4, max: 4, step: 0.001, label: 'Twist off phi (deg)' }).onChange(rebuild);
panel.add(settings, 'spin', { label: 'Auto-spin' });
panel.monitor(() => settings.points, { label: 'points' });
panel.monitor(() => 137.507764 + settings.twist, {
    label: 'turn',
    format: (v) => `${v.toFixed(3)} deg`,
    hint: 'golden angle = 137.508 deg',
});

rebuild();
camera.updateProjectionMatrix();
camera.updateViewMatrix();

/* render loop */

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let spinAngle = 0;
let lastT = performance.now();

function frame() {
    const now = performance.now();
    const dt = (now - lastT) / 1000;
    lastT = now;

    if (settings.spin && cloud) {
        spinAngle += dt * 0.25;
        quat.setAxisAngle(cloud.quaternion, [0, 1, 0], spinAngle);
    }

    controls.update();
    scene.updateWorldMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
