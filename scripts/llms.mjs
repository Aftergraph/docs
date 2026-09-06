// @ts-nocheck
// Generates public/llms.txt + scoped public/llms/*.txt indexes.
// Concise indexes linking canonical Markdown — never a full dump.
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
mkdirSync(root + '/public/llms', { recursive: true });
const base = 'https://docs.aftergraph.dev';
const scopes = {
  platform: ['Platform overview', '/platform/', 'Golden Mission route', '/platform/golden-mission/'],
  research: ['Research overview', '/research/', 'Evidence + claim states', '/evidence/'],
  standards: ['Standards overview', '/standards/', 'Contract Explorer (13 contracts)', '/standards/contracts/', 'Catalog', '/catalog/'],
  aie: ['Authority semantics via AIE contracts', '/standards/contracts/', 'identity/1.0 + brain.ns/1.0 owners', '/standards/contracts/'],
};
let index = `# Aftergraph Knowledge Plane\n\n> Compiler over canonical sources. Repos own truth; governance owns boundaries; evidence owns claim strength.\n\n`;
for (const [name, items] of Object.entries(scopes)) {
  let body = `# Aftergraph — ${name}\n\n`;
  for (let i = 0; i < items.length; i += 2) { body += `- ${items[i]}: ${base}${items[i + 1]}\n`; index += `- [${items[i]}](${base}${items[i + 1]})\n`; }
  writeFileSync(`${root}/public/llms/${name}.txt`, body);
}
writeFileSync(root + '/public/llms.txt', index + `\nAPI reference: ${base}/developers/api-reference/ (Scalar over canonical OpenAPI)\n`);
console.log('llms.txt + 4 scoped indexes written');