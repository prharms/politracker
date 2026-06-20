import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import boundaries from 'eslint-plugin-boundaries'

export default [
  js.configs.recommended,

  // --- Base TypeScript rules for all source files ---
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      jsdoc: jsdocPlugin
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      complexity: ['error', 10],
      'no-console': 'error',
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true
          },
          exemptEmptyFunctions: true
        }
      ]
    }
  },

  // --- Renderer: browser globals + no direct main-process imports ---
  {
    files: ['src/renderer/**/*.ts', 'src/renderer/**/*.tsx'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLButtonElement: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['*/main/*', '../main/*', '../../main/*']
        }
      ]
    }
  },

  // --- Hexagonal architecture boundary enforcement ---
  // Direct imports are checked here; transitive violations are caught by
  // TypeScript project references during `tsc --build src/main/tsconfig.json`
  // (the arch-check step in make.ps1 lint).
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/main/domain/**' },
        { type: 'application', pattern: 'src/main/application/**' },
        { type: 'infrastructure', pattern: 'src/main/infrastructure/**' },
        { type: 'ipc', pattern: 'src/main/ipc/**' },
        { type: 'renderer', pattern: 'src/renderer/**' },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'preload', pattern: 'src/preload/**' }
      ],
      // Composition root files are intentionally allowed to cross all boundaries.
      'boundaries/ignore': ['src/main/index.ts', 'src/main/container.ts']
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            // domain: may only use shared utilities
            {
              from: { type: 'domain' },
              allow: { to: { type: 'shared' } }
            },
            // application: may use domain + shared
            {
              from: { type: 'application' },
              allow: { to: { type: ['domain', 'shared'] } }
            },
            // infrastructure: may use domain + application (ports/DTOs) + shared
            {
              from: { type: 'infrastructure' },
              allow: { to: { type: ['domain', 'application', 'shared'] } }
            },
            // ipc: may use application + shared — NEVER infrastructure directly
            {
              from: { type: 'ipc' },
              allow: { to: { type: ['application', 'shared'] } }
            },
            // renderer: communicates via IPC only — may use shared types
            {
              from: { type: 'renderer' },
              allow: { to: { type: 'shared' } }
            },
            // preload: context bridge only — may use shared types
            {
              from: { type: 'preload' },
              allow: { to: { type: 'shared' } }
            }
          ]
        }
      ]
    }
  },

  // --- Test files: relax docstring and any-type rules ---
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },

  // --- Ignored paths ---
  {
    ignores: ['out/**', 'dist/**', 'node_modules/**', '*.config.*', '**/*.d.ts']
  }
]
