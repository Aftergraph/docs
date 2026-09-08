import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// V2 IA: Start → Platform → Build → Sentinel → Standards → Evidence → Research → Community → Trust.
// URLs remain stable. Search is Starlight Pagefind; source ownership remains unchanged.
// ThemeSelect is overridden to default to dark; Starlight 0.42 has no defaultTheme option.
export default defineConfig({
  site: 'https://docs.aftergraph.org',
  integrations: [
    starlight({
      title: 'Aftergraph Knowledge Plane',
      description: 'Compiler over canonical sources — build, govern, execute, verify.',
      customCss: ['./src/styles/brand.css', './src/styles/v2.css'],
      components: {
        ThemeSelect: './src/components/overlays/ThemeSelect.astro',
      },
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#080C14' } },
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://docs.aftergraph.org/og-image.jpg' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1024' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '576' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Aftergraph Knowledge Plane — graph network on midnight canvas' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://docs.aftergraph.org/og-image.jpg' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/aftergraph-mark.jpg' } },
      ],
      sidebar: [
        { label: 'Start', items: [
          { label: 'Start here', slug: 'start' },
          { label: 'Concepts', slug: 'concepts' },
          { label: 'Products', slug: 'products' },
        ]},
        { label: 'Platform', items: [
          { label: 'Platform overview', slug: 'platform' },
          { label: 'Golden Mission', slug: 'platform/golden-mission' },
          { label: 'System Map', slug: 'platform/system-map' },
          { label: 'Catalog', slug: 'catalog' },
          { label: 'Live Status', slug: 'status' },
        ]},
        { label: 'Build', items: [
          { label: 'Overview', slug: 'developers' },
          { label: 'Quickstart', slug: 'developers/quickstart' },
          { label: 'Tutorials', slug: 'developers/tutorials' },
          { label: 'How-to Guides', slug: 'developers/how-to' },
          { label: 'Reference', slug: 'developers/reference' },
          { label: 'API Reference', slug: 'developers/api-reference' },
          { label: 'Schemas', slug: 'developers/schemas' },
          { label: 'Try it', slug: 'developers/try-it' },
          { label: 'Explanation', slug: 'developers/explanation' },
          { label: 'Docs MCP (read-only)', slug: 'developers/mcp-boundary' },
          { label: 'Agent Guide', slug: 'developers/agent-guide' },
        ]},
        { label: 'Sentinel', items: [
          { label: 'Sentinel overview', slug: 'sentinel' },
          { label: 'Market Research', slug: 'sentinel/market-research' },
          { label: 'Competitor Analysis', slug: 'sentinel/competitor-analysis' },
          { label: 'Go-to-Market', slug: 'sentinel/go-to-market' },
          { label: 'Brand Identity', slug: 'sentinel/brand-identity' },
          { label: 'Personas', slug: 'sentinel/personas' },
          { label: 'Jobs to be Done', slug: 'sentinel/jobs-to-be-done' },
          { label: 'Validation Plan', slug: 'sentinel/validation-plan' },
          { label: 'UI Flows', slug: 'sentinel/ui-flows' },
          { label: 'Data Model v0', slug: 'sentinel/data-model-v0' },
          { label: 'Risks', slug: 'sentinel/risks' },
          { label: 'CLI v0 Design', slug: 'sentinel/cli-v0-design' },
          { label: 'CLI v0 Features', slug: 'sentinel/cli-v0-features' },
          { label: 'Decisions', slug: 'sentinel/decisions' },
          { label: '90-Day Roadmap', slug: 'sentinel/roadmap-90-days' },
          { label: 'TODO', slug: 'sentinel/todo' },
        ]},
        { label: 'Standards', items: [
          { label: 'Standards overview', slug: 'standards' },
          { label: 'Contracts', slug: 'standards/contracts' },
          { label: 'Contract Graph', slug: 'standards/contract-graph' },
          { label: 'Standards Bindings', slug: 'standards/bindings' },
          { label: 'Conformance Center', slug: 'standards/conformance' },
        ]},
        { label: 'Evidence', items: [
          { label: 'Evidence overview', slug: 'evidence' },
          { label: 'Claim Graph', slug: 'evidence/claim-graph' },
        ]},
        { label: 'Research', items: [
          { label: 'Research overview', slug: 'research' },
          { label: 'Benchmarks', slug: 'research/benchmarks' },
          { label: 'Examples', slug: 'examples' },
        ]},
        { label: 'Community', items: [
          { label: 'Community home', slug: 'community' },
        ]},
        { label: 'Trust', items: [
          { label: 'Company', slug: 'company' },
          { label: 'Trust & Verification', slug: 'company/trust' },
          { label: 'Contributing', slug: 'company/contributing' },
          { label: 'FAQ', slug: 'company/faq' },
          { label: 'Troubleshooting', slug: 'company/troubleshooting' },
          { label: 'Brand', slug: 'company/brand' },
          { label: 'Changelog', slug: 'company/changelog' },
          { label: 'Docs versions', slug: 'company/versions' },
        ]},
      ],
    }),
  ],
});
