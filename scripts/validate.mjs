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

// 1b. retired repository identities must not re-enter current-facing projections.
// Historical source-state history is intentionally excluded: provenance is not rewritten.
for (const rel of [
  'src/data/sources.ts', 'src/data/catalog.json', 'src/data/artifacts.json',
  'src/data/provenance.json', 'src/data/golden-mission.json', 'src/data/schemas.json',
  'src/data/system-map.json', 'src/components/SystemGrid.astro',
  'src/components/MissionFlow.astro', 'src/content/docs/products.mdx'
]) {
  const current = readFileSync(join(root, rel), 'utf8');
  if (current.includes('work-intelligence-v2')) fail(`retired Work Intelligence identity in current surface: ${rel}`);
}
ok('repository identity: retired work-intelligence-v2 absent from current surfaces');

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
  for (const m of body.matchAll(/\[.*?\]\(((\/[^)\s#]*)?(#[^)\s]*)?)\)/g)) {
    if (m[1]) mdLinks.push([f, m[1]]);
  }
}
// Starlight heading ids follow github-slugger over the rendered heading text.
// Same slugger Starlight uses (dependency present via @astrojs/starlight),
// fresh instance per page for occurrence counting; markdown stripped first
// since slugs derive from rendered text. Fenced code blocks are skipped —
// `#` comments in code are not anchors.
import GithubSlugger from 'github-slugger';
const stripMd = (s) => s
  .replace(/`([^`]*)`/g, '$1')
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/[*_~]/g, '')
  .replace(/<[^>]*>/g, '')
  .replace(/\s*\{#.*\}\s*$/, '');
const unfenced = (body) => body.split(/^```.*$/m).filter((_, i) => i % 2 === 0).join('\n');
const pageAnchors = new Map();
const anchorsOf = (rel) => {
  if (pageAnchors.has(rel)) return pageAnchors.get(rel);
  const set = new Set();
  const file = join(root, 'src/content/docs', rel);
  if (existsSync(file)) {
    const slugger = new GithubSlugger();
    const body = unfenced(readFileSync(file, 'utf8'));
    for (const m of body.matchAll(/^#{1,6}\s+(.+)$/gm)) set.add(slugger.slug(stripMd(m[1])));
    for (const m of body.matchAll(/id="([^"]+)"/g)) set.add(m[1]);
  }
  pageAnchors.set(rel, set);
  return set;
};
for (const [f, link] of mdLinks) {
  const [path, frag] = link.split('#');
  const selfRel = f.split(/src[\\/]content[\\/]docs[\\/]/)[1].replace(/\\/g, '/');
  const target = !path ? selfRel
    : path === '/' ? 'index.mdx'
    : path.replace(/^\//, '').replace(/\/$/, '') + '.mdx';
  if (path && distTargets.includes(path.replace(/^\//, ''))) continue;
  if (!existsSync(join(root, 'src/content/docs', target)) && !(path && existsSync(join(root, 'public', path.replace(/^\//, '')))))
    fail(`broken internal link ${link} in ${f}`);
  if (frag !== undefined && frag !== '') {
    const anchorTarget = !path ? selfRel : target;
    if (existsSync(join(root, 'src/content/docs', anchorTarget)) && !anchorsOf(anchorTarget).has(frag))
      fail(`broken anchor #${frag} in link ${link} in ${f}`);
  }
}
ok(`links: ${mdLinks.length} internal links + anchors resolve`);

// 4. OpenAPI valid + matches manifest
const api = JSON.parse(readFileSync(join(root, 'public/openapi.json'), 'utf8'));
if (!api.openapi?.startsWith('3.1')) fail('openapi not 3.1.x');
if (Object.keys(api.paths ?? {}).length < 5) fail('openapi paths missing');
ok(`openapi: ${api.info?.title} ${api.info?.version}, ${Object.keys(api.paths).length} paths`);

// 4b. schemas.json parity: the Schemas page renders from derivation, so the
// derivation must match the adopted spec + pin (Scalar reads openapi live;
// a silent divergence would show two truths).
{
  const schemas = JSON.parse(readFileSync(join(root, 'src/data/schemas.json'), 'utf8'));
  const wiPin = (src.match(/repository: 'Aftergraph\/wi-backend'[\s\S]*?commitSha: '([0-9a-f]{40})'/) || [])[1];
  if (schemas.api?.commit !== wiPin) fail('schemas.json commit != WI pin (run scripts/schemas.mjs)');
  if (schemas.api?.paths !== Object.keys(api.paths ?? {}).length) fail('schemas.json paths != openapi paths');
  ok(`schemas: ${schemas.schemas.length} component schemas, pin + paths match`);
}

// 5. catalog/contract/claim consistency: owners must be allowlisted
const allowRepos = [...src.matchAll(/'(Aftergraph\/[^']+)'/g)].map((m) => m[1]);
for (const file of ['catalog.json', 'contracts.json', 'claims.json']) {
  const txt = readFileSync(join(root, 'src/data', file), 'utf8');
  for (const m of txt.matchAll(/Aftergraph\/[a-z0-9.-]+/gi)) {
    if (!allowRepos.includes(m[0])) fail(`${file} references non-allowlisted ${m[0]}`);
  }
}
const contracts = JSON.parse(readFileSync(join(root, 'src/data/contracts.json'), 'utf8'));
if (contracts.contracts.length !== 17) fail('contracts count != 17');
ok('catalog/contracts/claims: owners allowlisted, 17 contracts');

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

// 9. context packs: one per provenance page, site_commit bounded.
// ponytail: packs are written by context-packs.mjs AFTER astro build — during
// the pre-build validate pass (fresh checkout) they legitimately don't exist
// yet. Soft-skip pre-build, hard-fail via emit-status-dist.mjs post-build.
if (process.argv.includes('--post-build')) {
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
  if (!process.exitCode) console.log('POST-BUILD VALIDATE PASS');
} else {
  if (existsSync(join(root, 'dist/context/index.json'))) {
    const idx = JSON.parse(readFileSync(join(root, 'dist/context/index.json'), 'utf8'));
    if (idx.packs && idx.packs.length < Object.keys(prov).length) fail('context pack count < provenance pages');
    ok('context packs: pre-build phase, consistency checked (full check post-build)');
  } else {
    ok('context packs: pre-build phase (full check runs post-build)');
  }
}
if (!process.exitCode) {
  writeFileSync(join(root, '.validation-pass.json'), JSON.stringify({ at: new Date().toISOString(), result: 'passed' }) + '\n');
  console.log('VALIDATE PASS');
}
// 10. llms cross-surface consistency: docs-llms must reference the live
// portal; the org llms.txt (fetched at validation time when reachable)
// must reference the docs portal. Gate fails on divergence so the two
// org-facing indexes cannot drift silently.
const EXPECTED_PORTAL_LINKS = [
  'https://docs.aftergraph.org/',
  'https://docs.aftergraph.org/developers/quickstart/',
  'https://docs.aftergraph.org/standards/contract-graph/',
  'https://docs.aftergraph.org/evidence/claim-graph/',
  'https://docs.aftergraph.org/developers/mcp-boundary/',
  'https://docs.aftergraph.org/status.json',
];
{
  const docsLlms = readFileSync(join(root, 'public/llms.txt'), 'utf8');
  for (const link of EXPECTED_PORTAL_LINKS) {
    if (!docsLlms.includes(link)) fail(`llms.txt missing expected portal link: ${link}`);
  }
  ok(`llms.txt: ${EXPECTED_PORTAL_LINKS.length} expected portal links present`);
}

// 10b. cross-surface: aftergraph.org llms.txt must reference the docs portal
// (fetched over network when reachable; skipped offline so CI stays green
// without egress). Gate runs in production smoke instead.
if (process.argv.includes('--cross-llms')) {
  const { execSync: ex } = await import('node:child_process');
  try {
    const orgLlms = ex('curl -sS --max-time 15 https://aftergraph.org/llms.txt', { encoding: 'utf8' });
    if (!orgLlms.includes('docs.aftergraph.org')) fail('aftergraph.org/llms.txt does not reference the Knowledge Plane (docs.aftergraph.org)');
    else ok('cross-llms: aftergraph.org/llms.txt references the Knowledge Plane');
  } catch (e) {
    console.warn('cross-llms: network unreachable, skipping (offline build)');
  }
}
if (!process.exitCode) {
  writeFileSync(join(root, '.validation-pass.json'), JSON.stringify({ at: new Date().toISOString(), result: 'passed' }) + '\n');
  console.log('VALIDATE PASS');
}
