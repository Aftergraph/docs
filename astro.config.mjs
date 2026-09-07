import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// ponytail: sidebar mirrors the canonical IA (Platform Developers Research
// Standards Evidence Catalog Company). No generic "Docs" top-level —
// ADR-003. Search is Starlight Pagefind (default, no hosted dependency).
export default defineConfig({
  site: 'https://docs.aftergraph.org',
  integrations: [
    starlight({
      title: 'Aftergraph Knowledge Plane',
      customCss: ['./src/styles/brand.css'],
      sidebar: [
        { label: 'Platform', items: [
          { label: 'Overview', slug: 'platform' },
          { label: 'Golden Mission', slug: 'platform/golden-mission' },
          { label: 'Live Status', slug: 'status' },
        ]},
        { label: 'Developers', items: [
          { label: 'Overview', slug: 'developers' },
          { label: 'Tutorials', slug: 'developers/tutorials' },
          { label: 'How-to Guides', slug: 'developers/how-to' },
          { label: 'Reference', slug: 'developers/reference' },
          { label: 'Explanation', slug: 'developers/explanation' },
          { label: 'API Reference', slug: 'developers/api-reference' },
          { label: 'MCP Boundary (future)', slug: 'developers/mcp-boundary' },
        ]},
        { label: 'Research', items: [{ label: 'Overview', slug: 'research' }]},
        { label: 'Standards', items: [
          { label: 'Overview', slug: 'standards' },
          { label: 'Contracts', slug: 'standards/contracts' },
          { label: 'Contract Graph', slug: 'standards/contract-graph' },
        ]},
        { label: 'Evidence', items: [
          { label: 'Overview', slug: 'evidence' },
          { label: 'Claim Graph', slug: 'evidence/claim-graph' },
        ]},
        { label: 'Catalog', items: [{ label: 'Overview', slug: 'catalog' }]},
        { label: 'Company', items: [{ label: 'Overview', slug: 'company' }]},
      ],
    }),
  ],
});
