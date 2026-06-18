---
name: git-commit
description: Enforces correct git commit workflow for this project. Use when preparing to commit, writing a commit message, creating a branch, or pushing code. Reads and affirms git-branching, linter-must-pass, and powershell-only rules before every commit.
---

# Git Commit

## Instructions

When this skill is invoked:

1. Read `.cursor/rules/git-branching.mdc`
2. Read `.cursor/rules/linter-must-pass.mdc`
3. Read `.cursor/rules/powershell-only.mdc`
4. Output the affirmation below verbatim, then fill in the bracketed sections for the current commit.
5. Execute the checklist in order. Do not issue the commit command until every item is checked off.

## Required affirmation output

> **Git commit affirmation**
>
> Lint: I will run `./make.ps1 lint` and observe `[SUCCESS]` for ALL checks in this session before committing. A verbal confirmation from the user does not satisfy this requirement.
>
> Format: The commit will use exactly two `-m` flags. No heredoc, no multiline string, no single `-m` for substantive changes. No `&&` — PowerShell uses `;`.
>
> Subject line: Written out and counted to <= 72 characters, imperative mood, no trailing period.
>
> Body: Explains why and how, covers all meaningful sub-changes, does not repeat the subject.
>
> Branch decision: [state whether this change requires a feature branch or qualifies for direct main push, with the specific reason]
>
> Subject line for this commit (counted): [write the subject line and its character count here before issuing any command]

## Checklist — complete in order before issuing git commit

- [ ] `./make.ps1 lint` run and `[SUCCESS]` observed for all checks
- [ ] Subject line written out, character count verified <= 72
- [ ] Two `-m` flags confirmed, no prohibited syntax
- [ ] Subject uses imperative mood, no trailing period
- [ ] Body explains why and how, covers all sub-changes

## Correct syntax

```powershell
git commit -m "Subject line <= 72 chars" -m "Body explaining why and how."
```

## Never use

```powershell
# PROHIBITED
git commit -m "$(cat <<'EOF' ...)"   # bash heredoc
git commit -m "subject" -m "body" && git push  # && not valid in PowerShell
git commit -m "subject"              # single -m for substantive changes
```
