import { defineConfig } from 'vite';

// https://vite.dev/config/
// relative base so the site works under the GitHub Pages project subpath
// (pmndrs.github.io/maath/).
export default defineConfig({
    base: './',
    plugins: [],
});
