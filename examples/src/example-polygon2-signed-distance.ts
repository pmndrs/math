import * as g from 'gpucat';
import { d } from 'gpucat';
import { polar, vec2 } from 'math';
import { polygon2 } from 'math/shapes';
import { createPanel } from './common/dash';
import { createInfo } from './common/info';
import { ink, light, pixels } from './common/ink';
import { createRenderer } from './common/renderer';
import { clearColor, spectrum } from './common/theme';

// The shape is never drawn as a shape. A lattice of probes each asks math's
// polygon2 two questions every frame - how far am I from this outline, and
// where is the nearest point on it - and the answers alone draw the picture.
//
// polygon2.signedDistance gives each probe its colour and size. Cyan marks
// inside and white marks outside. Larger dots at regular distance intervals
// trace contours, including the zero contour along the outline.
//
// polygon2.closestPoint aims a needle from every probe at the nearest point on
// the outline, turning the gradient of that field into a flow. It is off by
// default, because a needle at every probe is a lot of ink over a picture that
// already reads.
//
// The outline itself is built in polar coordinates, one radius per angle, and
// converted with polar.toVec2 - so the concavities that make the distance field
// interesting are a couple of sine terms rather than a hand-placed path.

const VERTS = 36; // outline points
const BASE = 0.55;
const VIEW = 1.5; // half-height of the world the probes cover
const SPAN = 2.9; // half-width
// the camera sees this much more than the lattice covers, so the field sits
// inset with clear space around it rather than running under the gallery's
// title and description
const PAD = 1.74;
const MAX_COLUMNS = 96;
const NEEDLE = 0.085; // the longest a needle is drawn, whatever the distance
const DOT = 0.02; // contour probes are larger than the background samples
const ACCENT = spectrum[6];
// the dots are spheres, so they occupy depth either side of z = 0. Needles and
// the outline sit above that, or they draw inside the very probes they belong to
const Z_NEEDLE = 0.03;
const Z_OUTLINE = 0.05;

/* the outline */

const _shape_polar = polar.create();
const _shape_point = vec2.create();

// the polygon itself, flat [x0, y0, x1, y1, ...], which is the representation
// every polygon2 function reads. It is only ever an input - what gets drawn is
// what the probes report about it
const polygon: number[] = new Array(VERTS * 2).fill(0);
const center = vec2.create();

/** Rebuilds the outline as a radius per angle, wobbled by two harmonics. */
function shape(time: number): void {
    for (let i = 0; i < VERTS; i++) {
        const theta = (i / VERTS) * Math.PI * 2;
        const radius = BASE * (1 + 0.3 * Math.sin(3 * theta + time * 0.7) + 0.16 * Math.sin(5 * theta - time * 0.5));
        polar.set(_shape_polar, radius, theta);
        polar.toVec2(_shape_point, _shape_polar);
        polygon[i * 2] = _shape_point[0] + center[0];
        polygon[i * 2 + 1] = _shape_point[1] + center[1];
    }
}

/* probes */

const settings = { columns: 72, band: 0.26, needles: false, outline: false };

const probeX: number[] = [];
const probeY: number[] = [];
let probeCount = 0;

function layout(): void {
    probeX.length = 0;
    probeY.length = 0;
    const columns = Math.round(settings.columns);
    const rows = Math.max(2, Math.round((columns * VIEW) / SPAN));
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            probeX.push(-SPAN + ((col + 0.5) / columns) * SPAN * 2);
            probeY.push(-VIEW + ((row + 0.5) / rows) * VIEW * 2);
        }
    }
    probeCount = probeX.length;
}
layout();

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
    camera.top = VIEW * PAD;
    camera.bottom = -VIEW * PAD;
    camera.left = -camera.top * (window.innerWidth / window.innerHeight);
    camera.right = -camera.left;
    camera.updateProjectionMatrix();
}
fitCamera();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    fitCamera();
});

/* dots */

const MAX_PROBES = MAX_COLUMNS * Math.ceil((MAX_COLUMNS * VIEW) / SPAN);

// instanced spheres, per-probe vec4 = (x, y, inside, contour)
const dotData = new Float32Array(MAX_PROBES * 4);
const dotBuffer = new g.GpuBuffer(d.array(d.vec4f), { data: dotData, usage: 'storage' });
const instance = g.index(g.storage(dotBuffer), g.instanceIndex);

const position = g.attribute('position', d.vec3f);
const dotWorld = g.add(
    g.mul(position, g.f32(DOT).mul(instance.w.mul(g.f32(0.7)).add(g.f32(0.3)))),
    g.vec3(instance.xy, g.f32(0)),
);
const dotClip = g.mul(g.cameraProjectionMatrix, g.mul(g.cameraViewMatrix, g.vec4(dotWorld, g.f32(1))));
const dots = new g.Mesh(
    g.createSphereGeometry(1, 8, 6),
    new g.Material({
        vertex: dotClip,
        fragment: g.vec4(g.mix(light, ink(ACCENT), g.varying(instance.z, 'v_inside')), g.f32(1)),
    }),
);
scene.add(dots);

/* needles and outline */

