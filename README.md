# Aftergraph Knowledge Plane (`Aftergraph/docs`)

**Live: [docs.aftergraph.org](https://docs.aftergraph.org)**

Public developer & research portal — a **compiler/rendering/discovery layer**,
not an owner. Repositories own truth, `after-graph-governance` owns boundaries,
evidence owns claim strength. This repo pins exact SHAs, renders with
provenance + freshness, and fails the build on private-source leakage.

## What's inside

- **Human surface**: Quickstart, Tutorials, How-to guides, Reference
  (contracts/claims/glossary), Explanation, API reference (Scalar from
  canonical OpenAPI), Trust & Verification, FAQ, Troubleshooting,
  Contributing, Changelog, Brand.
- **Machine surfaces**: `llms.txt` + scoped indexes, 27 ACC-shaped context
  packs (`/context/`), `/status.json`, `/source-state.json`,
  `/build-manifest.json`, and a read-only stdio **Docs MCP** (9 tools).
- **Verification**: every page carries provenance (owner repo@full-SHA +
  semantic version + evidence cut); freshness distinguishes repository churn
  from semantic drift (ADR-004); claims render registry-verbatim, never
  reinterpreted.

## Gates (build fails on any violation)

`npm run build` runs all nine:
schema · links · ownership · provenance · private-leakage · OpenAPI ·
catalog · graph consistency · context packs. Plus: CRLF + private-source
scan (`scan-public.mjs`), production smoke (14 routes) after deploy.

## Development

```bash
npm ci
npm run build                      # all gates + 28 pages
npx astro preview                  # http://localhost:4321
node scripts/smoke.mjs http://localhost:4321
node scripts/freshness.mjs         # pinned SHAs vs live remote state
node scripts/adopt-source.mjs Aftergraph/<repo> <full-sha>   # explicit pin adoption (ADR-004)
```

Windows: repo is LF-only (hard gate) — strip before committing:
`sed -i 's/\r$//' <files>`.

## Releases

The Knowledge Plane is in production. Tags follow a portal-slice scheme;
full history lives in [`CHANGELOG.md`](./CHANGELOG.md).

- **Latest — [v1.1.0](https://github.com/Aftergraph/docs/releases/tag/v1.1.0)**
  (production hardening: system-level UX, agent-surface depth,
  operational polish)
- [v1.0.0](https://github.com/Aftergraph/docs/releases/tag/v1.0.0)
  (parity with Claude/OpenAI/Hermes developer docs)

In-progress work is tracked in [`OVERNIGHT-STATE.md`](./OVERNIGHT-STATE.md).

## Decisions & state

- Architecture decisions: `docs/ADR-001..005`
- Parity feature list + DoD vs Claude/OpenAI/Hermes docs: `docs/PARITY-FEATURES.md`
- Release history: [`CHANGELOG.md`](./CHANGELOG.md)
- Overnight program state: [`OVERNIGHT-STATE.md`](./OVERNIGHT-STATE.md)

## Deploy

Direct-upload to Cloudflare Pages (project `aftergraph-docs`,
custom domain docs.aftergraph.org) after green local gates; CI runs the
same gates remotely on every push/PR and smoke-tests production after
deploy. Scheduled verifier (6h) re-checks pins, commits an append-only
history log, uploads immutable artifacts, and opens adoption issues on
semantic drift — never auto-pins.