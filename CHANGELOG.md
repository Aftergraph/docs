# Changelog

All notable changes to the Aftergraph Knowledge Plane. Dates UTC.
Format inspired by Keep a Changelog; versions are portal slices, not semver.

## [Unreleased] — Launcher IA (vision A)

### Added
- Homepage task launcher ("What are you trying to do?") routing to six
  verified surfaces; existing journey and deep-dive sections kept.
- `/start`: path picker (quickstart/tutorials/how-to), local commands,
  four personas with next steps.
- `/concepts`: Intent → Verified Outcome chain as a navigational map over
  golden-mission/platform/evidence/trust (no new normative claims).
- `/products`: product directory with catalog role lines, owner-repo links,
  and portal cross-links; per-product deep pages deferred to owner repos.
- Sidebar `Start` group; provenance entries + context packs for all three
  pages (47 pages / 47 packs).
- `/developers/schemas`: request/response tables generated at build time
  from the adopted OpenAPI (`scripts/schemas.mjs` → `src/data/schemas.json`,
  wired into `npm run build`); API Reference header now renders the live pin
  SHA instead of a hand-written one (fixed stale `370a0b20`).
- Honest status notes: no official SDK or unified CLI ships yet (see
  Developers hub); browser Try-it console blocked on missing CORS headers
  (probed 2026-09-07), curl/server-side only for now.
- `/standards/bindings` (evidenced standards table), `/standards/conformance`
  (registry-verbatim C-005 + reproduction states), `/research/benchmarks`
  (verbatim MISSION-Bench/STUDY-011 samples), `/examples` (cards over real
  guides only), `/company/versions` (portal-slice versioning),
  `/developers/agent-guide` (copy-paste prompts with placeholders, no
  hardcoded SHAs). Drafted in parallel by three agents; every number
  re-verified against the registries before merge (fixed: 1 wrong import
  depth, 1 projected status stated as registry status, 3 stale "7 tools"
  references — server exposes 9; tool counts are now phrased
  count-free so they cannot rot again).
- Finish-up sweep (4 agents: research, codebase, product, docs): sidebar
  gains System Map, qualified overview labels, hub-first ordering;
  orphan pages linked from their hubs; launcher copy differentiated from
  the journey; MCP table updated to the 9-tool manifest; catalog API
  source synced to the WI pin; schemas derivation falls back to OpenAPI
  `title`; links gate uses real github-slugger, skips code fences, and
  asserts schemas/pin/paths parity; context packs gain next-reading for
  new routes; orphan provenance key removed; `.gitattributes` enforces
  LF-only. (WI/governance adoptions below were owner-authorized the same
  day, superseding the verifier-queue note.)
- Owner-authorized adoptions: WI at `e50b21c4` (spec 11→51 paths, purely
  additive) and governance at `d5972d12` (V2.1: register 13→17, additive);
  sentinel citations refreshed to pin `4b0007cd` with rule-pack re-render
  (10→6) and corrected prototype claims.
