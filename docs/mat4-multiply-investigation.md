# Matrix multiplication investigation

The existing `mat4.multiply` kernel remains unchanged. Reduced-product algorithms were slower, and compact kernels that improved isolated multiplication regressed the transform-hierarchy workload.

## Algorithms tested

The [48-product rational algorithm](https://arxiv.org/abs/2609.12027) uses 200 additions/subtractions and four halvings in addition to its 48 products. The current implementation uses 64 products and 48 additions.

We generated scalar, allocation-free JavaScript from the authors' [PLinOpt straight-line programs](https://github.com/jgdumas/plinopt/tree/c3047c789b14b380334fa5b16e32912a7a97186a/data), converting row-major indices to the library's column-major layout. We also tested the archive's optimized 49-product Strassen-Winograd program and a commutative Winograd paired-dot-product algorithm. Scheduling independent operations and reusing registers did not make the reduced-product implementations competitive.

A five-block exploratory Node run measured:

| Dense 4×4 multiplication | Time per product | V8 bytecodes |
| --- | ---: | ---: |
| Existing kernel | 11.10 ns | 896 |
| Scheduled 48-product formula | 30.06 ns | 2,332 |
| Scheduled 49-product formula | 24.78 ns | 1,845 |

These are independent exploratory measurements, not paired confidence estimates. The additional arithmetic and temporary values outweigh the saved products on this runtime.

## Compact kernels and caller performance

Paired measurements against `4cdc3bf5bd90af178d2eaae071c70eb6beb9d2f9` used eight interleaved Node blocks and six Chrome blocks per side. Negative values mean less time.

| Candidate | Isolated multiplication, Node | Isolated multiplication, Chrome | Hierarchy, Node | Hierarchy, Chrome |
| --- | ---: | ---: | ---: | ---: |
| Four-row loop | −16–21% | −12–22% | +5.5% | +3.1% |
| Four-column loop | −18–21% | −10–22% | +5.7% | +4.8% |

The hierarchy composes and multiplies world matrices for 4,096 nodes, then calculates scene bounds. Its regressions prevent treating the isolated gains as an overall improvement. Chrome classified its hierarchy changes as neutral under the configured practical threshold. Node classified them as slower.

The column loop shrinks multiplication from 896 to 333 bytecodes and enables inlining. However, the final hierarchy trace then stops inlining `fromRotationTranslationScale`. V8 has a 460-bytecode single-function limit, a 920-bytecode cumulative limit, and a 1.2 reservation factor. Merely fitting each function individually does not ensure the composed workload benefits. Further reducing multiplication to 320 bytecodes did not restore composition inlining and made the hierarchy 10.7% slower in Node and 9.3% slower in Chrome.

## Correctness and numerical behavior

The row, forward-column and 320-bytecode kernels each passed 120,000 exact differential cases, covering dense and affine inputs, separate output, either input aliased, both inputs aliased, signed zero, extreme magnitudes, infinities and NaNs. They preserve each output component's original arithmetic order and introduce no allocation.

All 256 pairs of matrix basis elements passed for nine experimental implementations. Another 2,001 numerical fixtures were compared with reference products evaluated from exact binary64 inputs using 800-digit decimal arithmetic.

The 48-product formula changes rounding and can amplify cancellation. For `A = diag(2^60, 2^-60, 2^30, 1)` and its inverse, the current kernel returns the identity exactly. The tested 48-product formula returns `diag(0, 0, 0, 1)`. This is a limitation of that formula in binary64, not a claim about every reduced-product algorithm.

## Reproduction

Measurements used Apple M4 Pro, Node 24.14.0, Chrome 156, and labs 0.12.0. Performance runs were serial. The new dense, affine and in-place fixtures complement the existing matrix and hierarchy benchmarks:

```sh
pnpm bench mat4-multiply mat4.bench transform-hierarchy --no-save --blocks 8
pnpm bench mat4-multiply mat4.bench transform-hierarchy --runtime chrome --no-save --blocks 6
```

For paired comparisons, provide an alternate checkout with identical benchmark fixtures using `--against /path/to/checkout`. The new fixtures reported sampling-harness deoptimization on both sides, while their workloads remained TurboFan optimized. Existing matrix and hierarchy benchmarks provide independent checks.

Local investigation scripts, experimental implementations, raw JSON, numerical fixtures, source snapshots and V8 traces are retained in the ignored `tmp/matmul-proof/` directory. The published algorithms are linked above; their generated implementations are not part of the package. No claim of a globally minimal multiplication algorithm follows from these measurements.
