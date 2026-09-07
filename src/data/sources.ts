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
  { repository: 'Aftergraph/after-graph-governance', ref: 'main', commitSha: 'f8a777d0210eda5f6d82d2c33df3a1a47b3b99f7', owner: 'Governance', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/aie', ref: 'main', commitSha: '29f6a9b8247d53beeabf59fb941069f380890906', owner: 'AIE', kind: 'specification', visibility: 'public' },
  { repository: 'Aftergraph/intelligence-systems-research', ref: 'main', commitSha: '08c98464a58cf16bb1a70f4f0c5516ad1410bd33', owner: 'ISR', kind: 'research', visibility: 'public', evidenceCut: 'AUDIT-EVID-001 (2026-09-04)' },
  { repository: 'Aftergraph/trust-gateway', ref: 'main', commitSha: 'd207485f84cad550d3a5306581c82d3328b15ec8', owner: 'Trust Gateway', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/works-execution', ref: 'main', commitSha: '79914a514512766edd7032c9a74e63c0f9f87551', owner: 'WORKS', kind: 'contract', visibility: 'public' },
  { repository: 'Aftergraph/work-intelligence-v2', ref: 'main', commitSha: 'a926f26b99b6aa265c02590249fa32b85941b73d', owner: 'Work Intelligence', kind: 'api', visibility: 'public', maturity: 'OpenAPI 3.1.0 / API v0.2.0' },
  { repository: 'Aftergraph/studio', ref: 'main', commitSha: 'ca3da75e9cd3ecf783297c49ad79ed91a73d7120', owner: 'Studio', kind: 'documentation', visibility: 'public' },
  { repository: 'Aftergraph/sentinel', ref: 'main', commitSha: '1a8692b93cb3eb664e51bca7b43f5366244b30fa', owner: 'Sentinel', kind: 'documentation', visibility: 'public', maturity: 'prototype — strategy docs + prototype' },
  { repository: 'Aftergraph/aftergraph.org', ref: 'main', commitSha: '8276285aea2bee0f51765145097b4103f9671c83', owner: 'Platform Web', kind: 'documentation', visibility: 'public', maturity: 'public landing + launcher (v1.0.0)' },
  { repository: 'Aftergraph/brand', ref: 'main', commitSha: '138f4746a716ac78fb5a60841cc9fa63026083c2', owner: 'Brand OS', kind: 'documentation', visibility: 'public', maturity: 'Brand tokens v1.0.0 (provisional-not-trademark-cleared)' },
  { repository: 'Aftergraph/.github', ref: 'main', commitSha: '56d70aace61364978e23cd75c9925a54aa706e18', owner: 'Governance', kind: 'documentation', visibility: 'public' },
];