- `/developers/try-it`: read-only GET console (version/migrations/
  rate-limit) with CORS-failure UX; live use needs
  [wi-backend#59](https://github.com/Aftergraph/wi-backend/pull/59)
  merged + deployed.
- All-current sync: adopted governance/WI/brand/aie/ISR/TG/sentinel/
  aftergraph.org HEADs (each content-verified: additive or identical),
  added sentinel decision #10 verbatim, killed the hand-maintained
  Status table (now rendered from `freshness-snapshot.json` at build
  time) — 11/11 CURRENT, 53/53 provenance 1:1.
- Try-it goes live: #59 merged, VDS deployed (`a926f26`), ACAO verified
  public, evil denied, journal clean; CORS notes flipped to live.

## [V1.1] — 2026-09-07 — Docs parity

Parity vs Claude/OpenAI/Hermes developer docs (feature list + DoD:
`docs/PARITY-FEATURES.md`). 28 pages, 27 context packs.

### Added
- Quickstart (10-min verified loop dogfooding the plane), 2 runnable
  tutorials, 5 how-to guides, auto-generated Reference (contracts table +
  C-001..C-008 register + glossary), Explanation (four clocks, two-status
  projection, compiler-not-owner).
- Trust & Verification page (9 mechanical gates), FAQ, Troubleshooting,
  Contributing, Changelog page + canonical CHANGELOG.md.
- Per-page feedback widget ("was this helpful?" → prefilled GitHub issue;
  no backend, no tracking) + Changelog/Contributing/issue links in every
  provenance block.
- Brand assets: generated mark + OG image (Cloudflare Workers AI FLUX),
  favicon.svg, OG/twitter meta. /company/brand page.

### Changed
- Generated surfaces (build manifest, 27 context packs, status.json) emit
  to dist/ only — git tree stays clean across builds; freshness state files
  stay committed as evidence. Validate split: pre-build soft-skips
  dist-checks, post-build hard-fails (emit-status-dist runs it).

## [V1.0] — 2026-09-07 — Collection

The plane is complete as originally scoped: provenance-stamped human docs +
machine surfaces over canonical sources, deployed and self-verifying.

### Added
- Read-only Docs MCP (stdio): 7 tools incl. `docs_get_context_pack` —
  build-bounded answers with `site_commit` in every response.
- ACC-shaped Context Packs (`/context/<page>.json`, schema
  `aftergraph.context-pack.v0`, ADR-005) + `/context/index.json`.
- Full ISR claim registry C-001..C-008 rendered verbatim (incl. STUDY-011
  live updates); canonical 5-state projection alongside verbatim audit
  status; projection can only weaken, never upgrade.
- System Map (`/platform/system-map/`) with verified mission bindings —
  unbound contract fails the build.
- Brand assets: generated mark + OG image (Cloudflare Workers AI FLUX),
  favicon.svg (code-native), OG/twitter/apple-touch meta.
- `/company/brand`, Trust & Verification, FAQ, Troubleshooting, Reference,
  Quickstart, Tutorials, How-to guides, Explanation, Changelog, Contributing.
- Custom domain: docs.aftergraph.org (Pages + proxied CNAME + cert).
- Production smoke (14 routes) in CI after deploy.

### Changed
- Freshness policy v2 (ADR-004): CURRENT / SOURCE_MOVED_CONTENT_UNCHANGED /
  SOURCE_MOVED_CONTENT_CHANGED / STALE / UNKNOWN; artifact blob fingerprints
  separate repository drift from semantic drift.
- Scheduled verifier (6h): append-only history log, immutable artifacts,
  auto-report adoption issues. Never auto-pins.
- Canonical URL docs.aftergraph.dev → docs.aftergraph.org everywhere.

### Verified
- 5 explicit source adoptions (aie, trust-gateway, works-execution, studio,
  .github) per ADR-004 — freshness 7/9 CURRENT at last verification.

## [V0.2] — 2026-09-07 — Graphs

- Contract Graph (5 nodes, 31 owner→contract→consumer edges) derived from the
  governance register; validate gate #8.
- Claim Graph chains (status → evidence class → study → cut → reproduction).
- Interactive SVG contract graph: hover traces edges, contract chips filter.

## [V0.1] — 2026-09-07 — Live Truth

- Freshness verifier + status surfaces (`/status`, `/status.json`,
  `/source-state.json`), artifact fingerprints, build manifest.
- Scheduled verifier workflow; adoption tooling; CRLF + private-leakage scan
  gates; llms.txt provenance boundary.

## [V0.0] — 2026-09-06 — Foundation

- Astro + Starlight + Brand OS; typed source manifest (9 pins, public
  allowlist); per-page provenance; Contract Explorer; Scalar API reference
  from canonical OpenAPI; IA (Platform / Developers / Research / Standards /
  Evidence / Catalog / Company); ADR-001..003.