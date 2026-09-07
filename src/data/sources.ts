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
  'Aftergraph/aftergraph.org',
  'Aftergraph/sentinel',
  'Aftergraph/.github',
] as const;

export const SOURCES: KnowledgeSource[] = [
  { repository: 'Aftergraph/after-graph-governance', ref: 'main', commitSha: '412b7065581a11607958be7f5d04ebcce36753c2', owner: 'Governance', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/aie', ref: 'main', commitSha: '7ab61a2aa3891e407eed8d0ff3a91fb6947ff744', owner: 'AIE', kind: 'specification', visibility: 'public' },
  { repository: 'Aftergraph/intelligence-systems-research', ref: 'main', commitSha: 'b8812ca338836b4bd272814d4626b8bc744d8fea', owner: 'ISR', kind: 'research', visibility: 'public', evidenceCut: 'AUDIT-EVID-001 (2026-09-04)' },
  { repository: 'Aftergraph/trust-gateway', ref: 'main', commitSha: 'bfe126eb7e987ae607c7d1aae043b48f12b7d7e9', owner: 'Trust Gateway', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/works-execution', ref: 'main', commitSha: '79914a514512766edd7032c9a74e63c0f9f87551', owner: 'WORKS', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/work-intelligence-v2', ref: 'main', commitSha: '370a0b2029fb0f694a62d36ffdc390f16bf1040d', owner: 'Work Intelligence', kind: 'api', visibility: 'public', maturity: 'OpenAPI 3.1.0 / API v0.2.0' },
  { repository: 'Aftergraph/studio', ref: 'main', commitSha: 'ca3da75e9cd3ecf783297c49ad79ed91a73d7120', owner: 'Studio', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/sentinel', ref: 'main', commitSha: '37d900cd22673447337770bb06c1ddd1c3cfc66b', owner: 'Sentinel', kind: 'documentation', visibility: 'public', maturity: 'prototype — strategy docs + prototype' },
  { repository: 'Aftergraph/aftergraph.org', ref: 'main', commitSha: '4c1e00fd358c3a2a42cc60490213bcac15d9c759', owner: 'Platform Web', kind: 'documentation', visibility: 'public', maturity: 'public landing + launcher (v1.0.0)' },
  { repository: 'Aftergraph/brand', ref: 'main', commitSha: 'cc1a22fd425c9a0f49ac1f301723d4e84a3ba469', owner: 'Brand OS', kind: 'documentation', visibility: 'public', maturity: 'Brand tokens v1.0.0 (provisional-not-trademark-cleared)' },
  { repository: 'Aftergraph/.github', ref: 'main', commitSha: '54eb680ea32c515b20c818cc3c2bda43c03bbb72', owner: 'Governance', kind: 'documentation', visibility: 'public' },
];
