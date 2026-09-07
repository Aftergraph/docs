// @ts-nocheck
// Generates public/llms.txt + scoped public/llms/*.txt indexes.
// Concise indexes linking canonical Markdown — never a full dump.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
mkdirSync(root + '/public/llms', { recursive: true });
let site = 'uncommitted';
try { site = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: root }).trim(); } catch {}
// Freshness boundary: agents must not treat this index as fresher than its build.
let boundary = 'unverified — see /status on the deployed site';
try {
  const st = JSON.parse(readFileSync(root + '/public/source-state.json', 'utf8'));
  const counts = {};
  for (const e of st.sources) counts[e.status] = (counts[e.status] || 0) + 1;
  boundary = `${st.checked_at} · ` + Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
} catch {}
const base = 'https://docs.aftergraph.org';
const scopes = {
  platform: ['Platform overview', '/platform/', 'Golden Mission route', '/platform/golden-mission/', 'System Map (verified bindings)', '/platform/system-map/'],
  research: ['Research overview', '/research/', 'Evidence + claim states', '/evidence/'],
  standards: ['Standards overview', '/standards/', 'Contract Explorer (13 contracts)', '/standards/contracts/', 'Catalog', '/catalog/'],
  aie: ['Authority semantics via AIE contracts', '/standards/contracts/', 'identity/1.0 + brain.ns/1.0 owners', '/standards/contracts/', 'Contract Graph (owner→consumer edges)', '/standards/contract-graph/'],
  research: ['Research overview', '/research/', 'Claim chains C-001..C-008 (registry-verbatim audit status)', '/evidence/claim-graph/'],
  agents: ['Context Packs (ACC-shaped, per page)', '/context/index.json', 'Build provenance', '/build-manifest.json', 'Live status', '/status.json'],
};
let index = `# Aftergraph Knowledge Plane\n\n> Compiler over canonical sources. Repos own truth; governance owns boundaries; evidence owns claim strength.\n>\n> Provenance: generated ${new Date().toISOString()} from site commit ${site}.\n> Freshness boundary (do not treat this index as fresher than its build): ${boundary}\n\n`;
for (const [name, items] of Object.entries(scopes)) {
  let body = `# Aftergraph — ${name}\n\n`;
  for (let i = 0; i < items.length; i += 2) { body += `- ${items[i]}: ${base}${items[i + 1]}\n`; index += `- [${items[i]}](${base}${items[i + 1]})\n`; }
  writeFileSync(`${root}/public/llms/${name}.txt`, body);
}
writeFileSync(root + '/public/llms.txt', index + `\nAPI reference: ${base}/developers/api-reference/ (Scalar over canonical OpenAPI)\n`);
console.log('llms.txt + 4 scoped indexes written');