// @ts-nocheck
// Emits dist/build-manifest.json: site commit + generated_at + per-source SHAs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const src = readFileSync(root + '/src/data/sources.ts', 'utf8');
const sources = Object.fromEntries(
  [...src.matchAll(/repository: '(Aftergraph\/[^']+)'[\s\S]*?commitSha: '([0-9a-f]+)'/g)]
    .map((m) => [m[1], m[2]]));
let site = 'uncommitted';
try { site = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: root }).trim(); } catch {}
mkdirSync(root + '/dist', { recursive: true });
writeFileSync(root + '/dist/build-manifest.json',
  JSON.stringify({ site_commit: site, generated_at: new Date().toISOString(), sources }, null, 2) + '\n');
writeFileSync(root + '/public/build-manifest.json',
  JSON.stringify({ site_commit: site, generated_at: new Date().toISOString(), sources }, null, 2) + '\n');
console.log('build-manifest written for', Object.keys(sources).length, 'sources');