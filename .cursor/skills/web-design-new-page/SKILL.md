---
name: web-design-new-page
description: Guides creation of new Jinja2 templates and additions to existing templates, with emphasis on visual coherence across the site and real-world graphic design principles. Use when creating a new Flask route with a template, adding a UI component or section to an existing page, reviewing template work for visual consistency, or auditing a page against the site's design standard.
---

# Web Design: New Pages and Additions to Existing Pages

## Before you write a single line of HTML

1. Read `web-design.mdc` — palette, CSS architecture, established component patterns.
2. Read `html-routes.mdc` — CSP nonce, loading overlay, search-first pattern.
3. Find 2–3 existing templates that are structurally similar to what you are building.
   Read them. Do not guess at patterns from memory.
4. Read `static/css/custom.css` — confirm which shared components already exist before
   inventing anything new.
5. Confirm you know which blocks `base.html` exposes: `title`, `extra_css`, `content`,
   `extra_js`. Every template extends `base.html`; never redeclare Bootstrap or the
   navbar.

---

## Real-world design principles — applied to this project

These are not preferences. They are the observable rules behind why well-designed pages
feel coherent and poorly-designed ones feel noisy or confusing.

### 1. Visual hierarchy

Every page has one primary message. Everything else is subordinate to it.

- Page title (`<h1>` or `<h2>`) is the largest text. It appears once.
- Section headings (`<h4>`, `<h5>`) are smaller. Component headings (`.info-box`,
  `.explanation-section`) use `<h6>` per ADR-0046.
- Never skip heading levels. `<h1>` → `<h3>` with no `<h2>` breaks screen-reader
  navigation and visual rhythm.
- Weight signals importance. Use `fw-bold` or `fw-semibold` on numbers or labels that
  the user is scanning for. Use `text-muted` on metadata that supports but does not lead.

### 2. Proximity and grouping

Related elements must be visually closer to each other than to unrelated elements.
Users infer relationships from spacing.

- Bootstrap spacing scale: `mb-2` within a logical group, `mb-4` between groups,
  `mb-5` between major page sections. Do not mix arbitrary `px` values with the scale.
- A filter form and its results are one unit. A methodology explanation and the data it
  describes are one unit. Do not separate them with unrelated content.

### 3. Repetition (CRAP principle)

The same concept must always look the same — in every template, on every page.

- Source badges, support/oppose indicators, amount formatting, empty states, info-boxes:
  defined in `custom.css` and `web-design.mdc`. Use them. Do not vary them.
- Repetition is what makes the site feel like one product rather than a collection of
  independent pages. Every deviation erodes that coherence.
- If you find yourself writing a component that is "like `.info-box` but slightly
  different", stop. Either use `.info-box` unchanged, or add a documented variant to
  `custom.css` and `web-design.mdc` before using it.

### 4. Contrast and emphasis

Use contrast purposefully — size, weight, color — to direct attention.

- Color in this project carries meaning (see palette in `web-design.mdc`). Green = support,
  red = oppose, blue = primary/informational, table headers = `#667eea`. Do not reassign
  these meanings or introduce new palette entries.
- Avoid using color decoratively. A blue `<span>` that does not link anywhere and is not
  an info element confuses users.
- Use `fw-bold` on exactly the fields users scan for in a results table. If every cell
  is bold, nothing is bold.

### 5. White space

Tight, dense layouts are harder to scan. White space is not wasted space.

- `.info-box` has `padding: 1.5rem` for a reason. Do not reduce it.
- Tables should have `table-hover` to give rows breathing room on hover.
- Avoid stacking more than three pieces of information in a single table cell without
  a visual separator.

### 6. Line length and readability

Prose paragraphs that span full width on a wide screen are unreadable (90+ characters
per line). This applies to all explanatory text — info-boxes, methodology sections,
empty-state descriptions.

- Constrain prose to a readable column: `col-lg-8` or `col-md-10` at most.
- This is already the norm in `.info-box` (it sits inside the container). Do not negate
  it by placing prose in a `col-12` with no sibling column to constrain it.

### 7. Scanning patterns

