# Aftergraph Knowledge Plane (`Aftergraph/docs`)

Public developer & research portal — a **compiler/rendering/discovery layer**,
not an owner. Repositories own truth, `after-graph-governance` owns boundaries,
evidence owns claim strength. This repo pins exact SHAs, renders with
provenance + freshness, and fails the build on private-source leakage.

- Site: Astro + Starlight + TypeScript + Brand OS (`src/styles/brand.css`)
- Sources: `src/data/sources.ts` (typed manifest + public allowlist)
- Gates: `node scripts/validate.mjs` (schema, links, ownership, provenance,
  private leakage, OpenAPI, catalog) · `node scripts/freshness.mjs`
- Decisions: `docs/ADR-*.md`
