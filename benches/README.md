# maath benches

Performance benchmarks powered by [`@pmndrs/labs`](https://github.com/pmndrs/labs) — statistically rigorous benchmarking (Mann-Whitney U, Cliff's delta, adaptive sampling) with baseline comparison.

Benches import directly from `../src`, so no build step is needed.

## Usage

Run from the repo root:

```sh
pnpm bench                # run all benches, save results with auto timestamp
pnpm bench "vec3"         # filter by file/bench name
pnpm bench "@core"        # filter by tag (@core, @noise, @vec3, @mat4, @quat)
pnpm bench -n "v1.0.0" -b # save with a name and set as baseline
pnpm bench compare        # compare latest run against the baseline
pnpm bench run            # run without saving
```

Results are saved to `.labs/` (gitignored). Comparisons only report a change when it is statistically significant and the effect size is meaningful — see the labs README for details.

## Writing a bench

Benches use a generator: code before `yield` is setup, the yielded function is measured, code after is teardown. Chain `.gc('inner')` to force GC between samples.

```ts
import { bench, group } from '@pmndrs/labs';

group('my group @mytag', () => {
  bench('my bench', function* () {
    // setup
    yield () => {
      // measured
    };
    // teardown
  }).gc('inner');
});
```
