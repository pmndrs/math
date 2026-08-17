# math

math is a collection of math helpers for graphics and simulations.

- **High performance**: allocation-free, monomorphic, benchmarked
- **Tiny**: mean and lean, tree-shakable, only pay for what you use
- **Portable**: interops with WebGL, WebGPU, Wasm, your favourite renderer, more.
- **Data-oriented**: data-in, data-out functions over caller-owned data, without owning the data lifecycle.

```sh
> npm install math@canary
```

## Quick Start

<Snippet source="./quick-start.ts" select="core" />

The library is grouped by domain behind subpath entrypoints. All APIs are highly tree-shakeable, only pay for what you use:

<Snippet source="./modules.ts" select="modules" />

## Examples

<Examples />

## Documentation

- **[API.md](./API.md)** — every export with its signature and a one-line description, grouped by module. Flat and greppable, so it's easy to search or hand to an AI coding assistant.
- **[Online API docs](https://pmndrs.github.io/math/docs/)** — the full typedoc reference, with search and cross-links.
- **[What's inside](#whats-inside)** — jump straight to a module or namespace.

## What's inside

<ApiGroups />

## Acknowledgements:

- The vec*, quat*, mat* code started life as a port of mathcat, which started as a TypeScript port of glMatrix (https://glmatrix.net/)
- The simplex noise is adapted from https://github.com/josephg/noisejs
