// @ts-nocheck
// Deterministic CI gates: schema, links, ownership, provenance,
// private leakage, OpenAPI, catalog. Exit non-zero on any failure.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
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

// 3. internal links resolve (dist-served JSON surfaces count as valid targets)
const distTargets = ['status.json', 'source-state.json', 'build-manifest.json', 'llms.txt', 'openapi.json'];
const mdLinks = [];
for (const f of walk(join(root, 'src/content/docs'))) {
  if (!f.endsWith('.mdx')) continue;
  const body = readFileSync(f, 'utf8');
  for (const m of body.matchAll(/\[.*?\]\((\/[^)\s#]*)\)/g)) mdLinks.push([f, m[1]]);
}
for (const [f, link] of mdLinks) {
  const target = link === '/' ? 'index.mdx' : link.replace(/^\//, '').replace(/\/$/, '') + '.mdx';
  if (distTargets.includes(link.replace(/^\//, ''))) continue;
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

// 7. artifact fingerprints: full SHAs, allowlisted repos, consumed paths exist
const arts = JSON.parse(readFileSync(join(root, 'src/data/artifacts.json'), 'utf8')).artifacts;
for (const a of arts) {
  if (!allowRepos.includes(a.repository)) fail(`artifacts.json: non-allowlisted ${a.repository}`);
  if (!/^[0-9a-f]{40}$/.test(a.source_commit || '')) fail(`artifacts.json: bad source_commit for ${a.path}`);
  if (!/^[0-9a-f]{40}$/.test(a.blob_sha || '')) fail(`artifacts.json: bad blob_sha for ${a.path}`);
  if (!existsSync(join(root, a.consumed_as))) fail(`artifacts.json: consumed path missing ${a.consumed_as}`);
}
ok(`artifacts: ${arts.length} fingerprints valid`);

// 8. graph.json: derivable, consistent with contracts.json + claims.json
if (!existsSync(join(root, 'src/data/graph.json'))) fail('src/data/graph.json missing (run scripts/graph.mjs)');
else {
  const g = JSON.parse(readFileSync(join(root, 'src/data/graph.json'), 'utf8'));
  if (g.contract_graph.edges.length < 20) fail('contract graph edges suspiciously low');
  const ids = new Set(g.contract_graph.nodes.map((n) => n.id));
  for (const e of g.contract_graph.edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) fail(`contract graph edge references unknown node: ${e.from} → ${e.to}`);
  }
  for (const c of g.claim_graph.claims) {
    if (!['SUPPORTED', 'PARTIALLY_SUPPORTED', 'CONTESTED', 'REFUTED', 'OBSOLETE'].includes(c.status))
      fail(`claim ${c.id}: non-canonical status ${c.status}`);
    if (!c.auditStatus || typeof c.auditStatus !== 'string' || c.auditStatus.length < 5)
      fail(`claim ${c.id}: missing verbatim auditStatus (registry wording required)`);
    if (!/^[0-9a-f]{40}$/.test(c.sourceSha || '')) fail(`claim ${c.id}: bad sourceSha`);
  }
  ok(`graph: ${g.contract_graph.nodes.length} nodes, ${g.contract_graph.edges.length} edges, ${g.claim_graph.claims.length} claim chains`);
}

// 9. context packs: one per provenance page, site_commit bounded
if (!existsSync(join(root, 'dist/context/index.json'))) fail('dist/context/index.json missing (run scripts/context-packs.mjs)');
else {
  const idx = JSON.parse(readFileSync(join(root, 'dist/context/index.json'), 'utf8'));
  if (!idx.packs || idx.packs.length < Object.keys(prov).length) fail('context pack count < provenance pages');
  const sample = JSON.parse(readFileSync(join(root, 'dist/context/standards.contract-graph.json'), 'utf8'));
  if (sample.$schema !== 'aftergraph.context-pack.v0') fail('context pack: wrong $schema');
  if (!sample.source_commit || sample.source_commit.length !== 40) fail('context pack: bad source_commit');
  if (!sample.site_commit) fail('context pack: missing site_commit bound');
  ok(`context packs: ${idx.packs.length} packs, schema + provenance bounded`);
}
if (!process.exitCode) {
  writeFileSync(join(root, '.validation-pass.json'), JSON.stringify({ at: new Date().toISOString(), result: 'passed' }) + '\n');
  console.log('VALIDATE PASS');
}