Users scan before they read. The F-pattern: first line fully, second line partially,
then a vertical scan down the left margin.

- Place the most critical information (what is this, what do I do) top-left, above the
  fold. Filters and primary actions before data.
- Page subtitle or info-box copy that answers "what am I looking at" must appear before
  the filter form, not after it.
- In tables, the leftmost column is scanned most. Put the primary identifier there.

### 8. Progressive disclosure

Do not show everything at once. Show what the user needs at each step.

- Filter forms before results (search-first pattern for slow routes — see `html-routes.mdc`).
- Methodology explanation in a collapsible `.explanation-section` (Tier 2/3 per ADR-0046).
  Collapsed by default so returning users are not re-reading content they already know.
- Secondary statistics, data quality notes, and caveats belong in the collapsible section.
  They are important — they do not need to be prominent.

### 9. Affordance

Interactive elements must look interactive. Non-interactive elements must not.

- Sortable table headers: `class="sortable"` — this applies the cursor and hover state
  from `custom.css`.
- Clickable rows: `class="clickable-row"` plus a `data-href` attribute.
- Do not use `cursor: pointer` on non-interactive elements. Do not make static text
  look like a link.

### 10. Accessibility baseline

WCAG AA is the minimum, not a stretch goal.

- Text contrast: 4.5:1 ratio for body text, 3:1 for large text (18px+ or 14px+ bold).
  Verify the palette values in `web-design.mdc` against this standard before using them
  on new backgrounds.
- Tables: `<th scope="col">` on every column header. `<caption>` if the table's purpose
  is not obvious from context.
- Icon-only buttons: `aria-label` is required.
- Never convey information through color alone. A red badge must also carry a text label.

---

## Workflow: creating a new page

Follow these steps in order.

### Step 1 — Determine the explanation tier (ADR-0046)

Before designing anything, decide: Tier 1, 2, or 3?

- Tier 1: raw record search returning a known form type. Info-box only (30–80 words).
- Tier 2: methodology-dependent results — thresholds, AI extraction, computed scores.
  Info-box plus collapsible `.explanation-section` (80–200 words total).
- Tier 3: AI-assisted features. Full explanation with caveats and model identity.

State the tier in the pull request description. This is required by ADR-0046.

### Step 2 — Define the information hierarchy

Write it out before touching HTML:

1. What is the primary content / primary action on this page?
2. What is secondary (filters, navigation, context)?
3. What is tertiary (methodology, caveats, data provenance)?

Primary content should be the visual anchor. Everything else should feel subordinate.

### Step 3 — Identify existing components to reuse

Open `custom.css` and `web-design.mdc`. List which components you will use.
Any component not in that list needs to be justified and added to `custom.css` before
it appears in a template.

### Step 4 — Build the template

Structure every new template in this order:

```html
{% extends "base.html" %}
{% block title %}Page Title{% endblock %}

{% block extra_css %}
{# Only styles specific to this single template go here.
   Shared components: custom.css only. #}
{% endblock %}

{% block content %}
  {# 1. Page heading (h1/h2) #}
  {# 2. Info-box (Tier 1+ per ADR-0046) — always above the filter form #}
  {# 3. Filter form (if applicable) — loading overlay wired here #}
  {# 4. Primary content / results #}
  {# 5. Explanation section (Tier 2+, collapsible, below primary content) #}
{% endblock %}

{% block extra_js %}
{# nonce="{{ g.csp_nonce }}" on every inline script block #}
{% endblock %}
```

### Step 5 — Write explanatory copy

Apply ADR-0046 prose conventions (read lines 362–390 of the ADR if needed):

- Answer all four questions: what am I looking at, where did it come from, what
  methodological choices were made, what should I not conclude.
- Write at peer level for a working professional. Do not define terms the audience
  uses daily. Do define application-specific terms (True Abstention, alignment score).
- No em-dashes. No coaching the reader on results they can interpret themselves.
- Verify every claim against the source before writing it in the template — this is a
  codebase claim subject to the anti-hallucination protocol.

If the route has both a form and a results page, matching explanatory text is required
on both from the start (ADR-0046 form/results parity rule).

