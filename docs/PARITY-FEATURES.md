# Aftergraph Knowledge Plane — Parity Feature List & DoD

Comparison basis: Claude Developer Docs (docs.claude.com), OpenAI Platform Docs,
Hermes Agent Docs (hermes-agent.nousresearch.com), Mintlify/Stripe-class
portals. Date: 2026-09-07.

## Gap analysis (what they have, what we have, verdict)

| Capability | Claude/OpenAI/Hermes | Aftergraph/docs | Verdict |
|---|---|---|---|
| Full-text search | Pagefind/Algolia/DocSearch | ✅ Pagefind (Starlight built-in) | PAR |
| llms.txt + agent surfaces | Claude Code, Hermes | ✅ + scoped indexes + provenance boundary | **AHEAD** |
| MCP server for docs | Claude docs (read-only concept) | ✅ 7 tools, stdio, provenance-bounded | **AHEAD** |
| API reference from OpenAPI | Scalar/Mintlify | ✅ Scalar from canonical OpenAPI | PAR |
| Quickstart (first real task ≤ 10 min) | ✅ every portal | ❌ pointer only | **GAP → build** |
| Real tutorials (step-by-step, runnable) | ✅ | ❌ one-liner pointers | **GAP → build** |
| Real how-to guides (task-oriented) | ✅ | ❌ one-liner pointers | **GAP → build** |
| Real reference pages | ✅ | ⚠️ links only (contracts OK) | **GAP → build** |
| Explanation pages (why/ADR links) | ✅ | ⚠️ thin (one paragraph) | **GAP → build** |
| Copy-code buttons / runnable examples | ✅ | ⚠️ Starlight default only, no runnable examples | **GAP → build** |
| Feedback widget (page helpful?) | ✅ common | ❌ | **GAP → build** |
| "Edit this page" links | ✅ | ⚠️ Starlight supports; not configured | **GAP → config** |
| Last-updated timestamps | ✅ | ✅ provenance (stronger: SHA-bound) | PAR+ |
| Versioning / changelog | ✅ | ⚠️ ADRs + git only | **GAP → build (CHANGELOG)** |
| Glossary | ✅ Claude/Hermes | ❌ (terms live in governance repo) | **GAP → build (curated)** |
| FAQ | ✅ | ❌ | **GAP → build** |
| Troubleshooting page | ✅ | ❌ | **GAP → build** |
| Community/contributing | ✅ | ⚠️ .github only, not linked | **GAP → build** |
| Search UX: keyboard shortcut hint | ✅ | ✅ Starlight (Ctrl+K) | PAR |
| Dark/light theme | ✅ | ✅ dark-first override | PAR |
| OG/social cards | ✅ | ✅ (this session) | PAR |
| Favicon/app icons | ✅ | ✅ (this session) | PAR |
| Breadcrumbs/sidebar IA | ✅ | ✅ Starlight | PAR |
| Mobile responsive | ✅ | ✅ Starlight | PAR |
| Accessibility (skip link, aria) | ✅ | ✅ Starlight defaults + provenance aria-label | PAR |
| 404 page | ✅ | ✅ Starlight default | PAR |
| Human sitemap | implicit | ⚠️ sitemap.xml only | **GAP → build (overview/index pages)** |
| Security/trust page | ✅ | ❌ (evidence page partially covers) | **GAP → build (link evidence + ADRs)** |
| Roadmap | ✅ some portals | ❌ | SKIP (YAGNI — research org, not product marketing) |
| i18n | ✅ big portals | ❌ | DEFER (Da/En later; Starlight supports) |
| Analytics | ✅ | ❌ | DEFER (privacy stance; needs owner decision) |
| Video/demos | ✅ some | ❌ | DEFER |

## Feature list to build now (this execution)

F1. Quickstart — "First verified outcome in 10 minutes": clone→pin→verify flow
    against the plane itself (dogfood: the plane verifies its own sources).
F2. Tutorials (2 real, runnable): T1 "Trace a claim from this page to the
    registry commit"; T2 "Consume the plane via MCP" (stdio wiring + 7 tools).
F3. How-to guides (4): H1 verify freshness of any page; H2 adopt a moved
    source (explicit, ADR-004); H3 add a context pack consumer; H4 wire the
    Docs MCP into Claude Code / Hermes / generic client.
F4. Reference: contracts index (auto-generated table from contracts.json),
    glossary (curated canonical terms from governance), claims reference
    (C-001..C-008 table).
F5. Explanation: "Why a compiler, not an owner" (full ADR-002 narrative),
    "The four clocks", "Evidence classes".
F6. FAQ (8-10 real questions incl. 'is this an industry standard?' → no),
    Troubleshooting (build gates, freshness states, MCP connection).
F7. Feedback widget (per-page "was this helpful" → GitHub issue prefilled —
    no backend, privacy-clean) + Edit-this-page + last-updated.
F8. CHANGELOG.md + link in Company.
F9. Contributing + Community page (links .github, governance, issue
    templates).
F10. Trust & verification page (links evidence, ADR-004, audit registry).

## Definition of Done (per feature)

- Content follows Diátaxis mode strictly (one mode per page).
- Every page: provenance entry (page → owner repo@SHA), internal links
  resolve, no private-source leakage (scan gate).
- Claims rendered verbatim from registry — no reinterpretation.
- CI gates green: tsc, validate (9 gates), build, scan-public, smoke.
- llms.txt scope updated if a new section is agent-relevant.
- Deployed to docs.aftergraph.org and verified 200 + smoke pass.

## Global DoD

- All 10 features live, 0 broken links, CI green on main, deployed commit
  == HEAD, freshness summary healthy, org README unchanged (already links
  portal).
- Explicit non-goals: analytics, i18n, roadmap, video, marketing copy.