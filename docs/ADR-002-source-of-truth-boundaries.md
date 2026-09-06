# ADR-002 — Source-of-truth boundaries

- Repositories own truth (specs, code, OpenAPI, claim registries).
- `after-graph-governance` owns cross-repo contracts/boundaries
  (freshness re-verified against GitHub HEAD, never trusted from status files).
- Evidence (ISR audit/registry) owns claim strength; the plane never
  reinterprets claims or upgrades evidence classes.
- Four clocks stay separate: source SHA, semantic version, evidence cut,
  live HEAD. Freshness states: CURRENT / SOURCE_MOVED / STALE / UNKNOWN.
  Stale pages surface status, never pose as current. Private repos are
  excluded by allowlist; any private reference fails the build.
