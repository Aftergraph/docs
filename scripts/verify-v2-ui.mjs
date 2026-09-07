import fs from 'node:fs';
import assert from 'node:assert/strict';

/** @param {string} filePath */
const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const hero = read('src/components/Hero.astro');
const index = read('src/content/docs/index.mdx');
const config = read('astro.config.mjs');
const brand = read('src/styles/brand.css');
const v2 = read('src/styles/v2.css');

/** @param {string} source @param {string} needle @param {string} [label] */
const includes = (source, needle, label = needle) =>
  assert.ok(source.includes(needle), `missing ${label}`);

includes(hero, 'Start building', 'developer-first hero CTA');
includes(hero, '/developers/quickstart/', 'Quickstart hero route');
includes(hero, 'href="/platform/"', 'Platform hero route');
includes(hero, 'href="/evidence/"', 'Evidence hero route');
includes(index, 'Golden Mission', 'Golden Mission homepage step');
includes(index, 'Contract Explorer', 'Contract Explorer homepage step');
includes(index, 'API Reference', 'API Reference homepage step');
includes(index, 'Evidence', 'Evidence homepage step');
includes(config, "label: 'Build'", 'Build sidebar group');
includes(config, "label: 'Trust'", 'Trust sidebar group');
includes(config, "'./src/styles/v2.css'", 'V2 presentation layer');
assert.ok(config.indexOf("label: 'Evidence'") < config.indexOf("label: 'Research'"), 'Evidence must precede Research');
includes(v2, 'animation: none !important', 'hero shimmer suppression');
includes(v2, '.ag-journey-list', 'developer journey styles');
includes(brand + v2, ':focus-visible', 'visible focus');
includes(brand + v2, 'prefers-reduced-motion', 'reduced-motion support');

console.log('Aftergraph docs V2 UI contract: PASS');
