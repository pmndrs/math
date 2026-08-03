import { defineConfig } from 'rolldown';

// Single-package build: bundle the library entrypoint to an ESM file.
// `three` (and its types) are peer deps, so keep them external.
export default defineConfig({
    input: './src/index.ts',
    external: ['three'],
    output: {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true,
        exports: 'named',
    },
});
