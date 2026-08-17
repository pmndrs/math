import { dashboard } from 'dashcat';
import * as g from 'gpucat';
import { d } from 'gpucat';
import { mat4, quat, type Spherical, spherical, vec3 as v3 } from 'math';
import { rainbowRGB, time } from './common/rainbow';
import { createRenderer } from './common/renderer';

// Points spread evenly over a sphere with the Fibonacci lattice, built directly
// in math's spherical coordinates (spherical.toVec3). Each point steps one band
// down in equal-area height while turning by the golden angle (~137.5°, the
// "most irrational" turn) — so nothing ever lines up and the gaps stay even.
// The interlocking spiral arms that emerge are the same phyllotaxis a sunflower
// head uses; their counts are consecutive Fibonacci numbers. Nudge the twist
// off the golden angle and watch the spirals shear into bare spokes.

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.507°
const SPHERE_RADIUS = 2.3;

// N points on the unit sphere via the Fibonacci lattice. `turn` is the azimuthal
// step per point (radians) — the golden angle gives the even spread; anything
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

renderer.setInspector(new g.Inspector());

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const sphereGeometry = g.createSphereGeometry(1, 12, 8);

/* build the instanced point cloud */

// nearest-neighbour spacing on the sphere scales as ~1/sqrt(n); size the dots to
// match so the shell stays dense-but-distinct as N changes.
function markerRadius(n: number): number {
    return Math.max(0.009, Math.min(0.09, (SPHERE_RADIUS * 1.4) / Math.sqrt(n)));
}

function buildPoints(points: number[]): g.Mesh {
    const numPoints = points.length / 3;
    const r = markerRadius(numPoints);
    const instanceMatrices = new Float32Array(numPoints * 16);
    const t = v3.create();
    const s = v3.fromValues(r, r, r);
    const q = quat.create();
    const m = mat4.create();
    for (let i = 0; i < numPoints; i++) {
        v3.set(t, points[i * 3], points[i * 3 + 1], points[i * 3 + 2]);
        mat4.fromRotationTranslationScale(m, q, t, s);
        instanceMatrices.set(m, i * 16);
    }

    const stride = 16 * 4;
    const col0 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 0, instanced: true });
    const col1 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 16, instanced: true });
    const col2 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 32, instanced: true });
    const col3 = g.attribute(instanceMatrices, d.vec4f, { stride, offset: 48, instanced: true });
    const instanceTransform = g.mat4(col0, col1, col2, col3);

    const pos = g.attribute('position', d.vec3f);
    const nrm = g.attribute('normal', d.vec3f);
    // instanceTransform is model-local; modelWorldMatrix carries the auto-spin
    const local = g.mul(instanceTransform, g.vec4(pos, g.f32(1)));
    const world = g.mul(g.modelWorldMatrix, local);
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
    const vNormal = g.varying(g.normalize(nrm), 'v_snormal');
    const vWorld = g.varying(world.xyz, 'v_pworld');

    const lightDirection = g.vec3(0.6, 1.0, 0.8).normalize();
    const diffuse = g.Var('diffuse', vNormal.dot(lightDirection).max(g.f32(0)));
    const light = g.Var('light', g.f32(0.45).add(diffuse.mul(g.f32(0.65))));
    const base = g.Var('base', rainbowRGB(vWorld));
    const lit = g.Var('lit', base.mul(light));

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
    updateStats();
}

/* ui + stats */

const stats = document.createElement('div');
stats.className = 'mc-info';
stats.style.top = '10px';
stats.style.left = '10px';
document.body.appendChild(stats);
function updateStats() {
    const turnDeg = 137.507764 + settings.twist;
    stats.innerHTML = `points: ${settings.points}<br>turn: ${turnDeg.toFixed(3)}°<br>golden angle: 137.508°`;
}

const settings = {
    points: 800,
    twist: 0, // degrees offset from the golden angle
    spin: true,
};

const dash = dashboard();
const panel = dash.panel({ title: 'fibonacci sphere' });
panel.add(settings, 'points', { min: 24, max: 3000, step: 1, label: 'Points' }).onChange(rebuild);
panel.add(settings, 'twist', { min: -4, max: 4, step: 0.001, label: 'Twist off φ (°)' }).onChange(rebuild);
panel.add(settings, 'spin', { label: 'Auto-spin' });

rebuild();
camera.updateProjectionMatrix();
camera.updateViewMatrix();

/* render loop */

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let spinAngle = 0;
let lastT = performance.now();

function frame() {
    const now = performance.now();
    const dt = (now - lastT) / 1000;
    lastT = now;

    time.value = now / 1000;
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
