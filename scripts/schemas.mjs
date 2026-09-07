// @ts-nocheck
// Schema data: builds src/data/schemas.json from public/openapi.json
// (adopted artifact) + the pinned WI commit in src/data/sources.ts.
// Pure local derivation — no new truth, no network. Powers the Schemas
// page and the API Reference header (pin SHA is never hand-duplicated).
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const api = JSON.parse(readFileSync(root + '/public/openapi.json', 'utf8'));
const src = readFileSync(root + '/src/data/sources.ts', 'utf8');
const pin = src.match(/repository: 'Aftergraph\/work-intelligence-v2'[\s\S]*?commitSha: '([0-9a-f]{40})'/);
if (!pin) { console.error('WI pin not found in sources.ts'); process.exit(1); }
const defs = api.components?.schemas ?? {};
const schemas = Object.entries(defs).map(([name, s]) => ({
  name,
  required: s.required ?? [],
  properties: Object.entries(s.properties ?? {}).map(([pname, p]) => ({
    name: pname,
    type: p.type ?? (p.anyOf ? p.anyOf.map((x) => x.type).join(' | ') : p.$ref?.split('/').pop() ?? 'object'),
    description: p.description ?? '',
    required: (s.required ?? []).includes(pname),
  })),
}));
const out = {
  api: {
    repository: 'Aftergraph/work-intelligence-v2',
    commit: pin[1],
    version: api.info?.version ?? null,
    openapi: api.openapi ?? null,
    paths: Object.keys(api.paths ?? {}).length,
  },
  schemas,
};
writeFileSync(root + '/src/data/schemas.json', JSON.stringify(out, null, 2) + '\n');
console.log(`schemas: ${schemas.length} component schemas from ${pin[1].slice(0, 8)}`);
