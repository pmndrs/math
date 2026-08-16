```sh
> npm install math
```

# math

math is a collection of math helpers for graphics and simulations.

**Features:**

- Vector, Quaternion, Euler, and Matrix math (`math`)
- Shape primitives and spatial queries (`math/shapes`)
- Computational geometry - convex hulls, circumcircle (`math/geometry`)
- Easing and spring functions (`math/time`)
- Seeded randomness utilities (`math/random`)
- Perlin and simplex noise utilities (`math/noise`)
- Color and colorspace utilities (`math/color`)
- Simple JSON-serializable data structures (no classes or typed arrays)
- Consistent output-argument-first API for allocation-free usage
- TypeScript-first, great DX for both JavaScript and TypeScript projects
- Excellent tree-shaking support, with a subpath entrypoint per module group


## Quick Start

math types are plain arrays and objects — no classes, no typed arrays — and functions write into an output argument, so hot paths allocate nothing. Because it's all plain data, results drop straight into three.js, JSON, or a Web Worker:

<Snippet source="./quick-start.ts" select="core" />

The library is grouped by domain behind subpath entrypoints. All APIs are highly tree-shakeable, only pay for what you use:

<Snippet source="./modules.ts" select="modules" />

## Examples

<Examples />

## API Documentation

<RenderAPI />

## Acknowledgements:

- The vec*, quat*, mat* code started life as a port of mathcat, which started as a TypeScript port of glMatrix (https://glmatrix.net/)
- The simplex noise is adapted from https://github.com/josephg/noisejs
