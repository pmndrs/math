import fs from 'node:fs';
import { defineConfig } from 'vite';

const input: Record<string, string> = {};

const htmlFiles = fs
    .readdirSync('./')
    .filter((file) => file.endsWith('.html'));

for (const path of htmlFiles) {
    const name = path.split('/').pop()?.replace('.html', '');
    if (name) {
        input[name] = `./${path}`;
    }
}

export default defineConfig({
    base: './',
    root: './',
    build: {
        outDir: './dist',
        rollupOptions: {
            input,
        },
        target: 'esnext',
    },
    server: {
        open: '/index.html',
    },
});
