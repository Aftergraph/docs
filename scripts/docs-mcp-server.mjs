#!/usr/bin/env node
// @ts-nocheck
/**
 * docs-mcp-server.mjs — read-only Aftergraph Docs MCP (V0.4).
 *
 * Protocol: newline-delimited JSON-RPC over stdio (matches the mcp python
 * SDK stdio client transport used by Hermes mcp_servers config).
 *
 * Boundary (mirrors /developers/mcp-boundary on the Knowledge Plane):
 *   - READ-ONLY. No writes, no shell, no network egress beyond reading the
 *     local build's dist/ + public/ artifacts.
 *   - Serves the exact built site commit (dist/build-manifest.json) — an
 *     agent asking for docs gets the provenance-stamped build, never
 *     live-reinterpreted content.
 *
 * Tools:
 *   docs_search(q)          - grep over dist HTML text (no pagefind dep)
 *   docs_get_page(route)    — one rendered page (HTML) + provenance
 *   docs_get_status()       — /status.json (build + freshness summary)
 *   docs_get_contract(name) — contract from contracts.json + graph edges
 *   docs_get_claim(id)      — claim chain from graph.json claim_graph
 *   docs_get_catalog()      — repos from catalog.json (id, role, sha)
 *   docs_get_schema()       — this tool manifest (self-describing)
 *
 * Usage (Hermes config.yaml):
 *   mcp_servers:
 *     aftergraph-docs:
 *       command: node
 *       args: [C:/Users/empir/workspace/docs/scripts/docs-mcp-server.mjs]
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';
const dist = root + '/dist';

const load = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function walkHtml(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walkHtml(p) : (p.endsWith('.html') ? [p] : []);
  });
}

const prov = load('src/data/provenance.json');
const graph = load('src/data/graph.json');
const contracts = load('src/data/contracts.json');
const catalog = load('src/data/catalog.json');
let buildManifest = null;
try { buildManifest = JSON.parse(readFileSync(dist + '/build-manifest.json', 'utf8')); } catch {}

const TOOLS = {
  docs_get_status: {
    description: 'Aftergraph Knowledge Plane build provenance + source freshness (site commit, per-source CURRENT/SOURCE_MOVED/STALE).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  docs_get_contract: {
    description: 'Get one cross-repo contract by name (e.g. "identity/1.0"): owner, consumers, graph edges. Registry: after-graph-governance.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'], additionalProperties: false },
  },
  docs_get_claim: {
    description: 'Get one audited research claim chain by id (C-001..). Registry: ISR AUDIT-EVID-001. Rendered, never reinterpreted.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false },
  },
  docs_get_page: {
    description: 'Get one rendered Knowledge Plane page as text (route like "standards/contract-graph" or "evidence/claim-graph").',
    inputSchema: { type: 'object', properties: { route: { type: 'string' } }, required: ['route'], additionalProperties: false },
  },
  docs_search: {
    description: 'Search all rendered Knowledge Plane pages (text match over dist HTML).',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false },
  },
  docs_get_catalog: {
    description: 'List canonical Aftergraph repos with pinned commit SHAs (the source registry).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
};

function handle(name, args) {
  switch (name) {
    case 'docs_get_status': {
      const status = JSON.parse(readFileSync(root + '/public/status.json', 'utf8'));
      return { build: status.build, summary: status.summary, sources: status.sources.map((s) => ({ repository: s.repository, status: s.status, pinned: s.pinned_sha?.slice(0, 8), remote: s.remote_sha?.slice(0, 8) })) };
    }
    case 'docs_get_contract': {
      const c = contracts.contracts.find((x) => x.contract === args.name);
      if (!c) throw new Error(`unknown contract ${args.name}; valid: ${contracts.contracts.map((x) => x.contract).join(', ')}`);
      const edges = graph.contract_graph.edges.filter((e) => e.contract === args.name);
      return { contract: c, graph_edges: edges, provenance: prov['standards/contract-graph'] };
    }
    case 'docs_get_claim': {
      const c = graph.claim_graph.claims.find((x) => x.id === args.id);
      if (!c) throw new Error(`unknown claim ${args.id}; valid: ${graph.claim_graph.claims.map((x) => x.id).join(', ')}`);
      return { claim: c, provenance: prov['evidence/claim-graph'] };
    }
    case 'docs_get_page': {
      const route = String(args.route || '').replace(/^\/+|\/+$/g, '');
      const file = join(dist, route === '' ? 'index.html' : route, 'index.html');
      if (!route.match(/^[a-z0-9/-]+$/) || !existsSync(file)) {
        throw new Error(`page not found: ${route}`);
      }
      return { route, text: htmlToText(readFileSync(file, 'utf8')).slice(0, 12000), provenance: prov[route] || null, site_commit: buildManifest?.site_commit };
    }
    case 'docs_search': {
      const q = String(args.query || '').toLowerCase();
      if (!q) throw new Error('query required');
      const hits = [];
      for (const f of walkHtml(dist)) {
        const rel = f.slice(f.toLowerCase().lastIndexOf('dist') + 5);
        const route = rel.replace(/[\\/]index\.html$/, '').replace(/\\/g, '/');
        const text = htmlToText(readFileSync(f, 'utf8'));
        const idx = text.toLowerCase().indexOf(q);
        if (idx !== -1) hits.push({ route: route || '/', excerpt: text.slice(Math.max(0, idx - 80), idx + 160) });
        if (hits.length >= 10) break;
      }
      return { query: args.query, hits, site_commit: buildManifest?.site_commit };
    }
    case 'docs_get_catalog':
      return { repos: catalog.repos.map((r) => ({ repo: r.repo, role: r.role, sha: r.sha.slice(0, 8) })), site_commit: buildManifest?.site_commit };
    default:
      throw new Error(`unknown tool ${name}`);
  }
}

// newline-delimited JSON-RPC over stdio
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'parse error' } }); continue; }
    handleRpc(msg).catch((e) => send({ jsonrpc: '2.0', id: msg.id ?? null, error: { code: -32603, message: String(e.message || e) } }));
  }
});
function send(m) { process.stdout.write(JSON.stringify(m) + '\n'); }
process.stdin.on('end', () => process.exit(0));

async function handleRpc(msg) {
  const { id, method, params } = msg;
  if (method === 'initialize') {
    return send({ jsonrpc: '2.0', id, result: { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'aftergraph-docs', version: '0.4.0' } } });
  }
  if (method === 'notifications/initialized') return;
  if (method === 'tools/list') {
    return send({ jsonrpc: '2.0', id, result: { tools: Object.entries(TOOLS).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema })) } });
  }
  if (method === 'tools/call') {
    const name = params?.name;
    try {
      const result = handle(name, params?.arguments || {});
      return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] } });
    } catch (e) {
      return send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `ERROR: ${e.message}` }], isError: true } });
    }
  }
  if (method === 'ping') return send({ jsonrpc: '2.0', id, result: {} });
  return send({ jsonrpc: '2.0', id, error: { code: -32601, message: `method not found: ${method}` } });
}