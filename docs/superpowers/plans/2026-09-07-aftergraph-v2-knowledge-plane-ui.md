# Aftergraph V2 Knowledge Plane UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `docs.aftergraph.org` the calmer, developer-first V2 Knowledge Plane while preserving its role as a provenance-aware compiler/rendering/discovery layer over canonical sources.

**Architecture:** Keep Astro 7 + Starlight and all exact-SHA provenance/freshness/build gates. Restructure only the homepage hero, homepage journey, sidebar information architecture, and presentation tokens needed to reduce decorative AI-dashboard effects; canonical source data, claims, contracts, OpenAPI and evidence registries remain untouched.

**Tech Stack:** Astro 7, Starlight 0.42, MDX, TypeScript, CSS, existing Node validation/build scripts.

**Spec:** `Aftergraph/aftergraph.org:docs/superpowers/specs/2026-09-07-aftergraph-v2-systems-interface-design.md` on branch `feat/aftergraph-v2-systems-interface`.

## Global Constraints

- Knowledge Plane is a compiler/rendering/discovery layer; it owns no canonical truth.
- Preserve exact-SHA provenance, freshness, ownership, private-leakage, OpenAPI, catalog, graph and context-pack gates.
- Target journey: `Start -> Platform -> Build -> Standards -> Evidence -> Research -> Trust`.
- Homepage priority: Quickstart, Golden Mission, Contract Explorer, API Reference, Evidence/provenance, deeper research/governance.
- Reduce animated gradient headline, shimmer, excessive glow, decorative kicker emphasis and unnecessary floating-card treatment.
- Preserve semantic version/provenance access and the ownership boundary: repos own truth, governance owns boundaries, evidence owns claim strength.
- Keep semantic colors: control cyan, evidence teal, authority violet, decision amber, system blue, near-black navy canvas.
- No manual duplication or reinterpretation of canonical research/spec content.
- No weakening of validation/freshness/private-source gates.
- Preserve existing fonts; no new font dependency.

---

### Task 1: Add a homepage/IA V2 validation gate

**Files:**
- Create: `scripts/verify-v2-ui.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `src/components/Hero.astro`, `src/content/docs/index.mdx`, `astro.config.mjs`, `src/styles/brand.css`.
- Produces: deterministic exit `0` only when the approved V2 homepage/IA contract is present.

- [ ] **Step 1: Create the failing verifier**

Create `scripts/verify-v2-ui.mjs`:

```js
import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');
const hero = read('src/components/Hero.astro');
const index = read('src/content/docs/index.mdx');
const config = read('astro.config.mjs');
const css = read('src/styles/brand.css');

const includes = (source, needle, label = needle) =>
  assert.ok(source.includes(needle), `missing ${label}`);

includes(hero, 'Start building', 'developer-first hero CTA');
includes(hero, '/developers/quickstart/', 'Quickstart hero route');
includes(index, 'Golden Mission', 'Golden Mission homepage step');
includes(index, 'Contract Explorer', 'Contract Explorer homepage step');
includes(index, 'API Reference', 'API Reference homepage step');
includes(index, 'Evidence', 'Evidence homepage step');
includes(config, "label: 'Build'", 'Build sidebar group');
includes(config, "label: 'Trust'", 'Trust sidebar group');
assert.ok(config.indexOf("label: 'Evidence'") < config.indexOf("label: 'Research'"), 'Evidence must precede Research');
assert.ok(!css.includes('animation: ag-shimmer'), 'hero shimmer must be removed');
includes(css, ':focus-visible', 'visible focus');
includes(css, 'prefers-reduced-motion', 'reduced-motion support');

