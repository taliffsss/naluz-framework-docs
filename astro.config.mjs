// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Deployed to GitHub Pages by .github/workflows/deploy.yml. Override SITE_URL / BASE_PATH for a custom domain.
const site = process.env.SITE_URL ?? 'https://taliffsss.github.io';
const base = process.env.BASE_PATH ?? '/naluz-framework-docs';

export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: 'NaluzPHP',
      description: 'Documentation for NaluzPHP, a modern, secure PHP framework for monoliths and REST APIs.',
      logo: { src: './src/assets/logo.svg', alt: 'NaluzPHP' },
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'Application skeleton', href: 'https://github.com/taliffsss/naluzphp-framework' },
      ],
      editLink: { baseUrl: 'https://github.com/taliffsss/naluz-framework-docs/edit/main/' },
      lastUpdated: true,
      customCss: ['./src/styles/custom.css'],
      expressiveCode: {
        themes: ['github-dark-dimmed', 'github-light'],
        styleOverrides: { borderRadius: '0.5rem' },
      },
      sidebar: [
        { label: 'Prologue', items: [
          { slug: 'prologue/introduction' },
          { slug: 'prologue/requirements' },
          { slug: 'prologue/installation' },
          { slug: 'prologue/installer' },
          { slug: 'prologue/getting-started' },
          { slug: 'prologue/structure' },
          { slug: 'prologue/configuration' },
        ] },
        { label: 'The Basics', items: [
          { slug: 'basics/routing' },
          { slug: 'basics/controllers' },
          { slug: 'basics/requests-responses' },
          { slug: 'basics/middleware' },
          { slug: 'basics/views' },
          { slug: 'basics/validation' },
          { slug: 'basics/sessions' },
          { slug: 'basics/errors' },
          { slug: 'basics/logging' },
        ] },
        { label: 'Security', items: [
          { slug: 'security/overview' },
          { slug: 'security/authentication' },
          { slug: 'security/authorization' },
          { slug: 'security/encryption' },
          { slug: 'security/protections' },
        ] },
        { label: 'Database', items: [
          { slug: 'database/overview' },
          { slug: 'database/query-builder' },
          { slug: 'database/migrations' },
          { slug: 'database/models' },
          { slug: 'database/relationships' },
          { slug: 'database/factories-seeders' },
          { slug: 'database/read-write' },
          { slug: 'database/drivers' },
          { slug: 'database/model-caching' },
          { slug: 'database/nosql' },
        ] },
        { label: 'Digging Deeper', items: [
          { slug: 'advanced/container' },
          { slug: 'advanced/providers' },
          { slug: 'advanced/events' },
          { slug: 'advanced/cache' },
          { slug: 'advanced/queues' },
          { slug: 'advanced/event-streaming' },
          { slug: 'advanced/mail' },
          { slug: 'advanced/scheduler' },
          { slug: 'advanced/storage' },
          { slug: 'advanced/http-client' },
          { slug: 'advanced/graphql' },
          { slug: 'advanced/packages' },
        ] },
        { label: 'Tooling', items: [
          { slug: 'tooling/cli' },
          { slug: 'tooling/testing' },
          { slug: 'tooling/deployment' },
          { slug: 'tooling/performance' },
        ] },
        { label: 'Reference', items: [
          { slug: 'reference/configuration' },
          { slug: 'reference/environment' },
          { slug: 'reference/helpers' },
          { slug: 'reference/psr' },
          { slug: 'reference/architecture' },
          { slug: 'reference/comparison' },
        ] },
        { label: 'Guides', items: [
          { slug: 'guides/rest-api' },
          { slug: 'guides/graphql-api' },
          { slug: 'guides/background-jobs' },
          { slug: 'guides/going-to-production' },
        ] },
        { label: 'Releases', items: [
          { slug: 'releases' },
          { slug: 'releases/v1-3-0' },
          { slug: 'releases/v1-2-2' },
          { slug: 'releases/v1-2-0' },
          { slug: 'releases/v1-0-0' },
        ] },
      ],
    }),
  ],
});
