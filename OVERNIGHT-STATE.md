# CONTINUOUS OVERNIGHT MODE — Knowledge Plane production & release

## Goal

Drive the Aftergraph Knowledge Plane (Aftergraph/docs) from V1.1 to a
**production release**: release versioning, remaining quality/parity gaps
closed, org surfaces coherent, all gates green, deployed and verified.

## Delegation (owner: Jonas — "do all owner decisions, approval given")

DEC-001: All owner decisions for this program are delegated to the agent
in-session. Scope: portal content, release versioning, IA, gate tuning,
brand surfaces, deploy targets on Aftergraph-owned infra. Pre-approved:
deploy to docs.aftergraph.org, Cloudflare Pages operations, GitHub repo
admin on Aftergraph/docs. NOT delegated: legal (trademark clearance),
external security review, paid services (no new paid API accounts).

## Release target

v1.0.0 — first tagged production release of the Knowledge Plane.
Release = tag + GitHub Release with notes + CHANGELOG alignment + green CI
+ production deploy verified + smoke green.

## Registries (this file is the queue)

### DECISIONS (DEC-NNN)
- DEC-001: owner-delegation recorded (scope above). Status: ACTIVE.
- DEC-002: release scheme = portal slices (V0.0..V1.x) already used in
  CHANGELOG; production release tags `v1.0.0` at the release commit.
  Status: DECIDED.
- DEC-003: deferred features stay deferred (analytics, i18n, roadmap,
  video) — recorded as non-goals in PARITY-FEATURES.md. Status: DECIDED.

### OPEN QUESTIONS (Q-NNN)
- Q-001: generated-surface pin-chase (manifest dirties tree every build).
  Candidate fix: move build-manifest.json + context packs to dist-only
  output, keep freshness state files committed. Owner-decision delegated:
  proceed if smoke + gates stay green.
- Q-002: remaining 2 SOURCE_MOVED_CONTENT_UNCHANGED churn (governance,
  WI-v2) — adopt on next verifier run or leave; policy says harmless.
  Decide: adopt for clean release state.
- Q-003: README.md of docs repo references old gate list (5 gates, now 9)
  + missing release info. Update.
- Q-004: llms/agents scope + /status page surface "last verification" —
  is every agent surface provenance-bounded? Audit all public JSON for
  site_commit presence.
- Q-005: verify all internal links + anchors on new pages (quickstart,
  trust, faq) — validate gate covers file existence, not anchor targets.

### NON-GOALS (locked)
- analytics/trackers, i18n, roadmap/video, marketing copy, write-capable
  MCP, auto-pin, paid APIs, trademark claims.

## Block-segregated reporting

Overnight progress reported per iteration block: what shipped (commit),
gates result, deployment state, next gap. No pooled "everything green"
claims without per-item verification.

---

# CONTINUOUS OVERNIGHT MODE — ROUND 2 (v1.1.0 production hardening)

## Release target

v1.1.0 — production hardening: system-level UX, agent-surface depth,
operational polish. Tag + GitHub Release when CI green + deploy verified.

## OPEN QUESTIONS (Q-1xx)
- Q-101: /research and /standards and /catalog and /company overview pages
  are thin stubs vs parity bar (Claude/OpenAI have real overviews). Build
  real overview pages with live derived data (graph/claims/catalog).
- Q-102: Golden Mission page is a route list, not a walkthrough. Upgrade:
  each step links to owner page + contract + evidence (bindings exist in
  system-map.json — render them).
- Q-103: No 404-page customization (Starlight default). Add brand 404 with
  search pointer.
- Q-104: Docs MCP lacks docs_search excerpts context-pack route in
  tools/list description accuracy check — audit tools/list output vs
  actual capabilities.
- Q-105: sitemap/robots.txt — verify robots.txt exists and sitemap is
  referenced; SEO parity.
- Q-106: hero CTA links: verify all hero buttons resolve (manual curl).
- Q-107: /developers overview page is a stub — make it the Diátaxis hub.