console.log('Aftergraph docs V2 UI contract: PASS');
```

- [ ] **Step 2: Add a package script**

Add:

```json
"verify:v2-ui": "node scripts/verify-v2-ui.mjs"
```

without changing dependency versions.

- [ ] **Step 3: Run RED**

```bash
npm run verify:v2-ui
```

Expected: FAIL because current `Hero.astro` does not contain the V2 developer-first action and current sidebar still uses `Developers`/`Company`.

- [ ] **Step 4: Commit the gate**

```bash
git add scripts/verify-v2-ui.mjs package.json
git commit -m "test(docs): codify V2 Knowledge Plane UI contract"
```

---

### Task 2: Simplify `Hero.astro` into a developer-first entry point

**Files:**
- Modify: `src/components/Hero.astro`
- Test: `scripts/verify-v2-ui.mjs`

**Interfaces:**
- Consumes: `provenance.json`, `build-status.json`, `contracts.json`, `graph.json` exactly as today.
- Produces: a calmer first viewport that preserves live provenance access but prioritizes first useful developer action.

- [ ] **Step 1: Keep source-derived stats, remove decorative kicker dependency**

Retain the existing data imports and `stats` derivation. Replace the pill-style kicker with a quiet metadata line:

```astro
<p class="ag-hero-meta">Knowledge Plane · {prov.index.semantic_version}</p>
```

Do not remove semantic version access or `buildStatus.page_line`.

- [ ] **Step 2: Replace hero hierarchy**

Use this visible hierarchy:

```astro
<div class="ag-hero">
  <p class="ag-hero-meta">Knowledge Plane · {prov.index.semantic_version}</p>
  <h1>Build systems that can act. Verify what actually happened.</h1>
  <p class="lede">
    Repositories own truth. Governance owns boundaries. Evidence owns claim strength.
    This portal resolves those sources into one developer and research surface.
  </p>
  <div class="ag-hero-ctas">
    <a class="ag-btn" href="/developers/quickstart/">Start building →</a>
    <a class="ag-btn ghost" href="/platform/golden-mission/">Golden Mission</a>
    <a class="ag-btn ghost" href="/standards/contracts/">Contract Explorer</a>
    <a class="ag-btn ghost" href="/developers/api-reference/">API Reference</a>
  </div>
  <div class="ag-hero-stats">...</div>
  {verified && <p class="ag-live-note">{verified}</p>}
</div>
```

- [ ] **Step 3: Verify source-bound behavior remains intact**

Run:

```bash
npm run check
```

Expected: TypeScript PASS; no import or Astro expression errors.

- [ ] **Step 4: Commit hero slice**

```bash
git add src/components/Hero.astro
git commit -m "feat(docs): make Knowledge Plane hero developer-first"
```

---

### Task 3: Rebuild the homepage as a progressive developer journey

**Files:**
- Modify: `src/content/docs/index.mdx`
- Test: `scripts/verify-v2-ui.mjs`

**Interfaces:**
- Consumes: existing `Hero` and `Provenance` components.
- Produces: ordered homepage journey from Quickstart to deeper evidence/research surfaces.

- [ ] **Step 1: Preserve the existing page frontmatter/imports**

Keep:

```mdx
---
title: "Aftergraph Knowledge Plane"
description: "Compiler over canonical sources — owns no truth."
---
import Provenance from '../../components/Provenance.astro';
import Hero from '../../components/Hero.astro';
```

- [ ] **Step 2: Replace equal-weight card grid with ordered journey**

After `<Hero />`, implement this semantic order:

```mdx
<section class="ag-journey" aria-labelledby="journey-title">
  <h2 id="journey-title">Start with one verified path</h2>
  <p>Learn the system in the order it executes, verifies, and exposes evidence.</p>

  <ol class="ag-journey-list">
    <li><a href="/developers/quickstart/"><strong>Quickstart</strong><span>Run the first useful developer path.</span></a></li>
    <li><a href="/platform/golden-mission/"><strong>Golden Mission</strong><span>Follow Observation → Verified Outcome across the system.</span></a></li>
    <li><a href="/standards/contracts/"><strong>Contract Explorer</strong><span>Inspect machine-readable contracts and ownership.</span></a></li>
    <li><a href="/developers/api-reference/"><strong>API Reference</strong><span>Use the canonical OpenAPI-rendered surface.</span></a></li>
    <li><a href="/evidence/"><strong>Evidence</strong><span>Inspect claim strength, provenance and reproduction state.</span></a></li>
  </ol>
