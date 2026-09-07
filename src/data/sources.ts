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
  { repository: 'Aftergraph/after-graph-governance', ref: 'main', commitSha: '412b7065581a11607958be7f5d04ebcce36753c2', owner: 'Governance', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/aie', ref: 'main', commitSha: '4b4f921fa41aa1ba01162460f3aab66f1d420362', owner: 'AIE', kind: 'specification', visibility: 'public' },
  { repository: 'Aftergraph/intelligence-systems-research', ref: 'main', commitSha: '72e115c642441e10dd88890edfac86b787315cf0', owner: 'ISR', kind: 'research', visibility: 'public', evidenceCut: 'AUDIT-EVID-001 (2026-09-04)' },
  { repository: 'Aftergraph/trust-gateway', ref: 'main', commitSha: '6f3dc02b493f2f5dcc89cbaf6b247737d55f95d3', owner: 'Trust Gateway', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/works-execution', ref: 'main', commitSha: '9551eaae1d24160056b9b2937da3919ee7ca52ae', owner: 'WORKS', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/work-intelligence-v2', ref: 'main', commitSha: '370a0b2029fb0f694a62d36ffdc390f16bf1040d', owner: 'Work Intelligence', kind: 'api', visibility: 'public', maturity: 'OpenAPI 3.1.0 / API v0.2.0' },
  { repository: 'Aftergraph/studio', ref: 'main', commitSha: 'f24cf4789b834654857d5e4a0f45ffeb6d3770b2', owner: 'Studio', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/brand', ref: 'main', commitSha: 'cc1a22fd425c9a0f49ac1f301723d4e84a3ba469', owner: 'Brand OS', kind: 'documentation', visibility: 'public', maturity: 'Brand tokens v1.0.0 (provisional-not-trademark-cleared)' },
  { repository: 'Aftergraph/.github', ref: 'main', commitSha: '62223d55c4f7fe451667411808ddb7badc90926d', owner: 'Governance', kind: 'documentation', visibility: 'public' },
];
