# Math motion studies

A monochrome film of twenty-seven mathematical constructions, chosen for their ties to interactive 3D and to the package's own examples, cut at one constant beat from the first frame. The pace never changes. The beat, the shutter, the title hold and the mark hold are all set at the top of `sequence/cuts.ts`, and the film's length follows from them: at the default 22-frame beat the film runs about 14 seconds. Over the last twenty-one cuts the shutter strobes: each cut pulses on and off in equal lengths for its whole beat while thin bands of white accumulate into the install command. The first pulse shows the cut's own study; every later pulse recalls another screen from the edit, striding through the film, so the strobe flickers through different studies rather than one. Every pulse prints a band of the type's outline, slipped a few units sideways so the outline reads as glitched, and the bands thicken along the same ramp, so the outline builds in hairlines at first and in slabs during the final burst. The solid fill only arrives with the closing sweep. The pulses tighten from a fully open beat down to two frames, so the flicker quickens to fifteen times a second by the end, the whole frame pushes in slowly, and as the last exposure closes the type sweeps shut and the push releases with a spring. Once the type has closed, the talk's glitter starfield fades in behind it and keeps twinkling under the mark. It is ported from the talk's TSL shader to Canvas 2D in `view/glitter.ts`: a lattice of tilted facets catches specular glints from a drifting light, the facets wobble on their own clocks so the glints twinkle, and a ring around the light tints them through the spectrum. A drop of stillness before the sweep is available in `sequence/cuts.ts` and set to zero beats. Each cut arrives with a subtle scale-up and vertical settle driven by an underdamped Math spring. Its response shortens with the shot duration, with a small overshoot and rebound. The spring solves from the cut’s initial state at absolute local time, keeping playback and seeking identical. During the countdown, each scene deposits some of its white linework inside `npm i math`. The last construction flattens into a sweeping finish that fills the outlined type solid. The type holds for a set number of beats, then the pmndrs mark cuts in on the same spot with the same settle and holds to the end. Every study appears once, and playback holds on the final frame until explicitly restarted. The look follows the pmndrs brand theme from the Three.js Conf talk: a warm dark base, linework and type in the brand light, Geist Black captions, and one spectrum accent per cut for emphasis strokes and markers. Locally bundled Geist and Geist Mono keep previews and exports consistent. No network assets or audio.

```sh
pnpm install
pnpm build
pnpm dev:promo
```

From the repository root, `pnpm build:promo` builds and typechecks the standalone app. `pnpm --filter math-promo test` runs the focused playback and geometry checks.

Space pauses, R restarts, and H hides or restores the controls. Tapping the film also restores hidden controls. The timeline supports scrubbing. Choose square (the default), 4:5, or 9:16. Reduced-motion preferences pause the initial playback.

## Export

**Export film** records a complete 1080-pixel-wide clip in the browser. Keep the tab visible during recording. Chromium exports WebM. The browser chooses MP4 when WebM is unavailable.

For deterministic H.264 MP4, install FFmpeg and Playwright Chromium, then run:

```sh
pnpm --filter math-promo exec playwright install chromium
pnpm --filter math-promo render
pnpm --filter math-promo render renders/math-vertical.mp4 9:16 60
pnpm --filter math-promo render renders/math-portrait.mp4 4:5 60
```

The offline renderer samples every frame at an absolute time, including the exact cut points, regardless of rendering speed. Output defaults to `promo/renders/math-motion-studies.mp4`, 1080 × 1080, 60 fps. The render folder is ignored by Git.

Preview parameters: `?paused&t=20&clean&format=9:16&width=1080`. `window.promo.seek(seconds)` renders a deterministic frame for capture.

## Domains

The structure follows the domain-oriented Koota pattern in `minecraft-like`:

- `time`: playback state and clock advancement.
- `sequence`: cut timings and active study selection.
- `forms`: study entities, preallocated geometry, and mathematical constructions.
- `view`: quaternion projection, depth-banded wireframes, the theme, the glitter sky, and graphic layout.
- `reveal`: accumulated geometry imprints, the install-command finish, and the mark.
- `capture`: browser recording. The offline encoder lives in `scripts`.

`world.ts` assembles traits and entities. `frameloop.ts` owns system order. Koota holds the clock, edit, render workspaces, and one entity per study in the cut. Math supplies vectors, quaternion and dual-quaternion transforms, noise, circumcircles, triangulation, convex hulls, signed distances, FABRIK, springs, and easing. Canvas 2D renders linework, solid faces, particles, and typography without GPU or shader requirements.

Trait files contain only data models and their default storage. Actions initialize configured state, and systems implement behavior.

Edit every timing in `sequence/cuts.ts`, captions in `forms/actions.ts`, and composition in `view/systems.ts`. `forms/constructions.ts` contains planar geometry, `forms/dynamics.ts` handles motion studies including frustum culling, where a panning camera's six planes light up the pillars they contain, `forms/volumes.ts` handles skinning and voxels, and `forms/patterns.ts`, `forms/rapid.ts` and `forms/shutter.ts` hold the surfaces, curves and polyhedra. The edit in `sequence/cuts.ts` lists which studies appear; `forms/actions.ts` defines more than the edit uses, and any of them can be swapped in by index. Configured workspaces and cached simulations initialize in `forms/setup.ts`.

`view/geometry.ts` projects and draws the constructions for both live playback and the reveal. `reveal/actions.ts` precomputes one cumulative text imprint per pulse from those same drawings, sampled at the moment each pulse closes. Narrow, slanted exposure bands keep each cut from completing the type too early. `reveal/systems.ts` layers the retained ink over the live scene, printing each new band as its pulse closes, then compresses the last drawing and fills the remaining letter shapes with a fast sweep and a damped scale overshoot. The imprints are cached so direct seeking and offline rendering match continuous playback.

The first five cuts demo the package's headline features: a constrained 3D FABRIK structure (a spine held in a cone with two arms on free hinges and ball joints, each reaching its own target), frustum culling, closed-form springs, the 3D convex hull of a breathing point cloud, and dual-quaternion skinning. Seventeen studies adapt the package's examples in all: those plus circumcircle, flow-field, fabrik-2d, polygon2-triangulation, polygon2-signed-distance, convex-hull-2d, circle-physics, easing, ridged-noise-voxel-terrain, fibonacci-sphere, simplex noise and quaternion rotation. The other ten are 3D forms: the Lorenz attractor, a torus knot, the Möbius strip, a helicoid, a superellipsoid, a torus, an ellipsoid, a double helix, a tetrahedron and an octahedron. The flow field keeps a fixed world scale and center, allowing trails to leave the canvas. Quaternion projection turns the 3D studies at 0.6 radians per second with a gentle changing tilt.

Forms use fixed-capacity buffers with at most 8,000 vertices and 4,000 triangles each. Only the active form updates. Line generation is O(vertices), with bounded Fourier sums and FABRIK iterations. Distance contours use a bounded radial search against a star-shaped polygon. Convex hulls compute once and use an affine animation that preserves their topology. Three suspended helical springs use different damping and settling times, circular weights, and faint equilibrium guides. Their cached response plays at twice simulation speed to read within the short cut. Spring and collision motion sample cached 60 Hz simulations, while other geometry recomputes from absolute time. Lorenz uses fixed-step Euler integration for a visual study, not a scientific solver. Seeking does not depend on playback history.

Fonts are from Geist 1.7.2, distributed under the bundled SIL Open Font License. The pmndrs mark is drawn from the geometry in [pmndrs/branding](https://github.com/pmndrs/branding) (MIT).
