const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise maintained TS modules without a Next build or generated files.
function createSourceLoader({ mocks = {}, globals = {} } = {}) {
  const sourceRoot = path.resolve(__dirname, '../../src');
  const cache = new Map();
  const context = vm.createContext({
    console, URL, URLSearchParams, Headers, Request, Response, FormData, File, Blob,
    AbortController, TextDecoder, TextEncoder, setTimeout, clearTimeout,
    process: { env: { NODE_ENV: 'test', NEXT_PUBLIC_API_URL: '/api/backend' } },
    ...globals,
  });

  function load(specifier, parent = path.join(sourceRoot, 'index.ts')) {
    if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
    if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return require(specifier);
    const base = specifier.startsWith('@/')
      ? path.join(sourceRoot, specifier.slice(2))
      : path.resolve(path.dirname(parent), specifier);
    const file = [base, base + '.ts', base + '.tsx', path.join(base, 'index.ts')]
      .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!file) throw new Error(`Cannot resolve ${specifier} from ${parent}`);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      fileName: file,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const evaluate = new vm.Script(`(function (require, module, exports) {\n${compiled}\n})`, {
      filename: file,
    }).runInContext(context);
    evaluate((next) => load(next, file), module, module.exports);
    return module.exports;
  }
  return load;
}

module.exports = { createSourceLoader };
