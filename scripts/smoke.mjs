// @ts-nocheck
// Post-deploy production smoke: public URLs must return expected statuses,
// provenance surfaces must be present, no private leakage in served HTML/JSON.
// Usage: node scripts/smoke.mjs [base-url]   (default: http://localhost:4321)
// Set EXPECTED_SITE_COMMIT to require the served build manifest to match an
// exact Git commit (used by production deployment verification).
import { execFileSync } from 'node:child_process';
const base = process.argv[2] || 'http://localhost:4321';
const expectedSiteCommit = process.env.EXPECTED_SITE_COMMIT || null;
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

const routes = ['/', '/community/', '/developers/', '/research/', '/standards/', '/evidence/', '/catalog/',
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
  if (r === '/build-manifest.json') {
    if (!/"site_commit"/.test(body)) fail('/build-manifest.json missing site_commit');
    if (expectedSiteCommit) {
      try {
        const manifest = JSON.parse(body);
        if (manifest.site_commit !== expectedSiteCommit)
          fail(`/build-manifest.json site_commit ${manifest.site_commit} != expected ${expectedSiteCommit}`);
        else ok(`exact site_commit: ${expectedSiteCommit}`);
      } catch (e) {
        fail('/build-manifest.json invalid JSON while checking exact site commit');
      }
    }
  }
  if (r === '/context/index.json' && !/"packs"/.test(body)) fail('/context/index.json missing pack list');
  if (r === '/robots.txt' && !/sitemap-index/.test(body)) fail('/robots.txt missing sitemap reference');
  if (r.endsWith('/') && body.toLowerCase().includes('skills-vault')) fail(`/ leaks private source name ${r}`);
}
if (!process.exitCode) console.log(`SMOKE PASS (${routes.length} routes, ${base})`);
