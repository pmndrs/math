import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
if (!fs.existsSync(root)) process.exit(0);

const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? walk(p) : [p];
    });

for (const file of walk(root).filter((f) => f.endsWith('.d.ts'))) {
    const dir = path.dirname(file);
    const original = fs.readFileSync(file, 'utf8');
    const fixed = original.replace(/(from\s+['"])(\.\.?(?:\/[^'"]*)?)(['"])/g, (_, pre, spec, post) => {
        const s = spec.replace(/\/$/, '');
        if (fs.existsSync(path.join(dir, `${s}.d.ts`))) return `${pre}${s}.js${post}`;
        if (fs.existsSync(path.join(dir, s, 'index.d.ts'))) return `${pre}${s}/index.js${post}`;
        return `${pre}${spec}${post}`;
    });
    if (fixed !== original) fs.writeFileSync(file, fixed);
}
