const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Only inspect maintained source. Build output and dependencies are not inputs.
const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'src');
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => entry.isDirectory()
    ? walk(path.join(directory, entry.name))
    : [path.join(directory, entry.name)]);
const files = walk(sourceRoot).filter((file) => /\.tsx?$/.test(file));
const relative = (file) => path.relative(sourceRoot, file).replaceAll('\\', '/');
const errors = [];
const graph = new Map();
const resolveSource = (file, specifier) => {
  const candidate = specifier.startsWith('@/')
    ? path.join(sourceRoot, specifier.slice(2))
    : specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : null;
  if (!candidate) return null;
  return [candidate, candidate + '.ts', candidate + '.tsx',
    path.join(candidate, 'index.ts'), path.join(candidate, 'index.tsx')]
    .find((value) => fs.existsSync(value) && fs.statSync(value).isFile()) || false;
};

for (const file of files) {
  const name = relative(file);
  const text = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const inspect = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      const specifier = node.moduleSpecifier.text;
      const resolved = resolveSource(file, specifier);
      if (resolved === false) errors.push(`${name}: unresolved import ${specifier}`);
      if (name.startsWith('features/') && resolved && relative(resolved).startsWith('app/')) {
        errors.push(`${name}: feature imports routing layer ${specifier}`);
      }
    }
    if (/^features\/[^/]+\/(components|hooks)\//.test(name) && ts.isCallExpression(node)) {
      const expression = node.expression.getText(source);
      if (expression === 'fetch' || /^api\.(get|post|put|patch|delete)$/.test(expression)) {
        errors.push(`${name}: HTTP belongs in feature services (${expression})`);
      }
    }
    ts.forEachChild(node, inspect);
  };
  inspect(source);
  if (name.startsWith('app/') && name.endsWith('/page.tsx')) {
    const functions = source.statements.filter(ts.isFunctionDeclaration);
    if (functions.length !== 1 || functions[0].body?.statements.length !== 1 ||
      !ts.isReturnStatement(functions[0].body.statements[0])) {
      errors.push(`${name}: route page must be a thin render wrapper`);
    }
  }
  // Type-only imports are erased before checking runtime dependencies/cycles.
  const compiled = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    fileName: file,
  }).outputText;
  const dependencies = [...compiled.matchAll(/require\(["']([^"']+)["']\)/g)]
    .map((match) => resolveSource(file, match[1])).filter(Boolean)
    .filter((dependency) => /\.tsx?$/.test(dependency));
  graph.set(file, dependencies);
  for (const dependency of dependencies) {
    const target = relative(dependency);
    if (/^(components\/(ui|figma)|hooks)\//.test(name) && target.startsWith('features/')) {
      errors.push(`${name}: shared primitive depends on ${target}`);
    }
    if (/^features\/[^/]+\/services\//.test(name) && /^features\/[^/]+\/(hooks|components)\//.test(target)) {
      errors.push(`${name}: service depends on React UI/hook ${target}`);
    }
    if (name.startsWith('features/') && /^components\/(providers\/|layout\/Layout)/.test(target)) {
      errors.push(`${name}: feature imports app composition ${target}`);
    }
  }
}

const complete = new Set();
const active = [];
function visit(file) {
  if (complete.has(file)) return;
  if (active.includes(file)) {
    errors.push('Runtime cycle: ' + [...active.slice(active.indexOf(file)), file].map(relative).join(' -> '));
    return;
  }
  active.push(file);
  for (const dependency of graph.get(file) || []) visit(dependency);
  active.pop();
  complete.add(file);
}
for (const file of files) visit(file);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Architecture checks passed for ${files.length} source files: imports, route wrappers, services, and runtime cycles.`);
}
