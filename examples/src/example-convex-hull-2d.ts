import * as g from 'gpucat';
import { d } from 'gpucat';
import { mat4, vec4 } from 'math';
import { quickhull2 } from 'math/geometry';
import { mulberry32 } from 'math/random';
import { rainbowLineColor, rainbowRGB, time } from './common/rainbow';

// A drifting 2D point cloud with its convex hull (math's quickhull2)
// recomputed every frame. As points wander in and out of the boundary the hull
// polygon morphs and points light up (rainbow markers) when they join it.
// One point is yours: move the mouse (or drag a finger) and it steers to the
// pointer, so you can push it onto the hull and watch quickhull2 re-solve live.
// Nothing special about that point's look — it's driven by data, so it goes grey
// like the rest when off the hull and lights up like the rest when on it. The
// screen point is unprojected onto the z=0 plane with math (inverse view·proj).

const POINT_COUNT = 16;
const CONTROLLED = 0; // this point follows the pointer while you interact

/* ------------------------------------------------------------------ drifters */

// each point = base position + a slow sinusoidal wobble (seeded for determinism)
type Drifter = { bx: number; by: number; ax: number; ay: number; fx: number; fy: number; px: number; py: number };
const rng = mulberry32.create(7);
const drifters: Drifter[] = [];
for (let i = 0; i < POINT_COUNT; i++) {
    const br = Math.sqrt(mulberry32.sample(rng)) * 1.3;
    const ba = mulberry32.sample(rng) * Math.PI * 2;
    drifters.push({
        bx: Math.cos(ba) * br,
        by: Math.sin(ba) * br,
        ax: 0.2 + mulberry32.sample(rng) * 0.45,
        ay: 0.2 + mulberry32.sample(rng) * 0.45,
        fx: 0.25 + mulberry32.sample(rng) * 0.6,
        fy: 0.25 + mulberry32.sample(rng) * 0.6,
        px: mulberry32.sample(rng) * Math.PI * 2,
        py: mulberry32.sample(rng) * Math.PI * 2,
    });
}

/* ------------------------------------------------------------------ renderer */

const renderer = new g.WebGPURenderer({ antialias: true });
await renderer.init();

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.style.touchAction = 'none';

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[2] = 5.5;
scene.add(camera);

// single-pointer drag is reserved for steering a point, so the orbit controls
// keep only wheel / pinch zoom (no rotate or pan grabbing the pointer).
const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enableRotate = false;
controls.enablePan = false;

renderer.setInspector(new g.Inspector());

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* ------------------------------------------------------------------ objects */

// hull outline (rainbow, closed) — allocated for the worst case (all points on hull)
const hullPoints = new Float32Array(POINT_COUNT * 3);
const hullGeometry = new g.LineGeometry(hullPoints, true, POINT_COUNT);
const hullLine = new g.Line(hullGeometry, new g.LineMaterial({ color: rainbowLineColor(1, 2.5), lineWidth: 3 }));
scene.add(hullLine);

// two shared materials: grey for interior points, rainbow for hull vertices
function unlitMaterial(fragment: g.Node<typeof d.vec4f>): g.Material {
    const pos = g.attribute('position', d.vec3f);
    const world = g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)));
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, world));
    return new g.Material({ vertex: clip, fragment });
}
const greyMaterial = unlitMaterial(g.vec4f(0.42, 0.42, 0.48, 1));

const rainbowPos = g.attribute('position', d.vec3f);
const rainbowWorld = g.mul(g.modelWorldMatrix, g.vec4(rainbowPos, g.f32(1)));
const rainbowClip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, rainbowWorld));
const rainbowVWorld = g.varying(rainbowWorld.xyz, 'v_mworld');
const markerMaterial = new g.Material({ vertex: rainbowClip, fragment: g.vec4(rainbowRGB(rainbowVWorld, 2.5), g.f32(1)) });

const dotGeometry = g.createSphereGeometry(0.04, 16, 12);
const markerGeometry = g.createSphereGeometry(0.07, 16, 12);

const pointDots: g.Mesh[] = [];
const hullMarkers: g.Mesh[] = [];
for (let i = 0; i < POINT_COUNT; i++) {
    const dot = new g.Mesh(dotGeometry, greyMaterial);
    scene.add(dot);
    pointDots.push(dot);
    const marker = new g.Mesh(markerGeometry, markerMaterial);
    marker.visible = false;
    scene.add(marker);
    hullMarkers.push(marker);
}

/* -------------------------------------------------------------- pointer input */

// where the steered point wants to be (world x, y on the z=0 plane)
const steerTarget: [number, number] = [0, 0];
let steering = false; // is the pointer currently driving the point?
let touchDown = false; // a finger is held (touch has no hover to steer with)

