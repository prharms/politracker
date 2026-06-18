---
name: frontend-style-audit
description: Audits Jinja2 templates for visual style inconsistencies and produces a prioritised remediation plan. Use when asked to audit front-end consistency, fix visual inconsistencies, standardise table styles, fix header colors, or when the user mentions the site looking inconsistent or unprofessional.
---

# Front-End Style Audit

## Why this matters

Inconsistency signals a lack of craft. Every page that looks different from the next
forces the user to re-learn the UI. The audit below targets the four categories where
this codebase has documented, widespread drift.

---

## Canonical standards — the single source of truth

Before auditing, internalise these. Everything else is a deviation.

### Data table

```html
<div class="table-scroll-container">
    <table class="table table-striped table-hover table-sm">
        <thead>
            <tr>
                <th class="sortable" data-column="name"
                    style="position: sticky; top: 0; z-index: 1020;
                           background-color: #667eea; color: #fff;">
                    Name
                </th>
            </tr>
        </thead>
        <tbody>
            <tr class="clickable-row" data-href="...">
                <td>...</td>
            </tr>
        </tbody>
    </table>
</div>
```

Rules:
- Wrapper: always `<div class="table-scroll-container">` — never `table-responsive`,
  never a per-template `.table-container` with inline `overflow-x`.
- Classes: always `table table-striped table-hover table-sm` — never omit `table-sm`,
  never use `table-bordered` or `table-borderless` on public data tables.
- Sticky header: `#667eea` background, `#fff` text, `position: sticky; top: 0;
  z-index: 1020` — no other color. Not `#0d6efd`, not `#343a40`, not `table-dark`.
- Sortable headers: `class="sortable" data-column="..."` on every sortable `<th>`.
- Clickable rows: `class="clickable-row" data-href="..."`.

### Explanatory boxes

- Methodology/data-source text above a filter form: `<div class="info-box">`.
- Collapsible analysis explanation: `<div class="explanation-section">`.
- `alert alert-info` and `alert alert-warning` are for **status messages and filter
  summaries only** — never for static explanatory copy.

### Colours

Use only values from `web-design.mdc`. Do not introduce hex values in per-template
`<style>` blocks for anything in the established palette. Move any shared color usage
to a named class in `custom.css`.

### Per-template CSS

A CSS rule that appears in more than one template belongs in `custom.css`.
A `<style>` block in a template is only justified for rules used exclusively on that
one page. Filter panels (`.filter-panel`, `.filter-grid`, etc.) that appear on multiple
California disclosure pages must be centralised.

---

## Audit workflow

### Phase 1 — Scope the audit

Decide whether you are auditing the whole site or a specific area. For a targeted
audit, pick a set of related templates (e.g. all California disclosure pages, all admin
pages, all profile pages).

Read each template in scope before writing any findings. Do not report findings from
memory.

### Phase 2 — Check each category

For each template in scope, check the following. Record every deviation.

#### Category A — Table classes

Read the `<table class="...">` on every table.

Deviations to record:
- Table with no Bootstrap `table` class at all.
- Missing `table-sm`.
- Missing `table-striped`.
- Missing `table-hover`.
- `table-bordered` or `table-borderless` on a public data table.
- `thead class="table-dark"` or `thead class="table-light"` used instead of inline
  sticky header style.

#### Category B — Scroll container

Read the wrapper around every `<table>`.

Deviations to record:
- `<div class="table-responsive">` — replace with `table-scroll-container`.
- Custom per-template class (`.table-container`, `.daily-breakdown-scroll-container`,
  `.crosstab-container`, etc.) — consolidate into `table-scroll-container` unless the
  table has genuinely unique scroll requirements (document why).
- `overflow-x: auto` defined in a per-template `<style>` block instead of using the
  shared class.
- Plain `<table>` with `width: 100%` in per-template CSS and no scroll wrapper.

#### Category C — Sticky header colour

Read the `<thead>` and any CSS rules that affect `thead th` background.

Deviations to record:
- Any value other than `#667eea` on a sticky header.
- `background-color: #0d6efd` — off-palette for headers.
- `background-color: #343a40` or `#212529` — dark grey, inconsistent with the rest.
- Bootstrap `table-dark` on `thead` — produces a different shade and loses the brand
  purple.