</section>
```

- [ ] **Step 3: Add a secondary deep-dive rail without creating another card wall**

Use text links/rows for:
- Platform system map;
- Standards/contract graph;
- Research overview;
- Trust & Verification;
- Live build status.

Keep `<Provenance page="index" />` at the bottom.

- [ ] **Step 4: Run V2 verifier**

```bash
npm run verify:v2-ui
```

Expected: homepage content assertions PASS; sidebar/CSS assertions may still fail.

- [ ] **Step 5: Commit homepage slice**

```bash
git add src/content/docs/index.mdx
git commit -m "feat(docs): replace homepage grid with developer journey"
```

---

### Task 4: Align Starlight information architecture to Start → Platform → Build → Standards → Evidence → Research → Trust

**Files:**
- Modify: `astro.config.mjs`
- Test: `scripts/verify-v2-ui.mjs`

**Interfaces:**
- Consumes: existing page slugs; no content file moves required.
- Produces: reordered/relabelled Starlight sidebar with stable URLs.

- [ ] **Step 1: Keep existing slugs and only change grouping/order**

The sidebar top-level order after the implicit homepage entry must be:

```text
Platform
Build
Standards
Evidence
Research
Trust
```

Map current pages as follows:

```js
{ label: 'Platform', items: [
  { label: 'Overview', slug: 'platform' },
  { label: 'Golden Mission', slug: 'platform/golden-mission' },
  { label: 'Catalog', slug: 'catalog' },
  { label: 'Live Status', slug: 'status' },
]},
{ label: 'Build', items: [
  { label: 'Quickstart', slug: 'developers/quickstart' },
  { label: 'Overview', slug: 'developers' },
  { label: 'Tutorials', slug: 'developers/tutorials' },
  { label: 'How-to Guides', slug: 'developers/how-to' },
  { label: 'Reference', slug: 'developers/reference' },
  { label: 'API Reference', slug: 'developers/api-reference' },
  { label: 'Explanation', slug: 'developers/explanation' },
  { label: 'Docs MCP (read-only)', slug: 'developers/mcp-boundary' },
]},
{ label: 'Standards', items: [
  { label: 'Overview', slug: 'standards' },
  { label: 'Contracts', slug: 'standards/contracts' },
  { label: 'Contract Graph', slug: 'standards/contract-graph' },
]},
{ label: 'Evidence', items: [
  { label: 'Overview', slug: 'evidence' },
  { label: 'Claim Graph', slug: 'evidence/claim-graph' },
]},
{ label: 'Research', items: [{ label: 'Overview', slug: 'research' }]},
{ label: 'Trust', items: [
  { label: 'Trust & Verification', slug: 'company/trust' },
  { label: 'Company', slug: 'company' },
  { label: 'Contributing', slug: 'company/contributing' },
  { label: 'FAQ', slug: 'company/faq' },
  { label: 'Troubleshooting', slug: 'company/troubleshooting' },
  { label: 'Brand', slug: 'company/brand' },
  { label: 'Changelog', slug: 'company/changelog' },
]},
```

- [ ] **Step 2: Run TypeScript and link validation**

```bash
npm run check
node scripts/validate.mjs
```

Expected: both PASS with stable slugs and no internal link regression.

- [ ] **Step 3: Commit IA slice**

```bash
git add astro.config.mjs
git commit -m "feat(docs): align navigation to V2 developer journey"
```

---

### Task 5: Calm the visual system without removing semantic meaning

**Files:**
- Modify: `src/styles/brand.css`
- Test: `scripts/verify-v2-ui.mjs`

**Interfaces:**
- Consumes: existing CSS variables and Starlight overrides.
- Produces: lower-glow, lower-border-density homepage and consistent journey styles while keeping semantic colors and accessibility.

- [ ] **Step 1: Remove hero shimmer and pill-kicker treatment**

Delete the `ag-shimmer` keyframes and animation assignment.

Replace `.ag-hero-kicker` styles with quiet metadata styles:

```css
.ag-hero-meta {
  margin: 0 0 .8rem;
  color: var(--ag-muted);
  font: 600 .72rem/1.4 var(--sl-font-mono);
  letter-spacing: .08em;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Reduce hero framing intensity**

Use one subtle border and a flat tonal surface:

```css
.ag-hero {
  position: relative;
  border: 1px solid rgba(137, 147, 164, 0.18);
  border-radius: .9rem;
  background: rgba(10, 16, 28, 0.72);
  padding: clamp(1.5rem, 4vw, 2.6rem);
  margin: 0 0 2rem;
}
```

Headline must use `var(--ag-text)` rather than background-clipped gradient text.

- [ ] **Step 3: Add open journey styles instead of card-grid framing**

Add:

```css
.ag-journey { margin: 2rem 0 2.4rem; }
.ag-journey > p { max-width: 46rem; color: var(--ag-muted); }
.ag-journey-list { list-style: none; padding: 0; margin: 1.2rem 0 0; border-top: 1px solid var(--sl-color-hairline); }
.ag-journey-list li { border-bottom: 1px solid var(--sl-color-hairline); }
.ag-journey-list a { display: grid; grid-template-columns: minmax(10rem, .7fr) 1.6fr; gap: 1rem; padding: 1rem .15rem; text-decoration: none; }
.ag-journey-list strong { color: var(--ag-text); }
.ag-journey-list span { color: var(--ag-muted); }
.ag-journey-list a:hover strong { color: var(--ag-control); }
@media (max-width: 42rem) { .ag-journey-list a { grid-template-columns: 1fr; gap: .25rem; } }
```

- [ ] **Step 4: Keep motion accessibility**

Preserve the existing `@media (prefers-reduced-motion: no-preference)` page-enter animation only if it remains subtle. Do not add new ambient infinite animation.

- [ ] **Step 5: Run V2 verifier**

```bash
npm run verify:v2-ui
```

Expected:

```text
Aftergraph docs V2 UI contract: PASS
```

- [ ] **Step 6: Commit visual slice**

```bash
git add src/styles/brand.css
git commit -m "style(docs): calm Knowledge Plane visual hierarchy"
```

---

### Task 6: Run all Knowledge Plane gates and rendered QA

**Files:**
- No source changes unless a gate or rendered check finds a defect.

**Interfaces:**
- Consumes: complete V2 docs branch.
- Produces: all existing source/provenance gates green plus desktop/mobile visual evidence.

- [ ] **Step 1: Run static checks**

```bash
npm ci
npm run check
npm run verify:v2-ui
npm run build
node scripts/scan-public.mjs
```

Expected:
- TypeScript PASS;
- V2 UI contract PASS;
- all nine existing build gates PASS;
- 28+ pages build successfully;
- private-source scan PASS.

- [ ] **Step 2: Preview production build**

```bash
npx astro preview --host 127.0.0.1 --port 4321
```

Then:

```bash
node scripts/smoke.mjs http://127.0.0.1:4321
```

Expected: configured smoke routes PASS.

- [ ] **Step 3: Perform rendered QA**

Required viewports:
- desktop 1440x900;
- mobile 390x844.

Target flow:

```text
/ -> Quickstart -> back -> Golden Mission -> Contract Explorer -> API Reference -> Evidence
```

Verify page identity, meaningful content, no framework overlay, console health, focus visibility, no horizontal overflow and working Starlight navigation/search.

- [ ] **Step 4: Compare accepted concept vs rendered implementation**

Using frontend-app-builder fidelity workflow, inspect both concept and implementation screenshot and record at least five checks: hero hierarchy, first-use action, palette, density/glow reduction, journey row anatomy, mobile collapse and provenance visibility. Fix any material mismatch.

- [ ] **Step 5: Verify provenance remains correct**

Inspect generated homepage and source-state/build-manifest outputs. Confirm the homepage still renders source provenance and that no UI edit changed source ownership or evidence strength.

- [ ] **Step 6: Commit any QA fixes and ensure clean tree**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and clean tree after final commit.

---

### Task 7: PR, CI, Cloudflare Pages deployment and production smoke

**Files:**
- No source change unless CI or deployment finds a defect.

**Interfaces:**
- Consumes: green V2 docs branch.
- Produces: merged docs update and verified `docs.aftergraph.org` deployment when authorized.

- [ ] **Step 1: Push branch and open PR**

PR title:

```text
feat: Aftergraph V2 Knowledge Plane interface
```

PR body must list:
- developer-first homepage journey;
- calmer hero/visual system;
- IA relabel/reorder;
- preserved exact-SHA/freshness/evidence gates;
- local gate results.

- [ ] **Step 2: Wait for repository CI and inspect failures**

Do not merge while any required CI job is pending/failing.

- [ ] **Step 3: Merge using repository-supported strategy**

Do not bypass branch rules or required checks.

- [ ] **Step 4: Deploy through existing Cloudflare Pages contract when authorized**

Use the repository's existing production deployment mechanism/project `aftergraph-docs`. Do not invent a second hosting path.

If deployment credentials are unavailable, report `DOCS_PRODUCTION_DEPLOY_BLOCKED_AUTH` and stop before claiming production completion.

- [ ] **Step 5: Production smoke**

Run:

```bash
node scripts/smoke.mjs https://docs.aftergraph.org
```

Expected: all configured production routes PASS.

Also verify manually/rendered:
- homepage first viewport;
- Quickstart;
- Golden Mission;
- Contract Explorer;
- API Reference;
- Evidence;
- mobile homepage.
