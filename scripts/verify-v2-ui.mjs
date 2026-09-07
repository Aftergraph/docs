import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(path, 'utf8');
const hero = read('src/components/Hero.astro');
const index = read('src/content/docs/index.mdx');
const config = read('astro.config.mjs');
const css = read('src/styles/brand.css');

const includes = (source, needle, label = needle) =>
  assert.ok(source.includes(needle), `missing ${label}`);

includes(hero, 'Start building', 'developer-first hero CTA');
includes(hero, '/developers/quickstart/', 'Quickstart hero route');
includes(index, 'Golden Mission', 'Golden Mission homepage step');
includes(index, 'Contract Explorer', 'Contract Explorer homepage step');
includes(index, 'API Reference', 'API Reference homepage step');
includes(index, 'Evidence', 'Evidence homepage step');
includes(config, "label: 'Build'", 'Build sidebar group');
includes(config, "label: 'Trust'", 'Trust sidebar group');
assert.ok(config.indexOf("label: 'Evidence'") < config.indexOf("label: 'Research'"), 'Evidence must precede Research');
assert.ok(!css.includes('animation: ag-shimmer'), 'hero shimmer must be removed');
includes(css, ':focus-visible', 'visible focus');
includes(css, 'prefers-reduced-motion', 'reduced-motion support');

console.log('Aftergraph docs V2 UI contract: PASS');
