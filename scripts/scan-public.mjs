// @ts-nocheck
// Public-source leakage scan: every file that reaches the deployed site
// (src + public + generated dist) must not reference private repos or
// carry CRLF (hard merge gate). Deterministic, offline, CI-only inputs.
// scan-public.mjs does NOT need network — safe as a pre-build gate.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const fail = (m) => { console.error('SCAN-FAIL: ' + m); process.exitCode = 1; };
const ok = (m) => console.log('ok: ' + m);

// Private repos (mirrors validate.mjs allowlist negatives, plus explicit names)
const PRIVATE = [
  'context-continuity', 'skills-vault', 'wi-frontend',
  'llm-research-development', 'autonomous-venture-company', 'model-registry',
  'Aftergraph/afm',
];
const TEXT_EXT = new Set(['.md', '.mdx', '.json', '.ts', '.mjs', '.js', '.astro', '.css', '.html', '.txt', '.xml', '.svg', '.yml', '.yaml']);

const walk = (d, base) => {
  if (!existsSync(d)) return [];
  return readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = join(d, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' || e.name === '.git' || e.name === '.astro' ? [] : walk(p, base);
    return [p];
  });
};

let files = 0, scanned = 0;
for (const dir of ['src', 'public', 'dist']) {
  for (const f of walk(join(root, dir))) {
    files++;
    const rel = f.slice(root.length);
    if (!TEXT_EXT.has(extname(f).toLowerCase())) continue;
    let t;
    try { t = readFileSync(f, 'utf8'); } catch { continue; }
    scanned++;
    // 1. CRLF hard gate (LF-only formatting is a merge gate org-wide)
    //    ponytail: skip third-party vendor bundles (pagefind) — we don't
    //    own their bytes; leakage scan below still covers them fully.
    if (!rel.includes('pagefind') && /\r/.test(t)) fail(`CRLF in ${rel}`);
    // 2. private repo references
    for (const priv of PRIVATE) {
      if (t.toLowerCase().includes(priv.toLowerCase())) fail(`private-source reference '${priv}' in ${rel}`);
    }
  }
}
ok(`public-source scan: ${scanned}/${files} text files clean (no CRLF, no private refs)`);
if (!process.exitCode) console.log('SCAN PASS');