### Step 6 — Homepage title card alignment

If the new route will appear on the homepage, review the title card text in
`presentation/web/routes/index.py` for consistency with the route-level explanation.
The title card is the subscriber's first encounter with the tool.

### Step 7 — Visual self-audit (see checklist below)

### Step 8 — Run lint and tests

```powershell
./make.ps1 lint
./make.ps1 test
```

---

## Workflow: adding to an existing page

### Step 1 — Read the entire existing template first

Do not add to a template you have not fully read. Note which CSS classes it already
uses, what tier of explanation it carries, and where in the visual hierarchy your
addition will land.

### Step 2 — Identify the visual tier of the existing page

Does it use `.info-box` (Tier 1)? An `.explanation-section` (Tier 2)? Confirm the
page's existing pattern before deciding what component to add.

### Step 3 — Select the right component

For your addition, choose from existing components in `web-design.mdc` and `custom.css`.
If the right component does not exist:

1. Add it to `custom.css` with a documented name.
2. Update `web-design.mdc` with the HTML pattern and its intended use.
3. Then use it in the template.

Never define a component inline in a template if it will be used on more than one page.

### Step 4 — Preserve the visual rhythm of the page

Your addition must fit into the existing hierarchy without disrupting it. Ask:

- Does this addition compete visually with the primary content?
- Does it sit at the right heading level?
- Is the spacing consistent with the surrounding elements (Bootstrap spacing scale)?

### Step 5 — Visual self-audit (see checklist below)

### Step 6 — Run lint and tests

---

## Visual self-audit checklist

Run through this before declaring any template work done.

**Component correctness**
- [ ] Every component maps to an entry in `web-design.mdc` or `custom.css`.
- [ ] No CSS class is defined in a per-template `<style>` block that is also used on
      another template.
- [ ] `.info-box` headings use `<h6>` + `bi-info-circle` + "About This Data".
- [ ] `.explanation-section` headings use `<h5>` + `bi-info-circle` + "Understanding
      This Analysis".
- [ ] `alert alert-info` / `alert alert-warning` are used for status messages only,
      not for methodology explanations.
- [ ] Colors are from the `web-design.mdc` palette only. No one-off hex values.

**Visual hierarchy**
- [ ] There is exactly one primary heading on the page.
- [ ] Heading levels are not skipped.
- [ ] Prose is constrained to a readable column width (not `col-12` full-width).
- [ ] The info-box appears above the filter form, not below it.

**Tables**
- [ ] Every data table is wrapped in `<div class="table-scroll-container">`.
- [ ] No `overflow-x` is defined in a per-template `<style>` block.
- [ ] Every sortable column header has `class="sortable" data-column="..."`.
- [ ] Sticky headers use `position: sticky; top: 0; z-index: 1020; background-color: #667eea` on `<thead th>`.
- [ ] Tables use `table table-hover table-sm` Bootstrap classes.

**Interaction**
- [ ] Clickable rows have `class="clickable-row"` and `data-href`.
- [ ] No `onclick`, `onchange`, or other inline event handlers anywhere.
- [ ] Every inline `<script>` block has `nonce="{{ g.csp_nonce }}"`.
- [ ] If the route queries the database, the loading overlay is included and wired.

**Explanatory content (ADR-0046)**
- [ ] Tier is assigned (1, 2, or 3).
- [ ] All four questions are answered at the appropriate depth for the tier.
- [ ] If the route has a form + results page: both pages carry matching explanatory text.
- [ ] Homepage title card is consistent with route-level explanation (if applicable).
- [ ] No em-dashes in any copy.

**Accessibility**
- [ ] Table column headers use `<th scope="col">`.
- [ ] Icon-only interactive elements have `aria-label`.
- [ ] Information is not conveyed by color alone.

---

## See also

- Component patterns and palette: `web-design.mdc`
- CSP nonce, loading overlay, search-first: `html-routes.mdc`
- Explanatory text tiers and prose rules: `docs/adr/0046-route-explanatory-text-audit-and-standard.md`
- DTO boundary (routes must not pass domain entities to templates): `dto-boundary.mdc`