// unproject a screen point onto the z=0 plane using math (inverse of proj·view)
const invVP = mat4.create();
const rayNear = vec4.create();
const rayFar = vec4.create();
function pointerToPlane(clientX: number, clientY: number, out: [number, number]): boolean {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);

    mat4.multiply(invVP, camera.projectionMatrix, camera.matrixWorldInverse);
    mat4.invert(invVP, invVP);

    vec4.set(rayNear, ndcX, ndcY, -1, 1);
    vec4.set(rayFar, ndcX, ndcY, 1, 1);
    vec4.transformMat4(rayNear, rayNear, invVP);
    vec4.transformMat4(rayFar, rayFar, invVP);

    const nx = rayNear[0] / rayNear[3];
    const ny = rayNear[1] / rayNear[3];
    const nz = rayNear[2] / rayNear[3];
    const fx = rayFar[0] / rayFar[3];
    const fy = rayFar[1] / rayFar[3];
    const fz = rayFar[2] / rayFar[3];

    const dz = fz - nz;
    if (Math.abs(dz) < 1e-6) return false;
    const s = -nz / dz; // parameter along the ray where world z == 0
    out[0] = nx + (fx - nx) * s;
    out[1] = ny + (fy - ny) * s;
    return true;
}

function steerTo(e: PointerEvent) {
    if (pointerToPlane(e.clientX, e.clientY, steerTarget)) steering = true;
}

// desktop: steer while the pointer hovers the canvas. touch: steer while a finger is down.
canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' && !touchDown) return; // touch has no hover
    steerTo(e);
});
canvas.addEventListener('pointerdown', (e) => {
    touchDown = true;
    steerTo(e);
});
// lifting a finger stops steering; a mouse keeps steering as long as it hovers
canvas.addEventListener('pointerup', (e) => {
    touchDown = false;
    if (e.pointerType === 'touch') steering = false;
});
canvas.addEventListener('pointercancel', () => {
    touchDown = false;
    steering = false;
});
canvas.addEventListener('pointerleave', () => {
    touchDown = false;
    steering = false; // mouse left the canvas — ease the point back into its drift
});

/* ------------------------------------------------------------------ readout */

const readout = document.createElement('div');
readout.className = 'mc-info';
readout.style.left = '16px';
readout.style.top = '14px';
document.body.appendChild(readout);

/* ------------------------------------------------------------------ render */

const points: number[] = new Array(POINT_COUNT * 2).fill(0);

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function frame(tms: number) {
    const t = tms / 1000;
    time.value = t;

    // advance the points; the controlled one eases toward the pointer while
    // steering, and eases back into its drift orbit once released
    for (let i = 0; i < POINT_COUNT; i++) {
        const dr = drifters[i];
        let x = dr.bx + dr.ax * Math.sin(t * dr.fx + dr.px);
        let y = dr.by + dr.ay * Math.sin(t * dr.fy + dr.py);
        if (i === CONTROLLED) {
            const tx = steering ? steerTarget[0] : x;
            const ty = steering ? steerTarget[1] : y;
            x = points[i * 2] + (tx - points[i * 2]) * 0.3;
            y = points[i * 2 + 1] + (ty - points[i * 2 + 1]) * 0.3;
        }
        points[i * 2] = x;
        points[i * 2 + 1] = y;
        pointDots[i].position[0] = x;
        pointDots[i].position[1] = y;
    }

    // math: convex hull, indices in ccw order
    const t0 = performance.now();
    const hull = quickhull2(points);
    const hullMs = performance.now() - t0;

    // hull outline (only the K hull vertices, closed)
    for (let j = 0; j < hull.length; j++) {
        hullPoints[j * 3] = points[hull[j] * 2];
        hullPoints[j * 3 + 1] = points[hull[j] * 2 + 1];
        hullPoints[j * 3 + 2] = 0;
    }
    hullGeometry.update(hullPoints.subarray(0, hull.length * 3), true);

    // rainbow markers on the current hull vertices; hide the rest
    for (let j = 0; j < POINT_COUNT; j++) {
        const marker = hullMarkers[j];
        if (j < hull.length) {
            marker.position[0] = points[hull[j] * 2];
            marker.position[1] = points[hull[j] * 2 + 1];
            marker.visible = true;
        } else {
            marker.visible = false;
        }
    }

    const onHull = hull.includes(CONTROLLED);
    readout.innerHTML =
        `points ${POINT_COUNT} · hull ${hull.length} · quickhull2 ${hullMs.toFixed(2)}ms` +
        `<br><span class="mc-dim">steer a point with the pointer — ${onHull ? 'yours is on the hull' : 'push it onto the hull'}</span>`;

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
