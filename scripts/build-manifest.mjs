// @ts-nocheck
// Emits dist/build-manifest.json + public/build-manifest.json:
// site commit, build id, environment, sources, validation status.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const src = readFileSync(root + '/src/data/sources.ts', 'utf8');
const sources = Object.fromEntries(
  [...src.matchAll(/repository: '(Aftergraph\/[^']+)'[\s\S]*?commitSha: '([0-9a-f]+)'/g)]
    .map((m) => [m[1], m[2]]));
let site = 'uncommitted';
try { site = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: root }).trim(); } catch {}
// validation.status is "passed" only with a fresh validate.mjs marker;
// otherwise honest "unknown" (never optimistic).
let validation = { status: 'unknown', validated_at: null };
try {
  const st = statSync(root + '/.validation-pass.json');
  const marker = JSON.parse(readFileSync(root + '/.validation-pass.json', 'utf8'));
  if (Date.now() - st.mtimeMs < 3600_000 && marker.result === 'passed')
    validation = { status: 'passed', validated_at: marker.at };
} catch {}
const manifest = {
  site_commit: site,
  build_id: process.env.GITHUB_RUN_ID || 'local',
  generated_at: new Date().toISOString(),
  environment: process.env.KNOWLEDGE_ENV || 'local',
  sources,
  validation,
};
mkdirSync(root + '/dist', { recursive: true });
writeFileSync(root + '/dist/build-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(root + '/public/build-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('build-manifest written for', Object.keys(sources).length, 'sources');