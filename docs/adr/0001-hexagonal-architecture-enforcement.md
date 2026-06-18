# ADR-0001: Hexagonal Architecture and Import Enforcement

**Status:** Accepted - Fully Implemented

---

## Context and Problem Statement

Politicket uses hexagonal architecture (ports and adapters) to keep business
logic independent of Electron, SQLite, and the React renderer. The risk is
that without automated enforcement, import violations accumulate silently:
a use case imports a repository directly, an IPC handler reaches past the
application layer into infrastructure, or the renderer imports main-process
code. These violations are invisible until the code becomes unmaintainable.

In the previous Python toolchain, `import-linter` enforced layer contracts
by tracing the full import graph transitively. The standard TypeScript linting
tools (`eslint-plugin-import`, `no-restricted-imports`) only check direct
imports and miss transitive violations.

Two enforcement mechanisms are needed:

- **Compile-time:** prevent violating imports from resolving at all, not just
  flagging them as warnings.
- **Transitive:** catch the case where layer A imports layer B which imports
  layer C (forbidden), not just direct A-to-C imports.

---

## Options Considered

### Option A - eslint-plugin-boundaries only

Defines zones and rules in ESLint. Catches direct import violations at lint
time. Does not trace the full import graph - misses transitive violations.
A developer can also suppress violations with `// eslint-disable`.

### Option B - TypeScript project references only

Each layer has its own `tsconfig.json` with `composite: true` and an explicit
`references` array limited to allowed layers. A file in `ipc/` cannot import
from `infrastructure/` because `infrastructure` is not in `ipc/tsconfig.json`'s
references - TypeScript refuses to resolve the module. Violations are compile
errors, not warnings. Cannot be suppressed with a comment.

Transitive case: if `application/tsconfig.json` does not reference
`infrastructure`, any file in `application/` that tries to import from
`infrastructure/` fails to compile. This blocks the transitive path
`ipc -> application -> infrastructure` at its source.

### Option C - Both (chosen)

TypeScript project references provide the structural enforcement. Violations
fail the build. `eslint-plugin-boundaries` provides fast developer feedback
during editing (IDE integration, descriptive error messages) before the full
`tsc --build` runs.

---

## Decision

Enforce hexagonal architecture using TypeScript project references as the
primary mechanism, with `eslint-plugin-boundaries` as the secondary layer for
IDE feedback.

### Layer map

```
src/main/
  domain/           - entities, value objects, domain errors
  application/      - ports (interfaces), use cases, DTOs, exceptions
  infrastructure/   - Drizzle repositories implementing ports
  ipc/              - IPC handlers (presentation layer for main process)
  container.ts      - composition root: the only file that may import
                      from all layers simultaneously
  index.ts          - Electron entry point
```

### Allowed imports per layer

**`domain`** may import from:

- `src/shared/` (cross-process utilities)
- Node.js standard library and npm packages
- Nothing else

**`application`** may import from:

- `domain`
- `src/shared/`
- npm packages

**`infrastructure`** may import from:

- `domain`
- `application` (for port interfaces and DTOs only)
- `src/shared/`
- npm packages (drizzle-orm, better-sqlite3)

**`ipc`** may import from:

- `application` (use cases, DTOs, ports)
- `src/shared/`
- npm packages (electron)
- NOT `infrastructure` - IPC handlers never import repositories directly

**`container.ts`** may import from:

- All layers (it is the composition root)

**`src/renderer/`** may import from:

- `src/shared/`
- npm packages (react, etc.)
- NOT `src/main/` - enforced by the Electron process boundary

**`src/preload/`** may import from:

- `src/shared/`
- npm packages (electron)

### Enforcement mechanism

Each layer directory contains a `tsconfig.json` with:

- `"composite": true` - required for project references
- `"emitDeclarationOnly": true` - only emit `.d.ts` files (actual JS
  compilation is handled by electron-vite)
- `"references"` - explicitly listing only allowed layers

`src/main/tsconfig.json` is the composition root project. It references all
four layer tsconfigs and covers only `index.ts` and `container.ts`.

The lint command runs `tsc --build src/main/tsconfig.json` as the
`arch-check` step. This verifies all layer contracts. A violation in any
layer fails the entire build.

`eslint-plugin-boundaries` is configured with matching zone rules. It runs
as part of `eslint .` in the standard lint pass.

### The container rule

`container.ts` is the ONLY file in the project that may instantiate
concrete infrastructure classes (repositories) and pass them to use cases.
Every other file receives dependencies through constructor injection typed
against the port interface, never the concrete class.

---

## Implementation Status

### Complete

- `src/main/domain/tsconfig.json` - composite project, no references
- `src/main/application/tsconfig.json` - references domain
- `src/main/infrastructure/tsconfig.json` - references domain + application
- `src/main/ipc/tsconfig.json` - references application only
- `src/main/tsconfig.json` - composition root, references all four layers
- `eslint-plugin-boundaries` installed and configured in `eslint.config.mjs`
- `arch-check` script added to `package.json`
- `make.ps1` updated: `arch-check` target added, integrated into `lint`
- `CLAUDE.md` updated to document the enforcement setup
- `.cursor/rules/clean-architecture-imports.mdc` rewritten for TypeScript
- `.cursor/rules/linter-must-pass.mdc` updated with new tools
- `.cursor/skills/hexagonal-feature/SKILL.md` rewritten for TypeScript
- `.cursor/skills/lint-imports-setup/SKILL.md` rewritten for TypeScript

### Remaining

- (none)

---

## Consequences

**Improves:**

- Layer violations fail the build - they cannot be shipped accidentally.
- Transitive violations are caught at compile time, not just direct imports.
- Violations cannot be suppressed with `// eslint-disable` or equivalent.
- IDE integration via `eslint-plugin-boundaries` gives descriptive errors
  during editing, before any build step runs.

**Trade-offs:**

- `tsc --build` emits `.d.ts` files to `out/types/` during the arch-check.
  These are covered by the existing `out/**` entry in `.gitignore`.
- The dev server (`electron-vite`) does not run project references - it uses
  esbuild for fast transpilation. Architecture enforcement is a lint-step
  check only, not enforced during hot-reload development.
- Each new layer directory requires a `tsconfig.json`. This is documented
  in the `hexagonal-feature` skill as a required step.

**Prohibited:**

- Any file outside `container.ts` may not import a concrete repository class.
- Any file in `ipc/` may not import from `infrastructure/`.
- Any file in `application/` may not import from `infrastructure/`.
- Any file in `domain/` may not import from `application/`, `infrastructure/`,
  or `ipc/`.
- Any file in `src/renderer/` may not import from `src/main/`.
