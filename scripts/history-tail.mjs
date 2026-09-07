// @ts-nocheck
// Builds the STALE input for the next verifier run: one JSONL line per
// verification, newest last, capped at the most recent 48 lines.
// Input:  public/source-state.json (written by freshness.mjs)
// Output: public/source-state-history.jsonl.tail (consumed via --previous)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const st = JSON.parse(readFileSync(root + '/public/source-state.json', 'utf8'));
const tailPath = root + '/public/source-state-history.jsonl.tail';
let lines = [];
if (existsSync(tailPath)) {
  lines = readFileSync(tailPath, 'utf8').split('\n').filter(Boolean);
}
lines.push(JSON.stringify({ checked_at: st.checked_at, sources: st.sources }));
// ponytail: keep last 48 runs (12 days at 6h cadence) — enough STALE history
if (lines.length > 48) lines = lines.slice(-48);
writeFileSync(tailPath, lines.join('\n') + '\n');
console.log(`history tail: ${lines.length} verification records`);