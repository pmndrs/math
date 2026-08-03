import { defineConfig } from 'rolldown';

// One bundle per entrypoint. Rolldown emits a shared chunk for code used by
// more than one entry (e.g. core vec/mat used by geometry), so there's no
// duplication across the entry bundles.
export default defineConfig({
    input: {
        index: './src/index.ts',
        shapes: './src/shapes/index.ts',
        geometry: './src/geometry/index.ts',
        time: './src/time/index.ts',
        random: './src/random/index.ts',
        noise: './src/noise/index.ts',
        color: './src/color/index.ts',
    },
    output: {
        dir: 'dist',
        format: 'es',
        sourcemap: true,
        exports: 'named',
    },
});
