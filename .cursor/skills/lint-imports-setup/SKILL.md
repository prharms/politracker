---
name: lint-imports-setup
description: >-
  Sets up hexagonal architecture import enforcement for the TypeScript/Electron
  stack using TypeScript project references (compile-time, primary) and
  eslint-plugin-boundaries (lint-time, secondary). Use when the arch-check is
  failing, when adding a new architectural layer, or when reviewing the
  enforcement setup. See ADR-0001 for the decision rationale.
---

# Hexagonal Architecture Import Enforcement (TypeScript)

## The two-mechanism approach

Architecture violations in this project fail the build via two mechanisms:

**Primary - TypeScript project references (`tsc --build`)**

Each layer directory has its own `tsconfig.json` with `composite: true` and
a `references` array listing only allowed layers. When a file in `ipc/` tries
to import from `infrastructure/`, TypeScript fails to resolve the module
because `infrastructure` is not in `ipc/tsconfig.json`'s references. This is
a compile error, not a warning. There is no escape hatch.

Transitive violations are blocked structurally: if `application/tsconfig.json`
does not reference `infrastructure`, no file inside `application/` can import
from `infrastructure/`. The path `ipc -> application -> infrastructure` is
therefore impossible to compile.

**Secondary - eslint-plugin-boundaries**

Configured in `eslint.config.mjs`. Catches the same direct violations as
project references but surfaces them as ESLint errors during editing (IDE
feedback before any build step runs). Does not trace the full import graph
transitively - that is handled by TypeScript project references.

---

## Current layer map and tsconfig references

```
src/main/
  domain/tsconfig.json         references: []
  application/tsconfig.json    references: [../domain]
  infrastructure/tsconfig.json references: [../domain, ../application]
  ipc/tsconfig.json            references: [../application]
  tsconfig.json                references: [domain, application, infrastructure, ipc]
                               include: [index.ts, container.ts]
```

The composition root (`src/main/tsconfig.json`) references all four layers
and includes only `index.ts` (entry point) and `container.ts` (wiring root).
`container.ts` is the ONLY file that may import from all layers simultaneously.

---

## How to run the architecture check

```powershell
./make.ps1 arch-check
```

This runs `tsc --build src/main/tsconfig.json`. Output:
- `.d.ts` files go to `out/types/` (covered by `.gitignore`)
- `.tsbuildinfo` files in each layer directory (covered by `.gitignore`)
- Exit code 0 if all layer contracts are satisfied
- Non-zero with a compile error message if any contract is violated

The arch-check is also part of `./make.ps1 lint` (runs after both tsc --noEmit steps).

---

## Per-layer tsconfig template

Every layer directory must have this file at `src/main/[layer]/tsconfig.json`:

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "emitDeclarationOnly": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declarationDir": "../../../out/types/[layer-name]",
    "outDir": "../../../out/types/[layer-name]"
  },
  "references": [
    // list ONLY layers this layer is allowed to import from
  ],
  "include": ["**/*.ts"]
}
```

`emitDeclarationOnly: true` ensures only `.d.ts` files are emitted. The
actual JavaScript compilation is done by electron-vite, not tsc.

---

## Adding a new layer (extremely rare)

1. Create the layer directory: `src/main/[new-layer]/`
2. Add a `tsconfig.json` using the template above
3. Add it to `src/main/tsconfig.json` references:
   ```json
   { "path": "[new-layer]" }
   ```
4. Add a zone to `eslint.config.mjs` boundaries settings:
   ```javascript
   { type: '[new-layer]', pattern: 'src/main/[new-layer]/**' }
   ```
5. Add `boundaries/dependencies` rules for the new zone
6. Write an ADR documenting the new layer

---

## eslint-plugin-boundaries configuration

Defined in `eslint.config.mjs`. The relevant config block:

```javascript
{
  files: ['src/**/*.ts', 'src/**/*.tsx'],
  plugins: { boundaries },
  settings: {
    'boundaries/elements': [
      { type: 'domain',         pattern: 'src/main/domain/**' },
      { type: 'application',    pattern: 'src/main/application/**' },
      { type: 'infrastructure', pattern: 'src/main/infrastructure/**' },
      { type: 'ipc',            pattern: 'src/main/ipc/**' },
      { type: 'renderer',       pattern: 'src/renderer/**' },
      { type: 'shared',         pattern: 'src/shared/**' },
      { type: 'preload',        pattern: 'src/preload/**' },
    ],
    'boundaries/ignore': ['src/main/index.ts', 'src/main/container.ts'],
  },
  rules: {
    'boundaries/dependencies': ['error', {
      default: 'disallow',
      rules: [
        { from: { type: 'domain' },         allow: { to: { type: 'shared' } } },
        { from: { type: 'application' },    allow: { to: { type: ['domain', 'shared'] } } },
        { from: { type: 'infrastructure' }, allow: { to: { type: ['domain', 'application', 'shared'] } } },
        { from: { type: 'ipc' },            allow: { to: { type: ['application', 'shared'] } } },
        { from: { type: 'renderer' },       allow: { to: { type: 'shared' } } },
        { from: { type: 'preload' },        allow: { to: { type: 'shared' } } },
      ],
    }],
  },
}
```

---

## Diagnosing a violation

**TypeScript project reference error (arch-check):**
```
error TS6307: File 'src/main/infrastructure/repositories/staff-repository.ts' is not
under 'rootDir' 'src/main/application'. 'rootDir' is expected to contain all source files.
```
This means a file in `application/` imported from `infrastructure/`. Fix: use the port interface, not the concrete repository.

**eslint-plugin-boundaries error:**
```
Importing 'infrastructure' is not allowed from 'ipc'. [boundaries/dependencies]
```
Same fix: the IPC handler should call a use case (application layer), never a repository directly.

---

## See also

- ADR-0001: `docs/adr/0001-hexagonal-architecture-enforcement.md`
- `clean-architecture-imports.mdc` - the enforced rules
- `hexagonal-feature` skill - step-by-step feature implementation
