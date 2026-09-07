# Changelog

All notable changes to the Aftergraph Knowledge Plane. Dates UTC.
Format inspired by Keep a Changelog; versions are portal slices, not semver.

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