import * as g from 'gpucat';
import { d } from 'gpucat';
import { type Vec2, vec2 } from 'math';
import { circumcircle } from 'math/geometry';
import { circle } from 'math/shapes';
import { easing } from 'math/time';
import { rainbowLineColor, time } from './common/rainbow';
import { createRenderer } from './common/renderer';

// A triangle that morphs between shapes, with its circumcircle (math's
// circumcircle) recomputed every frame. As the triangle flattens toward
// degenerate the circumcircle balloons — watch the circumradius readout. The
// ring is drawn with the flowing brand rainbow (see common/rainbow).

/* shapes */

type Tri = [Vec2, Vec2, Vec2];
const SHAPES: { name: string; tri: Tri }[] = [
    {
        name: 'equilateral',
        tri: [
            [0, 1.15],
            [-1, -0.58],
            [1, -0.58],
        ],
    },
    {
        name: 'right',
        tri: [
            [-1, -0.7],
            [1, -0.7],
            [1, 1],
        ],
    },
    {
        name: 'obtuse',
        tri: [
            [-1.2, -0.35],
            [1.2, -0.35],
            [0.35, 0.15],
        ],
    },
    {
        name: 'sliver',
        tri: [
            [-1.25, -0.12],
            [1.25, -0.16],
            [0.1, 0.06],
        ],
    },
    {
        name: 'scalene',
        tri: [
            [-0.95, -0.75],
            [1.05, -0.45],
            [0.05, 1.05],
        ],
    },
];
const SHAPE_DURATION = 2.6; // seconds per morph

/* renderer */

const renderer = await createRenderer({ antialias: true });

const canvas = renderer.domElement as HTMLCanvasElement;
document.body.appendChild(canvas);
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new g.Scene();

const camera = new g.PerspectiveCamera(Math.PI / 4, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position[2] = 6;
scene.add(camera);

const controls = new g.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

/* objects */

// morphing triangle outline (neutral) and its circumcircle (rainbow ring)
const triPoints = new Float32Array(9);
const triGeometry = new g.LineGeometry(triPoints, true, 3);
const triangle = new g.Line(triGeometry, new g.LineMaterial({ color: g.vec4f(0.85, 0.88, 0.95, 1), lineWidth: 4 }));
scene.add(triangle);

const CIRCLE_SEGMENTS = 128;
const circlePoints = new Float32Array(CIRCLE_SEGMENTS * 3);
const circleGeometry = new g.LineGeometry(circlePoints, true, CIRCLE_SEGMENTS);
const circleLine = new g.Line(circleGeometry, new g.LineMaterial({ color: rainbowLineColor(1, 2), lineWidth: 5 }));
scene.add(circleLine);

// dots: 3 triangle vertices + the circumcenter
const dotGeometry = g.createSphereGeometry(0.05, 16, 12);
function makeDot(rgb: [number, number, number]): g.Mesh {
    const pos = g.attribute('position', d.vec3f);
    const clip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.mul(g.modelWorldMatrix, g.vec4(pos, g.f32(1)))));
    const material = new g.Material({ vertex: clip, fragment: g.vec4f(rgb[0], rgb[1], rgb[2], 1) });
    const mesh = new g.Mesh(dotGeometry, material);
    scene.add(mesh);
    return mesh;
}
const vertexDots = [makeDot([0.95, 0.96, 1]), makeDot([0.95, 0.96, 1]), makeDot([0.95, 0.96, 1])];
const centerDot = makeDot([1.0, 0.243, 0.647]);

/* name wheel + readout */

// a picker-style column of the shape names (DOM overlay). the column scrolls so
// the active shape sits at the vertical centre, dimming and shrinking with
// distance — driven from the same eased morph index as the triangle.
const ROW_HEIGHT = 46;
const wheel = document.createElement('div');
wheel.style.cssText = 'position:absolute;left:40px;top:50%;width:220px;height:0;pointer-events:none;font-family:var(--mc-mono)';
document.body.appendChild(wheel);
const wheelRows = SHAPES.map((shape) => {
    const el = document.createElement('div');
    el.textContent = shape.name;
    el.style.cssText = 'position:absolute;left:0;white-space:nowrap;transform-origin:left center;text-shadow:0 1px 3px #000';
    wheel.appendChild(el);
    return el;
});

function updateWheel(continuousIndex: number) {
    const n = SHAPES.length;
    const active = ((continuousIndex % n) + n) % n;
    for (let i = 0; i < n; i++) {
        // shortest signed distance from the active row, wrapped into [-n/2, n/2)
        let dist = i - active;
        dist = ((dist % n) + n) % n;
        if (dist > n / 2) dist -= n;
        const k = Math.min(Math.abs(dist) / 2.5, 1);
        const y = dist * ROW_HEIGHT;
        wheelRows[i].style.transform = `translateY(${y}px) translateY(-50%) scale(${1 - k * 0.4})`;
        wheelRows[i].style.opacity = `${1 - k * 0.82}`;
        const isActive = Math.abs(dist) < 0.5;
        wheelRows[i].style.color = isActive ? '#ff3ea5' : '#eceff1';
        wheelRows[i].style.fontWeight = isActive ? '700' : '500';
        wheelRows[i].style.fontSize = '26px';
    }
}

// small circumradius readout
const readout = document.createElement('div');
readout.className = 'mc-info';
readout.style.left = '40px';
readout.style.bottom = '24px';
document.body.appendChild(readout);

/* render */

const a = vec2.create();
const b = vec2.create();
const c = vec2.create();
const circ = circle.create();

const scenePass = g.pass(scene, camera);
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

function setDot(dot: g.Mesh, x: number, y: number) {
    dot.position[0] = x;
    dot.position[1] = y;
    dot.position[2] = 0;
}

function frame(tms: number) {
    const t = tms / 1000;
    time.value = t;

    // morph between shapes with an eased blend
    const tt = t / SHAPE_DURATION;
    const idx = Math.floor(tt) % SHAPES.length;
    const next = (idx + 1) % SHAPES.length;
    const local = easing.cubicInOut(tt - Math.floor(tt));
    vec2.lerp(a, SHAPES[idx].tri[0], SHAPES[next].tri[0], local);
    vec2.lerp(b, SHAPES[idx].tri[1], SHAPES[next].tri[1], local);
    vec2.lerp(c, SHAPES[idx].tri[2], SHAPES[next].tri[2], local);

    // math: circumcircle of the current triangle
    circumcircle(circ, a, b, c);

    // triangle outline
    triPoints[0] = a[0];
    triPoints[1] = a[1];
    triPoints[3] = b[0];
    triPoints[4] = b[1];
    triPoints[6] = c[0];
    triPoints[7] = c[1];
    triGeometry.update(triPoints, true);

    // circumcircle ring
    for (let i = 0; i < CIRCLE_SEGMENTS; i++) {
        const ang = (i / CIRCLE_SEGMENTS) * Math.PI * 2;
        circlePoints[i * 3] = circ.center[0] + Math.cos(ang) * circ.radius;
        circlePoints[i * 3 + 1] = circ.center[1] + Math.sin(ang) * circ.radius;
    }
    circleGeometry.update(circlePoints, true);

    setDot(vertexDots[0], a[0], a[1]);
    setDot(vertexDots[1], b[0], b[1]);
    setDot(vertexDots[2], c[0], c[1]);
    setDot(centerDot, circ.center[0], circ.center[1]);

    updateWheel(Math.floor(tt) + local); // eased continuous index, in sync with the morph
    readout.textContent = `circumradius: ${circ.radius.toFixed(2)}`;

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    controls.update();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
