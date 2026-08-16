import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Generates the root README.md from ./README.template.md, expanding a handful
// of custom tags:
//   <RenderAPI />                                    - the complete API reference, generated
//                                                      from every package entrypoint (main + subpaths)
//   <TOC />                                          - table of contents from ## headings
//   <Snippet source="./file.ts" select="group" />   - a marked snippet from a doc source file
//   <Snippet source="./file.ts" />                   - the entire doc source file
//   <RenderType type="import('maath').Name" />     - a type/function signature, from source
//   <RenderSource type="import('maath').Name" />   - the full source of a type/function

const here = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.join(here, '..');
const srcDir = path.join(projectRoot, 'src');
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
const packageName = packageJson.name;

// utility to find all .ts files in a directory
function getAllSourceFiles(dir) {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(getAllSourceFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
            files.push(fullPath);
        }
    }
    return files;
}

// One TypeScript program over the whole of src, so cross-file references resolve.
const sourceFiles = getAllSourceFiles(srcDir);
const tsProgram = ts.createProgram(sourceFiles, {
    allowJs: false,
    declaration: true,
    emitDeclarationOnly: true,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
});
const checker = tsProgram.getTypeChecker();

// resolve a package import specifier to its source directory, using package.json exports.
// e.g. "maath" -> src, "maath/shapes" -> src/shapes (types: ./dist/src/shapes/index.d.ts)
function resolveModuleToSourceDir(modulePath) {
    if (modulePath === packageName) return srcDir;
    const subpath = modulePath.replace(`${packageName}/`, '');
    const exportEntry = packageJson.exports?.[`./${subpath}`];
    if (exportEntry?.types) {
        const rel = exportEntry.types
            .replace(/^\.\//, '')
            .replace(/^dist\//, '')
            .replace(/\/index\.d\.ts$/, '')
            .replace(/\.d\.ts$/, '');
        return path.join(projectRoot, rel);
    }
    return path.join(projectRoot, subpath);
}

// map a package.json exports key ("." or "./shapes") to its import specifier and source index file
function entrypoints() {
    const out = [];
    for (const key of Object.keys(packageJson.exports ?? {})) {
        const specifier = key === '.' ? packageName : `${packageName}/${key.replace('./', '')}`;
        const dir = resolveModuleToSourceDir(specifier);
        const indexFile = path.join(dir, 'index.ts');
        if (!fs.existsSync(indexFile)) {
            console.warn(`no index.ts for entrypoint ${specifier} (${indexFile})`);
            continue;
        }
        out.push({ specifier, indexFile });
    }
    return out;
}

const hasExport = (node) => node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

// the top-level exported members (functions, consts, types) declared in a file, in source order
function getExportedMembers(file) {
    const sf = tsProgram.getSourceFile(file);
    const out = [];
    if (!sf) return out;
    sf.forEachChild((node) => {
        if (ts.isFunctionDeclaration(node) && node.name && hasExport(node)) {
            out.push({ name: node.name.text, kind: 'value' });
        } else if (ts.isVariableStatement(node) && hasExport(node)) {
            for (const decl of node.declarationList.declarations) {
                if (decl.name && ts.isIdentifier(decl.name)) out.push({ name: decl.name.text, kind: 'value' });
            }
        } else if (
            (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) &&
            node.name &&
            hasExport(node)
        ) {
            out.push({ name: node.name.text, kind: 'type' });
        }
    });
    return out;
}

// resolve a relative module specifier from an importing file to a { file, isDir } target
function resolveSpecifier(fromFile, spec) {
    const dir = path.dirname(fromFile);
    const leaf = path.resolve(dir, `${spec}.ts`);
    if (fs.existsSync(leaf)) return { file: leaf, isDir: false };
    const idx = path.resolve(dir, spec, 'index.ts');
    if (fs.existsSync(idx)) return { file: idx, isDir: true };
    return null;
}

// walk an entrypoint's index.ts (recursing through `export * from './dir'`) and collect its public API:
//   namespaces: `export * as ns from './file'`
//   topItems:   `export * from './leaf'` members, and named `export { x } / export type { X }` re-exports
//   topTypeNames: names surfaced via `export type { X }`, so we can avoid re-documenting them inside a namespace
function collectEntrypointApi(indexFile, acc) {
    const sf = tsProgram.getSourceFile(indexFile);
    if (!sf) {
        console.warn(`couldnt get ts sourcefile for ${indexFile}`);
        return acc;
    }

    sf.forEachChild((node) => {
        if (!ts.isExportDeclaration(node) || !node.moduleSpecifier) return;
        const spec = node.moduleSpecifier.text;
        const resolved = resolveSpecifier(indexFile, spec);

        // `export * ...` (no export clause)
        if (!node.exportClause) {
            if (node.isTypeOnly) return; // `export type * from '...'` — re-surfaces another entry, skip
            if (!resolved) {
                console.warn(`couldnt resolve '${spec}' from ${indexFile}`);
                return;
            }
            if (resolved.isDir) {
                collectEntrypointApi(resolved.file, acc); // recurse, e.g. main -> ./core
            } else {
                for (const m of getExportedMembers(resolved.file)) {
                    acc.topItems.push({ name: m.name, kind: m.kind, file: resolved.file });
                }
            }
            return;
        }

        // `export * as ns from '...'`
        if (ts.isNamespaceExport(node.exportClause)) {
            const nsName = node.exportClause.name.text;
            if (!resolved) {
                console.warn(`couldnt resolve namespace '${spec}' from ${indexFile}`);
                return;
            }
            acc.namespaces.push({ name: nsName, file: resolved.file, members: getExportedMembers(resolved.file) });
            return;
        }

        // `export { a, b } from '...'` / `export type { A } from '...'`
        if (ts.isNamedExports(node.exportClause)) {
            for (const el of node.exportClause.elements) {
                const name = el.name.text;
                const isType = node.isTypeOnly || el.isTypeOnly;
                acc.topItems.push({ name, kind: isType ? 'type' : 'value', file: resolved?.file });
                if (isType) acc.topTypeNames.add(name);
            }
        }
    });

    return acc;
}

/* Shared anchor generation and collision tracking */
const usedAnchors = new Map();

function generateUniqueHeading(headingText, itemType = 'function') {
    const baseAnchor = generateAnchor(headingText);
    if (usedAnchors.has(baseAnchor)) {
        if (itemType === 'type') {
            if (headingText.startsWith('`') && headingText.endsWith('`')) {
                return `\`${headingText.slice(1, -1)}\` (type)`;
            }
            return `${headingText} (type)`;
        }
    }
    usedAnchors.set(baseAnchor, { type: itemType });
    return headingText;
}

function generateAnchor(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// render a responsive-ish HTML grid of links for the table of contents
function renderGrid(items) {
    if (items.length === 0) return '';
    const maxCols = 4;
    const maxNameLen = items.reduce((m, it) => Math.max(m, it.display.length), 0);
    const perColWidth = Math.max(12, maxNameLen + 6);
    let cols = Math.floor(90 / perColWidth) || 1;
    cols = Math.min(maxCols, Math.max(1, cols));
    const itemsPerRow = Math.min(cols, items.length);

    let s = '<table><tr>\n';
    for (let i = 0; i < items.length; i++) {
        s += `<td><a href="#${items[i].anchor}"><code>${items[i].display}</code></a></td>`;
        if ((i + 1) % itemsPerRow === 0 && i < items.length - 1) s += '\n</tr><tr>\n';
    }
    if (items.length > 1) {
        const remainder = items.length % itemsPerRow;
        if (remainder !== 0) for (let i = 0; i < itemsPerRow - remainder; i++) s += '<td></td>';
    }
    s += '\n</tr></table>\n\n';
    return s;
}

/* <RenderAPI /> - render the complete api reference, grouped by entrypoint */
function generateApiDocs() {
    // Pass 1: build a model of every entrypoint, assigning stable headings/anchors.
    const model = [];
    for (const { specifier, indexFile } of entrypoints()) {
        const api = collectEntrypointApi(indexFile, { namespaces: [], topItems: [], topTypeNames: new Set() });

        const groups = [];

        // top-level items (flat re-exports and named type/value re-exports)
        if (api.topItems.length > 0) {
            groups.push({
                label: null,
                items: api.topItems.map((it) => makeItem(it.name, '', it.kind, it.file)),
            });
        }

        // one group per namespace; skip type members already surfaced at the top level
        for (const ns of api.namespaces) {
            const items = ns.members
                .filter((m) => !(m.kind === 'type' && api.topTypeNames.has(m.name)))
                .map((m) => makeItem(m.name, `${ns.name}.`, m.kind, ns.file));
            if (items.length > 0) groups.push({ label: ns.name, items });
        }

        model.push({ specifier, groups });
    }

    // Pass 2: table of contents (bold labels, no headings — avoids polluting the anchor space).
    let toc = '';
    for (const entry of model) {
        toc += `**\`${entry.specifier}\`**\n\n`;
        for (const group of entry.groups) {
            if (group.label) toc += `**${group.label}**\n\n`;
            toc += renderGrid(group.items);
        }
    }

    // Pass 3: detailed reference (headings drive the anchors the TOC links to).
    let detail = '';
    for (const entry of model) {
        detail += `### \`${entry.specifier}\`\n\n`;
        for (const group of entry.groups) {
            if (group.label) detail += `**${group.label}**\n\n`;
            for (const item of group.items) {
                const sig = getType(item.name, item.file);
                if (!sig) {
                    console.warn(`no signature for ${item.display} (${item.file ?? 'unknown file'})`);
                    continue;
                }
                detail += `#### ${item.heading}\n\n\`\`\`ts\n${sig.trim()}\n\`\`\`\n\n`;
            }
        }
    }

    return `${toc}\n---\n\n## Reference\n\n${detail}`;

    function makeItem(name, prefix, kind, file) {
        const display = `${prefix}${name}`;
        const heading = generateUniqueHeading(`\`${display}\``, kind === 'type' ? 'type' : 'function');
        return { name, display, kind, file, heading, anchor: generateAnchor(heading) };
    }
}

/* Example galleries read from examples/src/examples.json, screenshots from
 * examples/public/screenshots/<key>.png, linking to the live examples browser. */
const EXAMPLES_COLS = 3;
const EXAMPLE_PAGES_BASE = 'https://pmndrs.github.io/maath/examples/#';
const examplesJsonPath = path.join(here, '../examples/src/examples.json');

function loadExamples() {
    if (!fs.existsSync(examplesJsonPath)) {
        console.warn(`examples.json not found: ${examplesJsonPath}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(examplesJsonPath, 'utf-8'));
}

function exampleCell(data, key, width = 180, height = 120) {
    const title = data[key].title || key;
    const img = `./examples/public/screenshots/${key}.png`;
    const href = `${EXAMPLE_PAGES_BASE}${key}`;
    return (
        `    <td align="center">\n` +
        `      <a href="${href}">\n` +
        `        <img src="${img}" width="${width}" height="${height}" style="object-fit:cover;"/><br/>\n` +
        `        ${title}\n` +
        `      </a>\n` +
        `    </td>`
    );
}

/* <Examples /> - a full gallery grid of every example in examples.json */
function renderExamples() {
    const data = loadExamples();
    if (!data) return '';
    const keys = Object.keys(data);
    let out = '<table>\n';
    for (let i = 0; i < keys.length; i += EXAMPLES_COLS) {
        out += '  <tr>\n';
        for (let j = 0; j < EXAMPLES_COLS && i + j < keys.length; ++j) {
            out += `${exampleCell(data, keys[i + j])}\n`;
        }
        out += '  </tr>\n';
    }
    return `${out}</table>`;
}

/* <ExamplesTable ids="a,b,c" /> - a one-row table of specific examples */
function renderExamplesTable(idsStr) {
    const data = loadExamples();
    if (!data) return '';
    const ids = idsStr
        .split(',')
        .map((s) => s.trim())
        .filter((id) => data[id] || console.warn(`example '${id}' not in examples.json`));
    if (ids.length === 0) return '';
    const cells = ids.map((id) => exampleCell(data, id, 200, 133)).join('\n');
    return `<table>\n  <tr>\n${cells}\n  </tr>\n</table>`;
}

const readmeTemplatePath = path.join(here, './README.template.md');
const readmeOutPath = path.join(here, '../README.md');
let readmeText = fs.readFileSync(readmeTemplatePath, 'utf-8');

/* <Examples /> - gallery grid of every example */
readmeText = readmeText.replace(/<Examples\s*\/>/g, () => renderExamples());

/* <ExamplesTable ids="a,b,c" /> - inline one-row table for a section */
readmeText = readmeText.replace(/<ExamplesTable\s+ids=["'](.+?)["']\s*\/>/g, (_full, ids) => renderExamplesTable(ids));

/* <RenderAPI /> */
readmeText = readmeText.replace(/<RenderAPI\s*\/>/g, () => generateApiDocs());

/* <TOC /> */
const tocLines = [];
for (const match of readmeText.matchAll(/^(#{2,2})\s+(.*)$/gm)) {
    const level = match[1].length - 1;
    const title = match[2].trim();
    if (title === 'Table of Contents') continue;
    const anchor = generateAnchor(title);
    tocLines.push(`${'  '.repeat(level - 1)}- [${title}](#${anchor})`);
}
readmeText = readmeText.replace(/<TOC\s*\/>/g, tocLines.join('\n'));

/* <RenderType type="import('maath/x').TypeName" /> */
readmeText = readmeText.replace(
    /<RenderType\s+type=["']import\(['"]([^'"]+)['"]\)\.(\w+)["']\s*\/>/g,
    (fullMatch, modulePath, typeName) => {
        const typeDef = getType(typeName, findFileForModuleMember(modulePath, typeName));
        if (!typeDef) {
            console.warn(`Type ${typeName} not found in module ${modulePath}`);
            return fullMatch;
        }
        return `\`\`\`ts\n${typeDef}\n\`\`\``;
    },
);

/* <RenderSource type="import('maath/x').TypeName" /> */
readmeText = readmeText.replace(
    /<RenderSource\s+type=["']import\(['"]([^'"]+)['"]\)\.(\w+)["']\s*\/>/g,
    (fullMatch, modulePath, typeName) => {
        const typeDef = getSource(typeName, findFileForModuleMember(modulePath, typeName));
        if (!typeDef) {
            console.warn(`Type ${typeName} not found in module ${modulePath}`);
            return fullMatch;
        }
        return `\`\`\`ts\n${typeDef}\n\`\`\``;
    },
);

/* <Snippet source="./file.ts" select="group" /> */
readmeText = readmeText.replace(
    /<Snippet\s+source=["'](.+?)["']\s+select=["'](.+?)["']\s*\/>/g,
    (fullMatch, sourcePath, groupName) => {
        const absSourcePath = path.join(here, sourcePath);
        if (!fs.existsSync(absSourcePath)) {
            console.warn(`Snippet source file not found: ${absSourcePath}`);
            return fullMatch;
        }
        const sourceText = fs.readFileSync(absSourcePath, 'utf-8');
        const groupRegex = new RegExp(
            String.raw`^([ \t]*)\/\*[ \t]*SNIPPET_START:[ \t]*${groupName}[ \t]*\*\/[\r\n]+([\s\S]*?)[ \t]*^\1\/\*[ \t]*SNIPPET_END:[ \t]*${groupName}[ \t]*\*\/`,
            'gm',
        );
        const matches = Array.from(sourceText.matchAll(groupRegex));
        if (matches.length === 0) {
            console.warn(`Snippet group '${groupName}' not found in ${sourcePath}`);
            return fullMatch;
        }
        const parts = matches.map((match) => {
            const baseIndent = match[1] || '';
            let code = match[2];
            if (baseIndent) code = code.replace(new RegExp(`^${baseIndent}`, 'gm'), '');
            code = code.replace(/^.*\/\*[ \t]*SNIPPET_START:[^*]*\*\/.*\n?/gm, '');
            code = code.replace(/^.*\/\*[ \t]*SNIPPET_END:[^*]*\*\/.*\n?/gm, '');
            return code;
        });
        let code = parts.join('');
        code = code.replace(/^\s*\n|\n\s*$/g, '');
        return `\`\`\`ts\n${code}\n\`\`\``;
    },
);

/* <Snippet source="./file.ts" /> - without select, use entire file */
readmeText = readmeText.replace(/<Snippet\s+source=["'](.+?)["']\s*\/>/g, (fullMatch, sourcePath) => {
    const absSourcePath = path.join(here, sourcePath);
    if (!fs.existsSync(absSourcePath)) {
        console.warn(`Snippet source file not found: ${absSourcePath}`);
        return fullMatch;
    }
    let sourceText = fs.readFileSync(absSourcePath, 'utf-8');
    sourceText = sourceText.replace(/^[ \t]*\/\*[ \t]*SNIPPET_START:[^*]*\*\/.*\n?/gm, '');
    sourceText = sourceText.replace(/^[ \t]*\/\*[ \t]*SNIPPET_END:[^*]*\*\/.*\n?/gm, '');
    sourceText = sourceText.replace(/^\s*\n|\n\s*$/g, '');
    return `\`\`\`ts\n${sourceText}\n\`\`\``;
});

/* write result */
fs.writeFileSync(readmeOutPath, readmeText, 'utf-8');
console.log(`wrote ${path.relative(projectRoot, readmeOutPath)}`);

/* utils */

// best-effort resolution of a RenderType/RenderSource module member to its declaring file
function findFileForModuleMember(modulePath, name) {
    const dir = resolveModuleToSourceDir(modulePath);
    const files = fs.existsSync(dir) ? getAllSourceFiles(dir) : sourceFiles;
    for (const file of files) {
        if (getExportedMembers(file).some((m) => m.name === name)) return file;
    }
    return undefined;
}

// the full source text of a declaration (type/interface/class/function/const), searched in `file` then everywhere
function getSource(typeName, file = null) {
    let found = null;
    function visit(node, fileText) {
        if (
            (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) &&
            node.name &&
            node.name.text === typeName
        ) {
            found = fileText.slice(node.getFullStart(), node.getEnd());
        }
        if (ts.isFunctionDeclaration(node) && node.name && node.name.text === typeName && hasExport(node)) {
            found = fileText.slice(node.getFullStart(), node.getEnd());
        }
        if (ts.isVariableStatement(node) && hasExport(node)) {
            for (const decl of node.declarationList.declarations) {
                if (decl.name && ts.isIdentifier(decl.name) && decl.name.text === typeName) {
                    found = fileText.slice(node.getFullStart(), node.getEnd());
                }
            }
        }
        ts.forEachChild(node, (child) => visit(child, fileText));
    }
    for (const f of filesToSearch(file)) {
        const sf = tsProgram.getSourceFile(f);
        if (sf) visit(sf, sf.getFullText());
        if (found) break;
    }
    return found ? found.trimStart() : null;
}

// a printed signature (functions) or the declaration (types), searched in `file` then everywhere
function getType(typeName, file = null) {
    let found = null;
    function visit(node, fileText) {
        if (
            (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) &&
            node.name &&
            node.name.text === typeName
        ) {
            const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
            found = printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile());
        }
        if (ts.isFunctionDeclaration(node) && node.name && node.name.text === typeName && hasExport(node)) {
            const jsDoc = ts
                .getJSDocCommentsAndTags(node)
                .map((doc) => fileText.slice(doc.pos, doc.end))
                .join('');
            const sig = checker.getSignatureFromDeclaration(node);
            let sigStr = '';
            if (sig) {
                const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
                const sigNode = ts.factory.createFunctionDeclaration(
                    // fresh modifier (not node.modifiers) so the printer doesn't re-emit the
                    // JSDoc already prepended above via the original modifier's source position
                    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
                    node.asteriskToken,
                    node.name,
                    node.typeParameters,
                    node.parameters,
                    node.type,
                    undefined,
                );
                sigStr = printer.printNode(ts.EmitHint.Unspecified, sigNode, node.getSourceFile());
            }
            found = (jsDoc ? `${jsDoc}\n` : '') + sigStr;
        }
        if (ts.isVariableStatement(node) && hasExport(node)) {
            for (const decl of node.declarationList.declarations) {
                if (!decl.name || !ts.isIdentifier(decl.name) || decl.name.text !== typeName) continue;
                const jsDoc = ts
                    .getJSDocCommentsAndTags(node)
                    .map((doc) => fileText.slice(doc.pos, doc.end))
                    .join('');
                const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
                if (decl.initializer && (ts.isFunctionExpression(decl.initializer) || ts.isArrowFunction(decl.initializer))) {
                    // exported const arrow/function expression -> print its signature
                    const func = decl.initializer;
                    const sigNode = ts.factory.createFunctionDeclaration(
                        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
                        undefined,
                        decl.name,
                        func.typeParameters,
                        func.parameters,
                        func.type,
                        undefined,
                    );
                    found = (jsDoc ? `${jsDoc}\n` : '') + printer.printNode(ts.EmitHint.Unspecified, sigNode, node.getSourceFile());
                } else {
                    // plain exported const -> print the declaration
                    const varNode = ts.factory.createVariableStatement(
                        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
                        ts.factory.createVariableDeclarationList(
                            [ts.factory.createVariableDeclaration(decl.name, undefined, decl.type, decl.initializer)],
                            node.declarationList.flags,
                        ),
                    );
                    found = (jsDoc ? `${jsDoc}\n` : '') + printer.printNode(ts.EmitHint.Unspecified, varNode, node.getSourceFile());
                }
            }
        }
        ts.forEachChild(node, (child) => visit(child, fileText));
    }
    for (const f of filesToSearch(file)) {
        const sf = tsProgram.getSourceFile(f);
        if (sf) visit(sf, sf.getFullText());
        if (found) break;
    }
    return found;
}

// search order: the declaring file first (if known), then every source file as a fallback
function filesToSearch(file) {
    if (file) return [file, ...sourceFiles.filter((f) => f !== file)];
    return sourceFiles;
}
