# ADR-004: Live Truth and Freshness

- Status: Accepted
- Date: 2026-09-07
- Scope: Aftergraph/docs (Knowledge Plane) source verification

## Context

V0 pinned nine canonical repositories at exact SHAs and rendered provenance
from those pins. First live verification caught the core problem immediately:
several pinned repositories had advanced (dependabot churn and feature commits),
while the Work Intelligence OpenAPI artifact consumed by this site remained
byte-identical.

Two failure modes follow from conflating the two clocks:

1. Static source pins alone: the portal silently renders a world that no
   longer exists.
2. Remote HEAD alone: every dependabot commit reads as documentation drift,
   producing alarm fatigue and false STALE storms.

## Decision

The Knowledge Plane tracks **repository freshness** and **semantic artifact
freshness** as separate, independently reported clocks (the Four Clocks
principle: source truth, semantic truth, evidence truth, live truth).

Canonical freshness statuses (ADR-004 policy, implemented in
`scripts/freshness.mjs`):

| Status | Meaning |
|---|---|
| `CURRENT` | pinned HEAD == remote HEAD |
| `SOURCE_MOVED_CONTENT_UNCHANGED` | HEAD moved; every consumed artifact blob is byte-identical |
| `SOURCE_MOVED_CONTENT_CHANGED` | HEAD moved and at least one consumed artifact changed |
| `STALE` | content-changed observed on at least two consecutive verifications |
| `UNKNOWN` | remote state could not be verified |

Rules:

1. **Repository movement is not necessarily semantic movement.** Only
   consumed-artifact blob changes (git blob SHAs) count as semantic.
2. **UNKNOWN never counts as CURRENT.** The system fails honest, not
   optimistic.
3. **Auto-report, never auto-update.** The scheduled verifier opens one
   reviewable adoption issue on semantic drift; pins change only through
   explicit `scripts/adopt-source.mjs` + human-reviewed PR.
4. **History is carried by CI.** Each verification run appends to
   `public/source-state-history.jsonl.tail` (committed, append-only) and
   uploads an immutable `knowledge-plane-source-state-<run_id>` artifact.
   STALE threshold semantics use `--previous`.

## Consequences

- Dependabot churn is surfaced (`SOURCE_MOVED_CONTENT_UNCHANGED`) without
  triggering adoption workflows.
- Real spec/API drift is surfaced immediately and escalates to STALE if
  left unadopted.
- Rendered pages, `/status.json`, `/llms.txt` and build manifests all state
  the freshness boundary they were generated from; agents must not treat a
  generated index as fresher than its build.
- The verifier never holds deploy credentials; it is report-only with
  `contents: write` for the history log and `issues: write` for adoption
  issues.