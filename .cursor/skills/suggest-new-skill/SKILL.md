---
name: suggest-new-skill
description: Identifies moments during development where a new skill should be proposed, evaluates whether the pattern is skill-worthy, and produces a crisp proposal for the user before creating anything. Use proactively when a non-obvious bug is fixed, a pattern is used for the second time, an external library behaves unexpectedly, or a refactor reveals a structural lesson. Also use when the user asks "should we make a skill for this?" or "what have we learned?"
---

# Suggesting New Skills

Skills are reusable guidance. The test for whether something deserves a skill
is not "was this interesting?" but "will this pattern recur, and would the
agent get it wrong without written guidance?"

---

## When to proactively suggest a skill

Raise a skill suggestion immediately after any of the following:

### A non-obvious bug was fixed
The bug was caused by a library behaving differently from its documented
or intuitive behavior. Without a written record, the same bug will recur
on the next project.

Examples from this codebase:
- `urllib.robotparser.read()` returns false-deny on a 403, not an error.
- `egg-info` is not updated unless the package is reinstalled after changing
  `pyproject.toml`.
- Black and Isort format differently from what flake8 E203/W503 expects,
  requiring explicit ignores in `.flake8`.

### A pattern was used for the second time
If the same structural solution appears in two places, it is a pattern.
The second time it is needed is the moment to capture it.

Examples: the `on_progress` callback pattern for long-running use cases,
the `requests.Session` + `rp.parse()` pattern for robots.txt.

### A refactor was forced by a rule violation
The code was written one way, a linter or architecture check rejected it,
and it had to be restructured. The correct structure should be documented
so the first attempt is right next time.

Examples: composition root required because `import-linter` rejected
`presentation -> container`, McCabe complexity refactor splitting
`_build_where` into helpers.

### An external tool had surprising behavior
A library, framework, or OS behaved in a way that was not predictable from
reading its documentation at face value.

Examples: `urllib.robotparser` 403 behavior, `pyproject.toml` build-backend
naming difference between setuptools versions, PowerShell `&&` vs `;`.

### A decision required significant research or debate
If it took multiple messages to settle on an approach, that deliberation
has value. Future sessions should not repeat it.

Examples: full jitter vs equal jitter, SQLAlchemy Core vs ORM for SQLite,
composition root placement.

---

## When NOT to suggest a skill

- The pattern is specific to one project and will not recur elsewhere.
- The pattern is already covered by an existing skill — update that skill instead.
- The fix was trivial and obvious in hindsight (e.g. a typo, a missing import).
- The lesson is already expressed by an existing workspace rule.

---

## Evaluating skill-worthiness

Before proposing, apply this test:

**Recurrence** — Would a developer starting a new project of the same type
encounter this situation? If yes, it is skill-worthy.

**Non-obviousness** — Would a competent developer, reading only the library
documentation, get this right on the first attempt? If no, it is skill-worthy.

**Scope** — Is the lesson broad enough to fill a useful skill (at least 3-4
concrete patterns or rules) but narrow enough to have a single clear title?
If the scope is too narrow, consider adding it to an existing skill instead.

**Coverage** — Does any existing skill already cover this? Search the skill
directory before proposing a new one.

---

## The proposal format

Do not create the skill without user approval. Present a concise proposal:

```
Skill proposal: <name>

What it covers:
- <one sentence per major section>
- ...

Trigger: <what moment in this session prompted it>

Existing skill it would update or complement: <skill name or "none">

Worth creating?
```

Keep the proposal short. One bullet per section is enough. The user should
be able to approve or redirect in one message.

---

## After approval — hand off to create-skill

Once the user approves, read `.cursor/skills-cursor/create-skill/SKILL.md`
and follow it to produce the new skill file. The new skill must:

- Have a frontmatter `name` and `description` that would trigger it correctly
  in the skill picker.
- Cover the non-obvious parts — not just "here is the correct code" but
  "here is why the obvious approach fails."
- Include a checklist at the end so the pattern can be verified before
  marking work done.
- Reference related skills and rules in a "See also" section.

---

## Skill update vs new skill

If the lesson belongs to an existing skill, update that skill rather than
creating a new one. The update is appropriate when:

- The lesson is a new pitfall within an established domain
  (e.g. the robots.txt 403 pitfall belongs in `polite-scraping`).
- The lesson adds a variant to an existing pattern
  (e.g. equal jitter added to `api-client` alongside full jitter).
- The lesson is a correction to existing guidance
  (e.g. updating an implementation example that contained the bug we just fixed).

A new skill is appropriate when:
- The domain is not covered by any existing skill.
- The lesson is large enough that adding it to an existing skill would make
  that skill unwieldy.
- The lesson applies to a different trigger scenario than the existing skill.

---

## Prompt for end-of-session review

At the end of any session involving substantive code changes, run through
this checklist mentally:

- Did we fix a non-obvious bug caused by library behavior?
- Did we use the same structural pattern more than once?
- Did we have a multi-message debate to settle on an approach?
- Did we refactor code because a rule or linter rejected the first attempt?
- Did we discover a gap in an existing skill?

If yes to any, propose a skill or skill update before the session ends.

---

## See also

- `create-skill` (user-level) — for writing the skill file once approved.
- `skill-map` — to check whether an existing skill already covers the domain.
- `adr-decision-gate` — for decisions that warrant an ADR rather than (or
  in addition to) a skill.
