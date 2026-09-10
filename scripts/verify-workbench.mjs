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

const mission = read('src/components/MissionFlow.astro');
const missionPage = read('src/content/docs/platform/golden-mission.mdx');
includes(mission, 'data-mission-step', 'Golden Mission must expose selectable trace steps');
includes(mission, 'aria-current', 'Golden Mission must expose current-step semantics');
includes(mission, 'Route walkthrough', 'Golden Mission must identify itself as a route walkthrough');
includes(mission, 'Complete is not verified', 'Golden Mission must preserve completion != verification boundary');
includes(missionPage, 'WorkbenchLens', 'Golden Mission page must mount the shared lens control');

const contractGraph = read('src/components/ContractGraph.astro');
const contractPage = read('src/content/docs/standards/contract-graph.mdx');
includes(contractGraph, 'data-node-id', 'Contract Graph must expose selectable node ids');
includes(contractGraph, 'Inspect in Atlas', 'Contract Graph must hand selection to Atlas');
includes(contractGraph, 'https://aftergraph.org/atlas/', 'Contract Graph Atlas handoff must target the public Atlas origin');
includes(contractGraph, 'Escape', 'Contract Graph must document/implement Escape clear behavior');
includes(contractGraph, 'aria-pressed', 'Contract Graph selection must be exposed accessibly');
includes(contractPage, 'WorkbenchLens', 'Contract Graph page must mount the shared lens control');

includes(lens, 'aftergraph:lenschange', 'lens changes must be observable by workbench surfaces');
includes(mission, 'ArrowRight', 'Golden Mission must support keyboard step traversal');
includes(mission, 'ArrowDown', 'Golden Mission must support keyboard step traversal');
includes(contractGraph, "event.key === 'Enter'", 'Contract Graph must support Enter selection');
const styles = read('src/styles/v2.css');
includes(styles, '.ag-graph-layout', 'Contract Graph must have a responsive inspection layout');
includes(styles, '@media (max-width: 52rem)', 'Contract Graph must collapse for narrow/mobile viewports');

if (failures) process.exit(1);
console.log('WORKBENCH-VERIFY PASS: lenses + source/evidence states + interactive traces + contract inspection');
