// @ts-nocheck
// Post-build emit: astro build wipes dist/, so /status.json is re-emitted here
// from src/data/build-status.json + public/source-state.json (both survive).
// Full artifact fingerprints ride in source-state; no network needed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const bs = JSON.parse(readFileSync(root + '/src/data/build-status.json', 'utf8'));
const state = JSON.parse(readFileSync(root + '/public/source-state.json', 'utf8'));
const arts = JSON.parse(readFileSync(root + '/src/data/artifacts.json', 'utf8')).artifacts;
const status = {
  build: { site_commit: bs.site_commit, generated_at: new Date().toISOString() },
  summary: bs.summary,
  sources: state.sources,
  artifact_fingerprints: arts,
  verification: bs.verified_at,
};
writeFileSync(root + '/dist/status.json', JSON.stringify(status, null, 2) + '\n');
execSync('node scripts/validate.mjs --post-build', { encoding: 'utf8', cwd: root, stdio: 'inherit' });
console.log('dist/status.json emitted (post-build)');