- Missing `position: sticky; top: 0; z-index: 1020` — header scrolls away.

#### Category D — Explanatory box class

Read every `<div class="alert ...">` in the template body (not flash message blocks).

Deviations to record:
- `alert alert-info` used for static methodology text — replace with `.info-box`.
- `alert alert-secondary` used for empty states — replace with `.empty-state`.
- `alert alert-warning` used for persistent caveats (not a form validation message)
  — evaluate whether `.info-box` or `.explanation-section` is more appropriate.

#### Category E — Duplicated per-template CSS

Scan each `{% block extra_css %}` block.

Deviations to record:
- CSS class defined in this template that also appears in another template's `<style>`
  block — it belongs in `custom.css`.
- Common filter panel classes (`.filter-panel`, `.filter-grid`, `.filter-header`,
  `.filter-toggle`, `.filter-actions`) defined per-template across multiple California
  disclosure pages — these should be consolidated once.
- `.sortable`, `.table-container`, `.stats`, `.pagination`, `.empty-state` defined
  per-template — all of these are candidates for `custom.css`.

---

## Phase 3 — Write the findings report

Group findings by category. For each finding state:

1. File path (relative to `legiscan_loader/presentation/web/templates/`)
2. Line number
3. What is wrong
4. What it should be

Example:

```
Category C — Sticky header colour
  california/lobbying_activity_expenditures.html:145
  thead th uses #0d6efd — should be #667eea

Category A — Table classes
  california/behested_payments.html:371
  <table> has no Bootstrap classes — should be table table-striped table-hover table-sm
```

---

## Phase 4 — Remediation order

Fix in this order. Each category can be batched across multiple templates in a single
commit if the changes are purely mechanical.

1. **Category C (header colour)** — highest visibility, lowest risk. Change one hex
   value per `<th>` rule. No logic change.
2. **Category A (table classes)** — add missing Bootstrap classes. No logic change.
3. **Category B (scroll container)** — replace `table-responsive` and per-template
   scroll wrappers with `<div class="table-scroll-container">`. Remove the per-template
   CSS rule that defined it. Verify the table still scrolls correctly.
4. **Category D (alert → info-box)** — replace `alert alert-info` with `<div
   class="info-box">` on static explanatory copy. Update heading to `<h6>` with
   `bi-info-circle` and text "About This Data" per ADR-0046.
5. **Category E (CSS consolidation)** — move shared classes to `custom.css`. Delete
   per-template copies. This is the highest-risk category; test each page visually
   after consolidating.

---

## Phase 5 — Verification

After each batch of fixes:

```powershell
./make.ps1 lint
./make.ps1 test
```

Lint does not validate HTML or CSS, but it will catch any Python changes introduced
alongside the template fixes (e.g. if a route or DTO was modified). The test suite
will catch broken routes.

Visual check: open the affected page in the browser and confirm the table header is
purple (`#667eea`), the table has stripes and hover, and the scroll bar appears when
the table overflows.

---

## Known high-priority targets (from codebase audit)

These templates were confirmed to have deviations and should be addressed first:

**Header colour deviations:** `ca_legislator_profile/profile.html` (uses `#0d6efd`),
`ca_organization_profile/profile.html` (uses `#0d6efd`), `abstention_report_detail.html`
(uses `#212529`), `compare_legislators_results.html` (uses `#343a40`).

**No Bootstrap table classes:** `california/lobbying_activity_expenditures.html`,
`california/lobbying_other_payments.html`, `california/behested_payments.html`,
`california/form_700_gifts.html`, `california/independent_expenditure_summary.html`,
`california/ca_interest_group_positions.html`.

**Scroll container inconsistency:** `table-responsive` used in 20+ templates;
custom per-template containers in `abstention_report_detail.html`,
`ca_legislator_profile/profile.html`, `ca_organization_profile/profile.html`.

**Alert used as explanatory copy:** `ca_legislator_profile/profile.html`,
`ca_organization_profile/profile.html`, `session_summary.html` among many others.

---

## See also

- Canonical component patterns and palette: `web-design.mdc`
- Explanatory box tiers and heading rules: `docs/adr/0046-route-explanatory-text-audit-and-standard.md`
- New page checklist: `web-design-new-page` skill
