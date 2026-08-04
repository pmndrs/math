import * as g from 'gpucat';
import { simplex2d } from 'maath/noise';
import { mulberry32 } from 'maath/random';
import { rainbowLineColor, time } from './common/rainbow';

// A flow field: hundreds of particles advected along an angle field derived from
// maath's simplex2d noise, leaving fading rainbow trails. Each particle reads
// the noise at its position to pick a heading, drifts along it, and respawns when
// it wanders off or ages out — so the field is continuously traced by streams.

const PARTICLES = 2200;
const TRAIL = 20; // positions kept per particle
const FREQ = 0.5; // noise sampling scale
const DRIFT = 0.03; // how fast the field itself scrolls
const TURNS = 1.5; // noise (-1..1) -> angle * PI * TURNS
const SPEED = 0.5; // world units per second
const SPAWN_X = 3; // particles spawn in this rectangle...
const SPAWN_Y = 2;
const BOUND_X = 3.4; // ...and respawn once they drift past this one
const BOUND_Y = 2.4;

const noise = simplex2d.create(1);
const rng = mulberry32.create(42);

// per-particle current position, age, lifetime, and a trail of recent positions
const px = new Float32Array(PARTICLES);
const py = new Float32Array(PARTICLES);
const age = new Float32Array(PARTICLES);
const maxAge = new Float32Array(PARTICLES);
const trailX = new Float32Array(PARTICLES * TRAIL);
const trailY = new Float32Array(PARTICLES * TRAIL);

function respawn(p: number) {
    const x = (mulberry32.sample(rng) * 2 - 1) * SPAWN_X;
    const y = (mulberry32.sample(rng) * 2 - 1) * SPAWN_Y;
    px[p] = x;
    py[p] = y;
    age[p] = 0;
    maxAge[p] = 2 + mulberry32.sample(rng) * 4;
    for (let k = 0; k < TRAIL; k++) {
        trailX[p * TRAIL + k] = x;
        trailY[p * TRAIL + k] = y;
    }
}
for (let p = 0; p < PARTICLES; p++) respawn(p);

/* ------------------------------------------------------------------ renderer */

const renderer = new g.WebGPURenderer({ antialias: true });
await renderer.init();

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[2] = 4.6;
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

/* ------------------------------------------------------------------ trails */

// one line segment per consecutive pair of trail positions, across all particles
const SEGMENTS = PARTICLES * (TRAIL - 1);
const segmentPoints = new Float32Array(SEGMENTS * 2 * 3);
const trailsGeometry = new g.LineSegmentsGeometry(segmentPoints, SEGMENTS * 2);
const trails = new g.LineSegments(trailsGeometry, new g.LineMaterial({ color: rainbowLineColor(1, 2.5), lineWidth: 2.5 }));
scene.add(trails);

/* ------------------------------------------------------------------ render */

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

let last = -1;

function frame(tms: number) {
    const t = tms / 1000;
    time.value = t;
    if (last < 0) last = t;
    const dt = Math.min(t - last, 0.05);
    last = t;

    for (let p = 0; p < PARTICLES; p++) {
        // heading from the (slowly drifting) noise field, then advect
        const angle = simplex2d.sample(noise, px[p] * FREQ + t * DRIFT, py[p] * FREQ) * Math.PI * TURNS;
        px[p] += Math.cos(angle) * SPEED * dt;
        py[p] += Math.sin(angle) * SPEED * dt;
        age[p] += dt;

        if (age[p] > maxAge[p] || px[p] < -BOUND_X || px[p] > BOUND_X || py[p] < -BOUND_Y || py[p] > BOUND_Y) {
            respawn(p);
        } else {
            // shift the trail and append the new position
            const base = p * TRAIL;
            for (let k = 0; k < TRAIL - 1; k++) {
                trailX[base + k] = trailX[base + k + 1];
                trailY[base + k] = trailY[base + k + 1];
            }
            trailX[base + TRAIL - 1] = px[p];
            trailY[base + TRAIL - 1] = py[p];
        }
    }

    // rebuild the segment buffer
    let s = 0;
    for (let p = 0; p < PARTICLES; p++) {
        const base = p * TRAIL;
        for (let k = 0; k < TRAIL - 1; k++) {
            segmentPoints[s++] = trailX[base + k];
            segmentPoints[s++] = trailY[base + k];
            segmentPoints[s++] = 0;
            segmentPoints[s++] = trailX[base + k + 1];
            segmentPoints[s++] = trailY[base + k + 1];
            segmentPoints[s++] = 0;
        }
    }
    trailsGeometry.update(segmentPoints);

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
