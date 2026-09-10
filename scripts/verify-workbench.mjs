// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
let failures = 0;
const read = (rel) => {
  try { return fs.readFileSync(path.join(root, rel), 'utf8'); }
  catch { failures += 1; console.error(`WORKBENCH-FAIL: missing ${rel}`); return ''; }
};
const includes = (text, needle, message = needle) => {
  if (!text.includes(needle)) { failures += 1; console.error(`WORKBENCH-FAIL: ${message}`); }
};

const lens = read('src/components/WorkbenchLens.astro');
const inspector = read('src/components/SourceEvidenceInspector.astro');
for (const name of ['SYSTEM', 'EVIDENCE', 'SOURCE']) includes(lens, name, `lens component missing ${name}`);
includes(lens, 'aria-pressed', 'lens controls must expose aria-pressed state');
includes(lens, 'URLSearchParams', 'lens state must restore through URL query state');
includes(inspector, 'Not evidenced', 'inspector must render an explicit not-evidenced state');
includes(inspector, 'Withheld', 'inspector must render an explicit withheld state');

if (failures) process.exit(1);
console.log('WORKBENCH-VERIFY PASS: lenses + source/evidence states');
