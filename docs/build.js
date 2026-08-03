import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// Generates the root README.md from ./README.template.md, expanding a handful
// of custom tags:
//   <TOC />                                          - table of contents from ## headings
//   <Snippet source="./file.ts" select="group" />   - a marked snippet from a doc source file
//   <Snippet source="./file.ts" />                   - the entire doc source file
//   <RenderType type="import('maath').Name" />       - a type/function signature, from source
//   <RenderSource type="import('maath').Name" />     - the full source of a type/function

const here = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.join(here, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));

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

// resolve module path to source directory based on package.json exports
function resolveModuleToSourceDir(modulePath) {
    const packageName = packageJson.name;

    // main package export -> ./src
    if (modulePath === packageName) {
        return path.join(projectRoot, 'src');
    }

    // subpath exports (e.g. "maath/three" -> the dir referenced by its `types`)
    const subpath = modulePath.replace(`${packageName}/`, '');
    const exportEntry = packageJson.exports?.[`./${subpath}`];
    if (exportEntry?.types) {
        const match = exportEntry.types.match(/\.\/dist\/([^/]+)\//);
        if (match) return path.join(projectRoot, match[1]);
    }

    // fallback: assume subpath maps directly to a directory
    return path.join(projectRoot, subpath);
}

// cache TypeScript programs per module to avoid recreating them
const tsProgramCache = new Map();
function getTsProgramForModule(modulePath) {
    if (tsProgramCache.has(modulePath)) return tsProgramCache.get(modulePath);
    const sourceFiles = getAllSourceFiles(resolveModuleToSourceDir(modulePath));
    const program = ts.createProgram(sourceFiles, {
        allowJs: false,
        declaration: true,
        emitDeclarationOnly: true,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strict: true,
        noEmit: true,
    });
    tsProgramCache.set(modulePath, program);
    return program;
}

const readmeTemplatePath = path.join(here, './README.template.md');
const readmeOutPath = path.join(here, '../README.md');

let readmeText = fs.readFileSync(readmeTemplatePath, 'utf-8');

/* <TOC /> */
const tocRegex = /<TOC\s*\/>/g;
const tocLines = [];
const headingRegex = /^(#{2,2})\s+(.*)$/gm;
for (const match of readmeText.matchAll(headingRegex)) {
    const level = match[1].length - 1;
    const title = match[2].trim();
    if (title === 'Table of Contents') continue;
    const anchor = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    const indent = '  '.repeat(level - 1);
    tocLines.push(`${indent}- [${title}](#${anchor})`);
}
readmeText = readmeText.replace(tocRegex, tocLines.join('\n'));

/* <RenderType type="import('maath').TypeName" /> */
const renderTypeRegex = /<RenderType\s+type=["']import\(['"]([^'"]+)['"]\)\.(\w+)["']\s*\/>/g;
readmeText = readmeText.replace(renderTypeRegex, (fullMatch, modulePath, typeName) => {
    const typeDef = getType(modulePath, typeName);
    if (!typeDef) {
        console.warn(`Type ${typeName} not found in module ${modulePath}`);
        return fullMatch;
    }
    return `\`\`\`ts\n${typeDef}\n\`\`\``;
});

/* <RenderSource type="import('maath').TypeName" /> */
const renderSourceRegex = /<RenderSource\s+type=["']import\(['"]([^'"]+)['"]\)\.(\w+)["']\s*\/>/g;
readmeText = readmeText.replace(renderSourceRegex, (fullMatch, modulePath, typeName) => {
    const typeDef = getSource(modulePath, typeName);
    if (!typeDef) {
        console.warn(`Type ${typeName} not found in module ${modulePath}`);
        return fullMatch;
    }
    return `\`\`\`ts\n${typeDef}\n\`\`\``;
});

/* <Snippet source="./snippets/file.ts" select="group" /> */
const snippetWithSelectRegex = /<Snippet\s+source=["'](.+?)["']\s+select=["'](.+?)["']\s*\/>/g;
readmeText = readmeText.replace(snippetWithSelectRegex, (fullMatch, sourcePath, groupName) => {
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

    const snippetParts = matches.map((match) => {
        const baseIndent = match[1] || '';
        let snippetCode = match[2];
        if (baseIndent) {
            snippetCode = snippetCode.replace(new RegExp(`^${baseIndent}`, 'gm'), '');
        }
        snippetCode = snippetCode.replace(/^.*\/\*[ \t]*SNIPPET_START:[^*]*\*\/.*\n?/gm, '');
        snippetCode = snippetCode.replace(/^.*\/\*[ \t]*SNIPPET_END:[^*]*\*\/.*\n?/gm, '');
        return snippetCode;
    });

    let snippetCode = snippetParts.join('');
    snippetCode = snippetCode.replace(/^\s*\n|\n\s*$/g, '');
    return `\`\`\`ts\n${snippetCode}\n\`\`\``;
});

/* <Snippet source="./file.ts" /> - without select, use entire file */
const snippetWithoutSelectRegex = /<Snippet\s+source=["'](.+?)["']\s*\/>/g;
readmeText = readmeText.replace(snippetWithoutSelectRegex, (fullMatch, sourcePath) => {
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
function getSource(modulePath, typeName) {
    const tsProgram = getTsProgramForModule(modulePath);
    const sourceFiles = getAllSourceFiles(resolveModuleToSourceDir(modulePath));

    let found = null;
    function visit(node, fileText) {
        if (
            (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isClassDeclaration(node)) &&
            node.name &&
            node.name.text === typeName
        ) {
            found = fileText.slice(node.getFullStart(), node.getEnd());
        }
        if (
            ts.isFunctionDeclaration(node) &&
            node.name &&
            node.name.text === typeName &&
            node.modifiers &&
            node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        ) {
            found = fileText.slice(node.getFullStart(), node.getEnd());
        }
        if (ts.isVariableStatement(node) && node.modifiers && node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
            for (const decl of node.declarationList.declarations) {
                if (decl.name && ts.isIdentifier(decl.name) && decl.name.text === typeName) {
                    found = fileText.slice(node.getFullStart(), node.getEnd());
                }
            }
        }
        ts.forEachChild(node, (child) => visit(child, fileText));
    }

    for (const file of sourceFiles) {
        const sf = tsProgram.getSourceFile(file);
        if (sf) visit(sf, sf.getFullText());
        if (found) break;
    }

    return found ? found.trimStart() : null;
}

function getType(modulePath, typeName) {
    const tsProgram = getTsProgramForModule(modulePath);
    const checker = tsProgram.getTypeChecker();
    const sourceFiles = getAllSourceFiles(resolveModuleToSourceDir(modulePath));

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
        if (
            ts.isFunctionDeclaration(node) &&
            node.name &&
            node.name.text === typeName &&
            node.modifiers &&
            node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        ) {
            const jsDoc = ts
                .getJSDocCommentsAndTags(node)
                .map((doc) => fileText.slice(doc.pos, doc.end))
                .join('');
            const sig = checker.getSignatureFromDeclaration(node);
            let sigStr = '';
            if (sig) {
                const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
                const sigNode = ts.factory.createFunctionDeclaration(
                    node.modifiers,
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
        ts.forEachChild(node, (child) => visit(child, fileText));
    }

    for (const file of sourceFiles) {
        const sf = tsProgram.getSourceFile(file);
        if (sf) visit(sf, sf.getFullText());
        if (found) break;
    }

    return found;
}
