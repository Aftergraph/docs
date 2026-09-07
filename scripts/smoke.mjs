// @ts-nocheck
// Post-deploy production smoke: public URLs must return 200, provenance
// surfaces must be present, no private leakage in served HTML/JSON.
// Usage: node scripts/smoke.mjs [base-url]   (default: http://localhost:4321)
import { execFileSync } from 'node:child_process';
const base = process.argv[2] || 'http://localhost:4321';
const fail = (m) => { console.error('SMOKE FAIL: ' + m); process.exitCode = 1; };
const ok = (m) => console.log('ok: ' + m);
const get = (path) => {
  try {
    const out = execFileSync('curl', ['-sS', '-o', '-', '-w', '\n%{http_code}', base + path],
      { encoding: 'utf8', timeout: 30000, maxBuffer: 10 * 1024 * 1024 });
    const body = out.slice(0, out.lastIndexOf('\n'));
    const code = out.slice(out.lastIndexOf('\n') + 1).trim();
    return { body, code: Number(code) };
  } catch (e) { return { body: '', code: 0 }; }
};

const routes = ['/', '/developers/', '/research/', '/standards/', '/evidence/', '/catalog/',
  '/llms.txt', '/build-manifest.json', '/status/', '/status.json', '/source-state.json',
  '/standards/contracts/', '/developers/api-reference/', '/context/index.json',
  '/developers/quickstart/', '/developers/tutorials/', '/developers/reference/',
  '/company/trust/', '/company/faq/', '/company/changelog/', '/company/brand/',
  '/platform/system-map/', '/standards/contract-graph/', '/evidence/claim-graph/',
  '/robots.txt', '/nonexistent-404-probe/'];
for (const r of routes) {
  const { code, body } = get(r);
  const expect404 = r === '/nonexistent-404-probe/';
  if (expect404) {
    if (code !== 404) fail(`404 probe returned HTTP ${code} (custom 404 must serve 404 status)`);
    else if (!/context\/index\.json/.test(body)) fail('404 page missing agent pointer');
    else ok(`404 probe: HTTP 404 + agent pointer`);
    continue;
  }
  if (code !== 200) { fail(`${r} -> HTTP ${code}`); continue; }
  if (r === '/llms.txt' && !/freshness boundary/i.test(body)) fail('/llms.txt missing freshness boundary');
  if (r === '/status.json' && !/"site_commit"/.test(body)) fail('/status.json missing site_commit');
  if (r === '/build-manifest.json' && !/"site_commit"/.test(body)) fail('/build-manifest.json missing site_commit');
  if (r === '/context/index.json' && !/"packs"/.test(body)) fail('/context/index.json missing pack list');
  if (r === '/robots.txt' && !/sitemap-index/.test(body)) fail('/robots.txt missing sitemap reference');
  if (r.endsWith('/') && body.toLowerCase().includes('skills-vault')) fail(`/ leaks private source name ${r}`);
}
if (!process.exitCode) console.log(`SMOKE PASS (${routes.length} routes, ${base})`);