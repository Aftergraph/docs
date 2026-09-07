// @ts-nocheck
// Explicit source adoption: node scripts/adopt-source.mjs Aftergraph/<repo> <full-sha>
// Updates pins + provenance + catalog + artifact fingerprints, then validates.
// Never auto-merges: callers open a reviewable PR (see adopt-source.yml).
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const [repo, sha] = process.argv.slice(2);
if (!/^Aftergraph\/[a-z0-9.-]+$/.test(repo || '') || !/^[0-9a-f]{40}$/.test(sha || '')) {
  console.error('usage: node scripts/adopt-source.mjs Aftergraph/<repo> <full-40-sha>');
  process.exit(2);
}
const gh = (args) => execSync(`gh api ${args}`, { encoding: 'utf8' }).trim();
const sub = (file, a, b) => {
  const p = root + file;
  const t = readFileSync(p, 'utf8');
  if (!t.includes(a)) { console.error(`pattern not found in ${file}`); process.exit(1); }
  writeFileSync(p, t.split(a).join(b));
};
// 1. sources.ts pin
{
  const p = root + '/src/data/sources.ts';
  const t = readFileSync(p, 'utf8');
  const re = new RegExp(`(repository: '${repo}'[\\s\\S]*?commitSha: ')[0-9a-f]{40}(')`);
  if (!re.test(t)) { console.error('repo not pinned in sources.ts'); process.exit(1); }
  writeFileSync(p, t.replace(re, `$1${sha}$2`));
}
// 2. provenance.json + catalog.json SHAs for that repo
for (const f of ['/src/data/provenance.json', '/src/data/catalog.json']) {
  const p = root + f;
  const data = JSON.parse(readFileSync(p, 'utf8'));
  const walk = (o) => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      for (const [k, v] of Object.entries(o)) {
        if ((k === 'commit' || k === 'sha') && typeof v === 'string' && v.length === 40) {
          const scope = JSON.stringify(o);
          if (scope.includes(repo)) o[k] = sha;
        }
        walk(v);
      }
    }
  };
  // catalog repos carry explicit repo field — match precisely there
  if (f.endsWith('catalog.json')) {
    for (const r of data.repos || []) if (r.repo === repo) r.sha = sha;
  } else {
    // provenance.json: entries keyed by page; update those whose repository matches
    for (const e of Object.values(data)) if (e && e.repository === repo) e.commit = sha;
  }
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
// 3. artifact fingerprints: refresh blob SHAs at the adopted commit
{
  const p = root + '/src/data/artifacts.json';
  const data = JSON.parse(readFileSync(p, 'utf8'));
  for (const a of data.artifacts) {
    if (a.repository !== repo) continue;
    try {
      const info = JSON.parse(gh(`repos/${repo}/contents/${a.path}?ref=${sha} --jq "{sha: .sha}"`));
      a.source_commit = sha;
      a.blob_sha = info.sha;
      console.log(`artifact ${a.path}: blob=${info.sha.slice(0, 8)}`);
    } catch (e) { console.error(`blob refresh failed for ${a.path} (kept old fingerprint)`); }
  }
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
console.log(`adopted ${repo}@${sha.slice(0, 8)} — run validate + open a reviewable PR`);
execSync('node scripts/validate.mjs', { encoding: 'utf8', cwd: root, stdio: 'inherit' });
