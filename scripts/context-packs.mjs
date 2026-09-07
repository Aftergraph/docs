// @ts-nocheck
// V0.5: Context Packs — per-page ACC-shaped portable context bundles.
// For each rendered docs page, emit public/context/<route>.json with
// topic, source provenance, dependency contracts, status, and next reading.
// Read-only derivation from provenance.json + graph.json + system-map.json.
// ponytail: heuristic dependency mapping via page→registry relationships in
// provenance.json; upgrade path = explicit per-page dependency frontmatter.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));

const prov = JSON.parse(readFileSync(root + '/src/data/provenance.json', 'utf8'));
const graph = JSON.parse(readFileSync(root + '/src/data/graph.json', 'utf8'));
const sysmap = JSON.parse(readFileSync(root + '/src/data/system-map.json', 'utf8'));
let buildStatus = {};
try { buildStatus = JSON.parse(readFileSync(root + '/src/data/build-status.json', 'utf8')); } catch {}

// page → deeper reading (derived from provenance source + graph relations)
const nextReading = {
  'index': ['platform/', 'standards/contract-graph/', 'evidence/claim-graph/'],
  'platform': ['platform/system-map/', 'platform/golden-mission/'],
  'platform/golden-mission': ['platform/system-map/', 'standards/contracts/'],
  'platform/system-map': ['standards/contract-graph/', 'evidence/claim-graph/'],
  'standards': ['standards/contracts/', 'standards/contract-graph/'],
  'standards/contracts': ['standards/contract-graph/'],
  'standards/contract-graph': ['standards/contracts/', 'evidence/claim-graph/'],
  'evidence': ['evidence/claim-graph/'],
  'evidence/claim-graph': ['research/'],
  'developers': ['developers/tutorials/', 'developers/api-reference/'],
  'developers/api-reference': ['developers/mcp-boundary/'],
  'developers/mcp-boundary': ['developers/api-reference/'],
  'catalog': ['standards/contract-graph/'],
  'company': ['catalog/'],
  'research': ['evidence/claim-graph/'],
  'status': ['catalog/'],
};

mkdirSync(root + '/dist/context', { recursive: true });
const packs = [];
for (const [page, p] of Object.entries(prov)) {
  const contracts = graph.contract_graph.edges
    .filter((e) => e.from === (p.repository || '').replace('Aftergraph/', '') || e.to === (p.repository || '').replace('Aftergraph/', ''))
    .map((e) => e.contract);
  const pack = {
    $schema: 'aftergraph.context-pack.v0',
    topic: page === 'index' ? 'Aftergraph Knowledge Plane overview' : page.replace('/', ' · '),
    site: 'https://docs.aftergraph.org',
    canonical_owner: p.canonical_owner,
    source_repository: p.repository,
    source_commit: p.commit,
    source_path: p.source,
    semantic_version: p.semantic_version,
    evidence_cut: p.evidence_cut || null,
    status: 'portal-rendered-view (repo owns truth; governance owns boundaries; evidence owns claim strength)',
    depends_on_contracts: [...new Set(contracts)].sort(),
    related_claims: p.canonical_owner === 'ISR' ? graph.claim_graph.claims.map((c) => c.id) : [],
    next_reading: (nextReading[page] || []).map((r) => `https://docs.aftergraph.org/${r}`),
    generated_at: new Date().toISOString(),
    site_commit: buildStatus.site_commit || null,
    constraints: [
      'Do not treat this pack as fresher than its site_commit.',
      'The owning repository (source_repository@source_commit) is authoritative over this rendering.',
      p.canonical_owner === 'ISR' ? 'Claims are registry-verbatim; evidence classes and reproduction states must be preserved.' : null,
    ].filter(Boolean),
  };
  const route = page === 'index' ? 'index' : page.replace(/\//g, '.');
  writeFileSync(root + `/dist/context/${route}.json`, JSON.stringify(pack, null, 2) + '\n');
  packs.push(route);
}
// index of packs
writeFileSync(root + '/dist/context/index.json', JSON.stringify({
  packs: packs.map((r) => `https://docs.aftergraph.org/context/${r}.json`),
  note: 'ACC-shaped portable context packs. Read-only derivation; owning repos are authoritative.',
  generated_at: new Date().toISOString(),
}, null, 2) + '\n');
console.log(`context packs: ${packs.length} pages -> dist/context/`);