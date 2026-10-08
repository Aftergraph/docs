// @ts-nocheck
// Auto-adopt SOURCES whose content is PROVEN UNCHANGED (SOURCE_MOVED_CONTENT_UNCHANGED).
// ADR-004: auto-report, never auto-update — with this one exception, decided
// deliberately: a content-unchanged move is byte-identical, so adopting the new
// pin changes no claim, only the pointer. The PR is DRAFT and reviewable: a
// human presses the merge button, exactly like any explicit adoption.
// SOURCE_MOVED_CONTENT_CHANGED / STALE never get a PR from here — that path
// is scripts/adopt-issue.mjs (report + human decision), untouched.
// Idempotent: skips a source whose adoption branch already has an open PR.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const state = JSON.parse(readFileSync(root + '/public/source-state.json', 'utf8'));
const run = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', cwd: root, ...opts });

const adoptable = state.sources.filter(
  (s) => s.status === 'SOURCE_MOVED_CONTENT_UNCHANGED' && s.remote_sha,
);

if (!adoptable.length) {
  console.log('no content-unchanged drift — nothing to auto-adopt');
  process.exit(0);
}

const base = run('git rev-parse --abbrev-ref HEAD').trim();
if (base !== 'main') {
  console.error(`refusing to adopt from branch "${base}" — adoption runs from main only`);
  process.exit(1);
}
run('git config user.name knowledge-plane-verifier');
run('git config user.email actions@users.noreply.github.com');

for (const s of adoptable) {
  const sha = s.remote_sha;
  const branch = `verifier/adopt-${s.repository.split('/')[1]}-${sha.slice(0, 8)}`;

  const existing = JSON.parse(
    run(`gh pr list -R Aftergraph/docs --state open --json headRefName`),
  );
  if (existing.some((p) => p.headRefName === branch)) {
    console.log(`open PR already exists for ${branch} — skipping`);
    continue;
  }

  run(`git checkout -b ${branch}`);
  try {
    run(`node scripts/adopt-source.mjs ${s.repository} ${sha}`);
    run(`git add -A`);
    const noDiff = run('git diff --cached --quiet && echo NO_DIFF || echo HAS_DIFF').trim().endsWith('NO_DIFF');
    if (noDiff) {
      console.log(`adopt of ${s.repository} produced no diff — deleting branch`);
      run('git checkout main');
      run(`git branch -D ${branch}`);
      continue;
    }
    run(`git commit -m "chore(verifier): adopt ${s.repository}@${sha.slice(0, 8)} (content unchanged)"`);

    const body = `Automatic Live Truth adoption. The verifier proved the source moved with **content unchanged** (status \`SOURCE_MOVED_CONTENT_UNCHANGED\`: remote HEAD is byte-identical at the artifact level), so this pin bump changes no published claim — only the pointer.\n\n- repository: \`${s.repository}\`\n- pinned: \`${s.pinned_sha}\`\n- remote: \`${sha}\`\n- checked_at: ${state.checked_at}\n\nAdoption ran \`node scripts/adopt-source.mjs ${s.repository} ${sha}\` (pins + provenance + catalog + artifact fingerprints, then validate). Draft by design: a human merges (ADR-004).\n\n_Source: scripts/adopt-unchanged.mjs · evidence: public/source-state.json_`;

    run(`git push origin ${branch}`);
    run(`gh pr create -R Aftergraph/docs --draft --head ${branch} --title ${JSON.stringify(`chore(verifier): adopt ${s.repository}@${sha.slice(0, 8)} (content unchanged)`)} --body ${JSON.stringify(body)}`, { stdio: 'inherit' });
    console.log(`draft adoption PR opened for ${s.repository}`);
  } catch (err) {
    console.error(`adoption failed for ${s.repository}: ${err.message}`);
  } finally {
    run('git checkout main');
    run(`git branch -D ${branch} 2>/dev/null || true`);
  }
}
console.log('adoption pass complete');
