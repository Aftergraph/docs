// @ts-nocheck
// Freshness: rendered SHA (sources.ts) vs live canonical HEAD (gh api).
// States: CURRENT / SOURCE_MOVED / STALE / UNKNOWN. Writes public/freshness.json.
// Never fails silently — UNKNOWN on network error; CI surfaces the report.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const src = readFileSync(join(root, 'src/data/sources.ts'), 'utf8');
const pins = [...src.matchAll(/repository: '(Aftergraph\/[^']+)'[\s\S]*?commitSha: '([0-9a-f]+)'/g)]
  .map((m) => ({ repo: m[1], sha: m[2] }));
const out = { generated_at: new Date().toISOString(), entries: {} };
for (const { repo, sha } of pins) {
  try {
    const live = JSON.parse(execSync(`gh api repos/${repo}/commits/HEAD --jq "{sha: .sha}"`, { encoding: 'utf8' })).sha;
    out.entries[repo] = { pinned: sha, live, status: live === sha ? 'CURRENT' : 'SOURCE_MOVED' };
  } catch { out.entries[repo] = { pinned: sha, live: null, status: 'UNKNOWN' }; }
}
writeFileSync(join(root, 'public/freshness.json'), JSON.stringify(out, null, 2) + '\n');
for (const [r, e] of Object.entries(out.entries)) console.log(`${e.status} ${r} pinned=${e.pinned.slice(0, 8)} live=${e.live?.slice(0, 8) ?? '?'}`);