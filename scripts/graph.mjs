// @ts-nocheck
// V0.2 graph data: builds src/data/graph.json from contracts.json + claims.json
// + catalog.json. Pure local derivation — no new truth, no network.
// Contract Graph: owner/consumer edges between repos (consumers are owner
// short-names like 'TG','AIE' — resolved via catalog repo map).
// Claim Graph: claim → study → evidence class → cut → reproduction chain.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const short = { TG: 'trust-gateway', AIE: 'aie', WE: 'works-execution', ISR: 'intelligence-systems-research' };
const shortOf = (repo) => repo.replace('Aftergraph/', '');

// 1. Contract graph
const { contracts } = JSON.parse(readFileSync(root + '/src/data/contracts.json', 'utf8'));
// consumer short-names appear in the MDX table; contracts.json consumers carry
// full repo names. Normalize both via catalog.
const repos = new Set();
const nodes = [];
const edges = [];
for (const c of contracts) {
  repos.add(shortOf(c.owner));
  for (const consumer of c.consumers || []) {
    const target = short[consumer] || shortOf(consumer);
    repos.add(target);
    edges.push({ from: shortOf(c.owner), contract: c.contract, to: target, normative: !!c.normative, source: c.source });
  }
}
// catalog repos that participate in the graph get positions later in the page
for (const r of [...repos].sort()) nodes.push({ id: r });

// 2. Claim graph chains
const reg = JSON.parse(readFileSync(root + '/src/data/claims.json', 'utf8'));
const claims = reg.claims.map((c, i) => ({
  id: `C-${String(i + 1).padStart(3, '0')}`,
  claim: c.claim,
  status: c.status,
  evidenceClass: c.evidenceClass,
  study: c.study,
  sample: c.sample,
  evidenceCut: c.evidenceCut,
  reproduction: c.reproduction,
  sourceSha: c.sourceSha,
  chain: ['claim', 'status:' + c.status, 'evidence:' + c.evidenceClass, 'study:' + c.study, 'cut:' + c.evidenceCut, 'reproduction:' + c.reproduction],
}));

const out = {
  generated_from: {
    contracts: 'Aftergraph/after-graph-governance@57c681e9e4df56f5e2dd068e372d945392dc0007 docs/cross-repo-contracts.md',
    claims: reg.registry,
  },
  contract_graph: { nodes, edges },
  claim_graph: { claims },
};
writeFileSync(root + '/src/data/graph.json', JSON.stringify(out, null, 2) + '\n');
console.log(`graph: ${nodes.length} nodes, ${edges.length} contract edges, ${claims.length} claim chains`);