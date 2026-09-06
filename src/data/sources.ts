// Canonical source manifest. Ground rule: owning repo → canonical source
// → knowledge compiler (this repo) → human + machine surfaces.
// This repo owns NO specs/claims/contracts — it only pins exact SHAs.
export interface KnowledgeSource {
  repository: string; // "Aftergraph/<name>"
  ref: string;
  commitSha: string; // full 40-char SHA, fresh-verified 2026-09-06
  owner: string; // canonical owning team/program
  kind:
    | 'documentation' | 'specification' | 'research' | 'contract'
    | 'api' | 'schema' | 'evidence' | 'benchmark' | 'model' | 'skill';
  visibility: 'public' | 'private';
  maturity?: string;
  evidenceCut?: string;
}

// Explicit public allowlist. Private repo content MUST never leak into the
// public build even when the builder holds GitHub access — validate.mjs
// fails the build on any reference outside this list.
export const PUBLIC_ALLOWLIST = [
  'Aftergraph/after-graph-governance',
  'Aftergraph/aie',
  'Aftergraph/intelligence-systems-research',
  'Aftergraph/trust-gateway',
  'Aftergraph/works-execution',
  'Aftergraph/work-intelligence-v2',
  'Aftergraph/studio',
  'Aftergraph/brand',
  'Aftergraph/.github',
] as const;

export const SOURCES: KnowledgeSource[] = [
  { repository: 'Aftergraph/after-graph-governance', ref: 'main', commitSha: '57c681e9e4df56f5e2dd068e372d945392dc0007', owner: 'Governance', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/aie', ref: 'main', commitSha: 'c9684e4d160f8ea59bd295807d45d2652258d003', owner: 'AIE', kind: 'specification', visibility: 'public' },
  { repository: 'Aftergraph/intelligence-systems-research', ref: 'main', commitSha: '72e115c642441e10dd88890edfac86b787315cf0', owner: 'ISR', kind: 'research', visibility: 'public', evidenceCut: 'AUDIT-EVID-001 (2026-09-04)' },
  { repository: 'Aftergraph/trust-gateway', ref: 'main', commitSha: '8c74593175f686c6365b485ac2b5d05c5bd5252d', owner: 'Trust Gateway', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/works-execution', ref: 'main', commitSha: '85e9274651eaeeca3a31048a0ebd19e70316201e', owner: 'WORKS', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/work-intelligence-v2', ref: 'main', commitSha: '370a0b2029fb0f694a62d36ffdc390f16bf1040d', owner: 'Work Intelligence', kind: 'api', visibility: 'public', maturity: 'OpenAPI 3.1.0 / API v0.2.0' },
  { repository: 'Aftergraph/studio', ref: 'main', commitSha: '968a44e8cd7f6e7724fcf44e2bef0093220a91f9', owner: 'Studio', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/brand', ref: 'main', commitSha: 'cc1a22fd425c9a0f49ac1f301723d4e84a3ba469', owner: 'Brand OS', kind: 'documentation', visibility: 'public', maturity: 'Brand tokens v1.0.0 (provisional-not-trademark-cleared)' },
  { repository: 'Aftergraph/.github', ref: 'main', commitSha: '9680ff9a332c501dbf99d5fcdf72210426c0a1fd', owner: 'Governance', kind: 'documentation', visibility: 'public' },
];
