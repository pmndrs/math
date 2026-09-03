---
name: math
description: Use when writing or reviewing geometry, simulation, collision, navigation, culling, procedural generation, transforms, or other performance-sensitive algorithms with the npm `math` package, or when the user invokes /math. Not for routine arithmetic or textbook explanations.
---

# math

Write data-oriented TypeScript on top of the npm `math` package: plain data, free functions, no classes, no allocation in hot paths.

## Style

- **Functions over data.** Export functions that take typed data and operate on it. Never classes, never closures that hold state.
- **`out` first, return `out`** for composite results: `fn(out: Vec3, a: Vec3, b: Vec3): Vec3`. Scalars and booleans return directly.
- **Aliasing is allowed** (`fn(a, a, b)`). Read every input into locals before writing `out`.
- **Caller-owned state.** Long-lived state is plain data the caller allocates and owns. Functions receive it, mutate it in place, and return it. The library never owns the data lifecycle, so allocation happens once, ownership is explicit, and the object keeps one stable shape. Naming and file layout are up to the codebase. One common shape:

```ts
export function createWorld(capacity: number) {
    return { capacity, count: 0, positions: new Float32Array(capacity * 3) };
}
export type World = ReturnType<typeof createWorld>;

export function stepWorld(world: World, delta: number): World { /* mutate, return world */ }
export function getWorldPosition(out: Vec3, world: World, i: number): Vec3 { /* write out, return it */ }
```

- **Monomorphic state.** Build the object with the same keys in the same order every time. No optional fields, no keys added later.
- **Allocate at creation, never per call.** Preallocate flat or typed arrays to capacity. When full, return a count, sentinel, or status rather than growing inside a hot loop.
- **Compose `math` primitives** (`vec3`, `mat4`, `quat`, and the `math/shapes`, `math/geometry`, `math/noise`, `math/random`, `math/time` subpaths). Check the installed types before naming an API.

## Gotchas

- Module-level scratch variables are not reentrant. Pass caller-owned workspace for recursive, nested, or worker code.
- One epsilon does not fit every operation or scale. Choose each tolerance and say why.
- Define behavior for empty input, zero-length vectors, degenerate geometry, NaN, and exact boundary contact.
- Squared distance is enough for comparisons. Hoist invariant transforms out of loops.
- Spatial indexes go stale when items move without updating their bounds.
- Cheap broad phase first, exact tests only on survivors.
- Integers in the range [-2^30, 2^30) are stored in the pointer itself (V8 Smi), with no heap object. Use them for indices, handles, packed IDs, bitmasks, and counts in plain arrays and object fields. Larger integers and any float in a plain array or field box into a heap number, so keep floats in typed arrays and pin integer math with `| 0` or `>>> 0`.

Deliver the implementation with its assumptions, complexity, edge cases, and focused tests.
