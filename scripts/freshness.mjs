// @ts-nocheck
// Live Truth verifier: pinned SHA vs canonical remote HEAD + artifact blob compare.
// Policy (ADR-004): CURRENT | SOURCE_MOVED_CONTENT_UNCHANGED |
// SOURCE_MOVED_CONTENT_CHANGED | STALE | UNKNOWN. UNKNOWN never counts as CURRENT.
// Writes public/source-state.json (CI artifact: knowledge-plane-source-state.json).
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const gh = (args) => execSync(`gh api ${args}`, { encoding: 'utf8' }).trim();
const src = readFileSync(root + '/src/data/sources.ts', 'utf8');
const artifacts = JSON.parse(readFileSync(root + '/src/data/artifacts.json', 'utf8')).artifacts;
const pins = [...src.matchAll(/repository: '(Aftergraph\/[^']+)'[\s\S]*?commitSha: '([0-9a-f]+)'/g)]
  .map((m) => ({ repo: m[1], sha: m[2] }));
const out = { checked_at: new Date().toISOString(), sources: [] };
// Optional: --previous <file> promotes a repeat CONTENT_CHANGED to STALE,
// giving genuine threshold semantics with history carried by CI artifacts.
let previous = null;
const prevIdx = process.argv.indexOf('--previous');
if (prevIdx !== -1) {
  try {
    previous = JSON.parse(readFileSync(process.argv[prevIdx + 1], 'utf8'));
  } catch { previous = null; }
}
for (const { repo, sha } of pins) {
  const entry = { repository: repo, pinned_sha: sha, remote_sha: null, status: 'UNKNOWN', distance: null, artifacts: [] };
  try {
    entry.remote_sha = JSON.parse(gh(`repos/${repo}/commits/HEAD --jq "{sha: .sha}"`)).sha;
    if (entry.remote_sha === sha) { entry.status = 'CURRENT'; }
    else {
      let changed = false, verifiable = false;
      for (const a of artifacts.filter((x) => x.repository === repo)) {
        try {
          const live = JSON.parse(gh(`repos/${repo}/contents/${a.path} --jq "{sha: .sha}"`)).sha;
          verifiable = true;
          const same = live === a.blob_sha;
          if (!same) changed = true;
          entry.artifacts.push({ path: a.path, pinned_blob: a.blob_sha, live_blob: live, changed: !same });
        } catch { entry.artifacts.push({ path: a.path, pinned_blob: a.blob_sha, live_blob: null, changed: null }); }
      }
      entry.status = verifiable
        ? (changed ? 'SOURCE_MOVED_CONTENT_CHANGED' : 'SOURCE_MOVED_CONTENT_UNCHANGED')
        : 'SOURCE_MOVED';
    }
  } catch { entry.status = 'UNKNOWN'; }
  if (entry.status === 'SOURCE_MOVED_CONTENT_CHANGED' && previous) {
    const prior = (previous.sources || []).find(
      (p) => p.repository === entry.repository && p.pinned_sha === entry.pinned_sha);
    if (prior && (prior.status === 'SOURCE_MOVED_CONTENT_CHANGED' || prior.status === 'STALE'))
      entry.status = 'STALE';
  }
  out.sources.push(entry);
}
writeFileSync(root + '/public/source-state.json', JSON.stringify(out, null, 2) + '\n');
for (const e of out.sources) console.log(`${e.status} ${e.repository}`);
