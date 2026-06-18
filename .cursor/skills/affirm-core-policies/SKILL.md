---
name: affirm-core-policies
description: Re-reads and affirms understanding of the anti-hallucination protocol and hexagonal architecture import rules. Use when the user asks the agent to affirm, confirm, or demonstrate understanding of core project policies, or at the start of any task involving architectural decisions, template copy, or codebase claims.
---

# Affirm Core Policies

## Instructions

When this skill is invoked:

1. Read `.cursor/rules/anti-hallucination.mdc`
2. Read `.cursor/rules/clean-architecture-imports.mdc`
3. Output the affirmation below verbatim, then fill in the bracketed section for the current task.

## Required affirmation output

> **Core policy affirmation**
>
> Anti-hallucination: Every claim about this codebase must be sourced from a file read in this session, cited with file and line number. Claims are Read (cited), Inferred (reasoned from read evidence, stated explicitly), or Assumed (flagged and verified before acting). Template copy describing data, calculations, thresholds, or classifications is a codebase claim and must be verified by reading the source before writing — not after.
>
> Hexagonal architecture: The dependency arrow points inward. Presentation calls use cases only. Use cases declare needs via ports (Protocol interfaces) and never import from infrastructure — use case constructors are typed against the Protocol, not the concrete class. Infrastructure implements ports and never contains business logic. Domain imports only from shared. Container is the only place adapters are wired to ports — it imports the concrete class lazily inside the factory method and returns it typed as the Protocol. There are no exceptions and no temporary workarounds.
>
> Transitive import ban: `lint-imports` traces the full import graph. The ban on `presentation` importing `domain` applies regardless of hop count. A path `presentation → application → domain` is a violation even though the route never imports domain directly. The failure mode is importing a domain constant or rule class at the top of a use case that routes call. The fix is always in the application layer: replace the domain reference with a string or numeric literal defined as a module-level constant in the use case file. Type-only imports under `TYPE_CHECKING` are safe. Before writing or editing any use case that is called by a route, scan every top-level import for `domain.*` references and eliminate them.
>
> Planning response risk: Planning responses, "what is next" answers, and workflow sequences carry the same hallucination risk as code changes. Every command, file path, and method name in a planning response must have a cited source before it is written. If the next step involves a CLI command, read the command implementation and entry point before naming it.
>
> Current task risk assessment: [state which policy is most at risk in this specific task and how you will avoid violating it]

## When to apply proactively

Apply this skill without being asked when:
- Starting a task that touches more than two layers
- Writing or editing any Jinja2 template that contains explanatory copy
- About to make a claim about how a route, use case, repository, or DTO works
- The user asks "affirm", "confirm understanding", or "do you understand the policy"