const needlePoints = new Float32Array(MAX_PROBES * 2 * 3);
const needleGeometry = new g.LineSegmentsGeometry(needlePoints, MAX_PROBES * 2);
const needles = new g.LineSegments(
    needleGeometry,
    new g.LineMaterial({ color: g.vec4(light, g.f32(0.85)), lineWidth: pixels(1.25), transparent: true }),
);
needles.visible = settings.needles;
scene.add(needles);

const outlinePoints = new Float32Array(VERTS * 3);
const outlineGeometry = new g.LineGeometry(outlinePoints, true, VERTS);
const outlineLine = new g.Line(outlineGeometry, new g.LineMaterial({ color: g.vec4(light, g.f32(0.9)), lineWidth: pixels(1.5) }));
// off by default: the zero contour already is the outline, and drawing it over
// the top gives the answer away
outlineLine.visible = settings.outline;
scene.add(outlineLine);

/* pointer */

let pointerInside = false;
const pointerTarget = vec2.create();

function pointerToWorld(clientX: number, clientY: number): void {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    vec2.set(pointerTarget, ndcX * camera.right, ndcY * camera.top);
}

canvas.addEventListener('pointermove', (e) => {
    pointerInside = true;
    pointerToWorld(e.clientX, e.clientY);
});
canvas.addEventListener('pointerleave', () => {
    pointerInside = false;
});

/* panel */

let queryMs = 0;

const panel = createPanel('polygon2 signed distance', ACCENT);
panel.add(settings, 'columns', { min: 24, max: MAX_COLUMNS, step: 1, label: 'Probes' }).onChange(layout);
panel.add(settings, 'band', { min: 0.05, max: 0.8, step: 0.01, label: 'Contour band' });
panel.add(settings, 'needles', { label: 'Needles' }).onChange(() => {
    needles.visible = settings.needles;
});
panel.add(settings, 'outline', { label: 'Show outline' }).onChange(() => {
    outlineLine.visible = settings.outline;
});
panel.monitor(() => probeCount, { label: 'probes' });
panel.monitor(() => queryMs, { label: 'queries', unit: 'duration' });

const readout = createInfo();
readout.innerHTML = `<span style="color:${ACCENT}">●</span> Inside · ● Outside<br>Large dots mark distance contours`;

/* render */

scene.updateWorldMatrix();
camera.updateViewMatrix();

const scenePass = g.pass(scene, camera, { clearColor, samples: 4 });
const outputNode = g.fxaa(scenePass.getTextureNode());
const renderPipeline = new g.RenderPipeline(renderer, outputNode);

const _frame_probe = vec2.create();
const _frame_closest = vec2.create();

function frame(tms: number) {
    const t = tms / 1000;

    // the shape follows the pointer, and drifts on its own until it is touched
    if (pointerInside) vec2.copy(center, pointerTarget);
    else vec2.set(center, Math.cos(t * 0.31) * 1.1, Math.sin(t * 0.43) * 0.6);
    shape(t);

    const started = performance.now();
    let needleCount = 0;
    for (let i = 0; i < probeCount; i++) {
        vec2.set(_frame_probe, probeX[i], probeY[i]);

        // negative inside, positive outside
        const distance = polygon2.signedDistance(polygon, VERTS, _frame_probe);
        const inside = distance < 0;
        const magnitude = Math.abs(distance);

        dotData[i * 4] = _frame_probe[0];
        dotData[i * 4 + 1] = _frame_probe[1];
        // the accent says which side of the outline the probe is on, and nothing else
        dotData[i * 4 + 2] = inside ? 1 : 0;
        // Larger probes mark each distance band without changing ink brightness.
        dotData[i * 4 + 3] = (magnitude / settings.band) % 1 < 0.22 ? 1 : 0;

        if (!settings.needles) continue;
        polygon2.closestPoint(_frame_closest, polygon, VERTS, _frame_probe);
        vec2.subtract(_frame_closest, _frame_closest, _frame_probe);
        const reach = Math.min(magnitude, NEEDLE) / Math.max(magnitude, 1e-9);
        needlePoints[needleCount * 6] = _frame_probe[0];
        needlePoints[needleCount * 6 + 1] = _frame_probe[1];
        needlePoints[needleCount * 6 + 2] = Z_NEEDLE;
        needlePoints[needleCount * 6 + 3] = _frame_probe[0] + _frame_closest[0] * reach;
        needlePoints[needleCount * 6 + 4] = _frame_probe[1] + _frame_closest[1] * reach;
        needlePoints[needleCount * 6 + 5] = Z_NEEDLE;
        needleCount++;
    }
    queryMs = performance.now() - started;

    dotBuffer.needsUpdate = true;
    dots.count = probeCount;
    if (needleCount > 0) needleGeometry.update(needlePoints.subarray(0, needleCount * 6));

    for (let i = 0; settings.outline && i < VERTS; i++) {
        outlinePoints[i * 3] = polygon[i * 2];
        outlinePoints[i * 3 + 1] = polygon[i * 2 + 1];
        outlinePoints[i * 3 + 2] = Z_OUTLINE;
    }
    if (settings.outline) outlineGeometry.update(outlinePoints, true);

    scene.updateWorldMatrix();
    camera.updateViewMatrix();
    renderPipeline.render();
    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
