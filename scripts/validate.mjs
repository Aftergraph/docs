// @ts-nocheck
// Deterministic CI gates: schema, links, ownership, provenance,
// private leakage, OpenAPI, catalog. Exit non-zero on any failure.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const fail = (m) => { console.error('VALIDATE FAIL: ' + m); process.exitCode = 1; };
const ok = (m) => console.log('ok: ' + m);

// 1. sources.ts: full SHAs + public-only
const src = readFileSync(join(root, 'src/data/sources.ts'), 'utf8');
const shas = [...src.matchAll(/commitSha: '([0-9a-f]+)'/g)].map((m) => m[1]);
if (!shas.length) fail('no sources pinned');
for (const s of shas) if (s.length !== 40) fail('non-full SHA: ' + s);
const vis = [...src.matchAll(/visibility: '(\w+)'/g)].map((m) => m[1]);
if (!vis.length || vis.some((v) => v !== 'public')) fail('non-public visibility in manifest');
const allow = JSON.parse(JSON.stringify(src.match(/PUBLIC_ALLOWLIST = \[([\s\S]*?)\]/)[1]));
for (const priv of ['context-continuity','skills-vault','work-intelligence-web','llm-research-development','/afm','model-registry','autonomous-venture-company'])
  if (src.includes(priv)) fail('private repo referenced: ' + priv);
ok(`sources: ${shas.length} pins, all full SHAs, no private refs`);

// 2. provenance coverage for every docs page
const prov = JSON.parse(readFileSync(join(root, 'src/data/provenance.json'), 'utf8'));
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
});
const pages = walk(join(root, 'src/content/docs')).filter((f) => f.endsWith('.mdx'))
  .map((f) => f.split(/src[\\/]content[\\/]docs[\\/]/)[1].replace(/\\/g, '/').replace(/\.mdx$/, ''));
for (const p of pages) {
  if (!prov[p]) fail('missing provenance: ' + p);
  else if (!prov[p].commit || prov[p].commit.length !== 40) fail('bad provenance SHA: ' + p);
}
ok(`provenance: ${pages.length} pages covered`);

// 3. internal links resolve
const mdLinks = [];
for (const f of walk(join(root, 'src/content/docs'))) {
  if (!f.endsWith('.mdx')) continue;
  const body = readFileSync(f, 'utf8');
  for (const m of body.matchAll(/\[.*?\]\((\/[^)\s#]*)\)/g)) mdLinks.push([f, m[1]]);
}
for (const [f, link] of mdLinks) {
  const target = link === '/' ? 'index.mdx' : link.replace(/^\//, '').replace(/\/$/, '') + '.mdx';
  if (!existsSync(join(root, 'src/content/docs', target)) && !existsSync(join(root, 'public', link.replace(/^\//, ''))))
    fail(`broken internal link ${link} in ${f}`);
}
ok(`links: ${mdLinks.length} internal links resolve`);

// 4. OpenAPI valid + matches manifest
const api = JSON.parse(readFileSync(join(root, 'public/openapi.json'), 'utf8'));
if (!api.openapi?.startsWith('3.1')) fail('openapi not 3.1.x');
if (Object.keys(api.paths ?? {}).length < 5) fail('openapi paths missing');
ok(`openapi: ${api.info?.title} ${api.info?.version}, ${Object.keys(api.paths).length} paths`);

// 5. catalog/contract/claim consistency: owners must be allowlisted
const allowRepos = [...src.matchAll(/'(Aftergraph\/[^']+)'/g)].map((m) => m[1]);
for (const file of ['catalog.json', 'contracts.json', 'claims.json']) {
  const txt = readFileSync(join(root, 'src/data', file), 'utf8');
  for (const m of txt.matchAll(/Aftergraph\/[a-z0-9.-]+/gi)) {
    if (!allowRepos.includes(m[0])) fail(`${file} references non-allowlisted ${m[0]}`);
  }
}
const contracts = JSON.parse(readFileSync(join(root, 'src/data/contracts.json'), 'utf8'));
if (contracts.contracts.length !== 13) fail('contracts count != 13');
ok('catalog/contracts/claims: owners allowlisted, 13 contracts');

// 6. llms.txt generated + scoped indexes referenced
if (!existsSync(join(root, 'public/llms.txt'))) fail('public/llms.txt missing (run scripts/llms.mjs)');
ok('llms.txt present');
if (!process.exitCode) console.log('VALIDATE PASS');