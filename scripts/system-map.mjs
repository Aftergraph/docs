// @ts-nocheck
// V0.3 system map: derives src/data/system-map.json — a zoomable system
// model (Aftergraph → platform → system → contract/claim leaf) built ONLY
// from existing registries (catalog, contracts, claims, golden-mission).
// No new truth: every node carries provenance to its owning registry.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));

const catalog = JSON.parse(readFileSync(root + '/src/data/catalog.json', 'utf8'));
const graph = JSON.parse(readFileSync(root + '/src/data/graph.json', 'utf8'));
const mission = JSON.parse(readFileSync(root + '/src/data/golden-mission.json', 'utf8'));
const claims = JSON.parse(readFileSync(root + '/src/data/claims.json', 'utf8'));

const short = { TG: 'trust-gateway', AIE: 'aie', WE: 'works-execution', ISR: 'intelligence-systems-research' };
const shaByRepo = Object.fromEntries(catalog.repos.map((r) => [r.repo.replace('Aftergraph/', ''), r.sha]));

// level 2: systems (participating repos), with contract edges + claims grouped
const edgesByRepo = {};
for (const e of graph.contract_graph.edges) {
  (edgesByRepo[e.from] ||= []).push(e);
  (edgesByRepo[e.to] ||= []).push(e);
}
const claimsByRepo = {};
for (const c of graph.claim_graph.claims) {
  const repo = 'intelligence-systems-research'; // ISR registry owns all claims
  (claimsByRepo[repo] ||= []).push(c.id);
}

const systems = catalog.repos
  .filter((r) => shaByRepo[r.repo.replace('Aftergraph/', '')])
  .map((r) => {
    const id = r.repo.replace('Aftergraph/', '');
    const edgeList = edgesByRepo[id] || [];
    const contractNames = [...new Set(edgeList.map((e) => e.contract))];
    return {
      id,
      role: r.role,
      class: r.class,
      sha: r.sha,
      contract_count: contractNames.length,
      contracts: contractNames,
      edges: edgeList.length,
      claims: claimsByRepo[id] || [],
    };
  });

// golden mission steps get their binding contract resolved to its graph node
const contractOwners = {};
for (const e of graph.contract_graph.edges) contractOwners[e.contract] = e.from;
const missionSteps = mission.steps.map((s, i) => ({
  order: i + 1,
  step: s.step,
  owner: s.owner.replace('Aftergraph/', ''),
  api: s.api || null,
  contract: s.contract || null,
  contract_owner: s.contract ? contractOwners[s.contract] || null : null,
  verified_binding: s.contract ? Boolean(contractOwners[s.contract]) : null,
}));

const out = {
  generated_from: graph.generated_from,
  map: {
    root: { id: 'aftergraph', label: 'Aftergraph', children: systems.map((s) => s.id) },
    systems,
    golden_mission: missionSteps,
  },
};
writeFileSync(root + '/src/data/system-map.json', JSON.stringify(out, null, 2) + '\n');
const unmapped = missionSteps.filter((s) => s.contract && !s.contract_owner);
console.log(`system map: ${systems.length} systems, ${missionSteps.length} mission steps, ${unmapped.length || 0} unbound contracts`);
if (unmapped.length) process.exitCode = 1;