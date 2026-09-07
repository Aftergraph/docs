// @ts-nocheck
// Builds public/status.json + HUMAN /status page (generated) + build-status.json.
// Never needs network: reads public/source-state.json (UNKNOWN if absent).
// Runs prebuild (and predev) so Astro always has the inputs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
let site = 'uncommitted';
try { site = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: root }).trim(); } catch {}
let state = null;
try { state = JSON.parse(readFileSync(root + '/public/source-state.json', 'utf8')); } catch {}
const sources = (state && state.sources) || [];
const count = (s) => sources.filter((e) => e.status === s).length;
const summary = {
  source_count: sources.length,
  current: count('CURRENT'),
  source_moved_unchanged: count('SOURCE_MOVED_CONTENT_UNCHANGED'),
  source_moved_changed: count('SOURCE_MOVED_CONTENT_CHANGED'),
  source_moved: count('SOURCE_MOVED'),
  stale: count('STALE'),
  unknown: sources.length - count('CURRENT') - count('SOURCE_MOVED_CONTENT_UNCHANGED')
    - count('SOURCE_MOVED_CONTENT_CHANGED') - count('SOURCE_MOVED') - count('STALE'),
  last_verification: (state && state.checked_at) || null,
};
const artifacts = JSON.parse(readFileSync(root + '/src/data/artifacts.json', 'utf8')).artifacts;
const status = {
  build: { site_commit: site, generated_at: new Date().toISOString() },
  summary, sources,
  artifact_fingerprints: artifacts,
  verification: summary.last_verification,
};
writeFileSync(root + '/public/status.json', JSON.stringify(status, null, 2) + '\n');
writeFileSync(root + '/src/data/build-status.json', JSON.stringify({
  site_commit: site, verified_at: summary.last_verification, summary,
  page_line: summary.last_verification
    ? `Source verified ${summary.last_verification.slice(0, 16).replace('T', ' ')} UTC · ${summary.current}/${summary.source_count} CURRENT`
    : 'Source verification pending for this build',
}, null, 2) + '\n');
const rows = sources.map((e) =>
  `| \`${e.repository.replace('Aftergraph/', '')}\` | ${e.status} | \`${(e.pinned_sha || '?').slice(0, 8)}\` | \`${(e.remote_sha || '?').slice(0, 8)}\` |`).join('\n');
writeFileSync(root + '/src/content/docs/status.mdx',
`---
title: "Status"
description: "Live build provenance and source freshness for this deployment."
---
import Provenance from '../../components/Provenance.astro';
import LiveStatus from '../../components/LiveStatus.astro';

Site commit: \`${site}\`
Built at: \`${status.build.generated_at}\`
Last source verification: \`${summary.last_verification || 'pending'}\`

<LiveStatus />

| Metric | Count |
|---|---|
| Sources | ${summary.source_count} |
| CURRENT | ${summary.current} |
| MOVED · artifact unchanged | ${summary.source_moved_unchanged} |
| MOVED · artifact changed | ${summary.source_moved_changed} |
| MOVED · unverified | ${summary.source_moved} |
| STALE | ${summary.stale} |
| UNKNOWN | ${summary.unknown} |

| Source | Status | Pinned | Remote |
|---|---|---|---|
${rows}

Machine-readable: [/status.json](/status.json) · [/source-state.json](/source-state.json) · [/build-manifest.json](/build-manifest.json)

<Provenance page="status" />
`);
console.log(`status: ${summary.current}/${summary.source_count} CURRENT`);
