---
name: detect-secrets-ci
description: >-
  Integrates detect-secrets into a non-interactive CI/lint pipeline. Use when
  setting up a new project, adding detect-secrets to an existing lint suite, or
  when the detect-secrets step is failing or missing from make.ps1. Covers
  generating the baseline, the correct non-interactive scan command, and wiring
  into make.ps1.
---

# detect-secrets CI Integration

## Prerequisites

`detect-secrets scan` requires an initialized git repository. If the project has
no git repo yet, run `git init` before generating the baseline.

---

## Step 1 — Install

```toml
# pyproject.toml dev dependencies
"detect-secrets>=1.5",
```

---

## Step 2 — Generate the baseline

Run once per project. The baseline records known false positives so future scans
can ignore them.

```powershell
.venv\Scripts\detect-secrets.exe scan your_package/ tests/ | Out-File -Encoding utf8 .secrets.baseline
```

Verify the file contains valid JSON (not a git error message):

```powershell
(Get-Content .secrets.baseline | ConvertFrom-Json).results
# Should print nothing (empty) for a clean codebase
```

If the output is an error message instead of JSON, the git repo was missing — run
`git init` then regenerate.

---

## Step 3 — Wire into make.ps1

Use a scan-and-check pattern — re-scans on every lint run and fails immediately
if any secrets are detected:

```powershell
Invoke-Step "detect-secrets" {
    .venv\Scripts\detect-secrets.exe scan your_package/ tests/ | .venv\Scripts\python.exe -c "import json,sys; d=json.load(sys.stdin); exit(0 if not d.get('results') else 1)"
}
```

Place this step after `import-linter` and before `pytest`.

---

## Step 4 — Add .secrets.baseline to version control

The baseline must be committed so CI has it available:

```powershell
git add .secrets.baseline
```

---

## When a secret is flagged

If `detect-secrets` flags something that is a false positive (e.g. a test fixture
value, a placeholder string):

1. Audit it: `detect-secrets audit .secrets.baseline` (interactive)
2. Mark it as a false positive in the interactive prompt
3. Commit the updated baseline
4. Document the reason in a comment near the value in source code

Never add `# nosec` or `# noqa` to suppress the finding without auditing it first.

---

## Updating the baseline after adding new files

After adding new source files, regenerate the baseline to incorporate them:

```powershell
.venv\Scripts\detect-secrets.exe scan your_package/ tests/ | Out-File -Encoding utf8 .secrets.baseline
```

Commit the updated baseline alongside the new files.
