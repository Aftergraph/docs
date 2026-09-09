#!/usr/bin/env node
// Sync canonical Brand OS bytes into the docs portal (fail-closed).
//
// Source: Aftergraph/brand tag v1.1.0 via raw.githubusercontent.com,
// per-file SHA-256 pinned. Verifies committed src/styles/brand.css
// primitives against canonical tokens.css.
// Run: node scripts/sync-brand.mjs [--check]
// Env BRAND_DIR overrides downloads with a local brand checkout (offline).
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BRAND_VERSION = '1.1.0';
const BASE = `https://raw.githubusercontent.com/Aftergraph/brand/v${BRAND_VERSION}`;
const FILES = {
  'svg/favicon.svg': { dest: 'public/favicon.svg', sha256: 'e53b09bfab1aa661e7a009f714c23a6686f840721de2297afbb8a10220f0e77b' },
  'exports/social/og-docs.png': { dest: 'public/og-docs.png', sha256: 'de9597d25fea3dc335aa1209994db5b556e89f0282cb4c17b525fb20e92bb625' },
  'exports/favicon/apple-touch-icon.png': { dest: 'public/apple-touch-icon.png', sha256: '8aa4409ae67c37d491b58a918002099adb6f7c30d98b0eebae24c08ba394c5d1' },
  'tokens.css': { dest: null, sha256: '18d0868c484421e4b45ad56148af71bcbde163605fa7cda0267052d2713f027c' },
};
const CHECK_ONLY = process.argv.includes('--check');
const root = path.resolve(import.meta.dirname, '..');
const fail = (m) => { console.error(`SYNC-FAIL: ${m}`); process.exit(1); };
const sha = (b) => createHash('sha256').update(b).digest('hex');

const fetchBytes = (rel) => {
  if (process.env.BRAND_DIR) return fs.readFileSync(path.join(process.env.BRAND_DIR, rel));
  try {
    return execFileSync('curl', ['-sSL', '--max-time', '120', `${BASE}/${rel}`], { maxBuffer: 32 * 1024 * 1024 });
  } catch { fail(`download failed: ${rel}`); }
};

const vars = (css) => new Map([...css.matchAll(/(--ag-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().toLowerCase()]));

// 1. Fetch + pin every file.
const got = {};
for (const [rel, spec] of Object.entries(FILES)) {
  const bytes = fetchBytes(rel);
  if (sha(bytes) !== spec.sha256) fail(`SHA mismatch ${rel}: got ${sha(bytes)}`);
  got[rel] = bytes;
}
console.log(`brand bytes OK: v${BRAND_VERSION} (${Object.keys(FILES).length} files pinned)`);

// 2. Drift guard: committed brand.css :root vars must equal canonical tokens.
const siteCss = fs.readFileSync(path.join(root, 'src/styles/brand.css'), 'utf8');
const siteRoot = siteCss.split('html[data-theme')[0].split('[data-theme')[0];
const sVars = vars(siteRoot);
const cVars = vars(got['tokens.css'].toString('utf8'));
let checked = 0;
const siteLayer = [];
for (const [k, v] of sVars) {
  const ck = k.startsWith('--ag-brand-') ? k : k.replace(/^--ag-/, '--ag-brand-');
  const canon = cVars.get(k) ?? cVars.get(ck);
  if (canon === undefined) { siteLayer.push(k); continue; } // site semantic layer, not canonical
  if (canon !== v) fail(`token drift ${k}: site=${v} canonical=${canon}`);
  checked++;
}
console.log(`tokens OK: ${checked} committed primitives match canonical v${BRAND_VERSION}; site layer: ${siteLayer.join(' ') || 'none'}`);

// 3. Write public assets (skipped under --check).
if (!CHECK_ONLY) {
  for (const [rel, spec] of Object.entries(FILES)) {
    if (!spec.dest) continue;
    const out = path.join(root, spec.dest);
    fs.writeFileSync(out, got[rel]);
    console.log(`wrote ${spec.dest} (${got[rel].length}B from brand@${BRAND_VERSION}/${rel})`);
  }
}
console.log('brand sync PASS');
