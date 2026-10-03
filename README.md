# NaluzPHP documentation

The documentation site for the [NaluzPHP framework](https://github.com/taliffsss/naluzphp-framework), built with
[Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

**This repository is the single source of truth for NaluzPHP documentation.** The framework repositories no longer carry a
`docs/` folder; documentation changes are made here.

| Repository | Contains |
|---|---|
| [`naluzphp-framework`](https://github.com/taliffsss/naluzphp-framework) | the application skeleton (clone it to start a project) |
| [`naluz-framework`](https://github.com/taliffsss/naluz-framework) | the framework core (`naluz/framework` on Composer) |
| [`naluz-installer`](https://github.com/taliffsss/naluz-installer) | the global installer (`naluz new my-app`) |
| `naluz-framework-docs` (this repo) | the documentation |

## Why Astro (Starlight)

The documentation is almost entirely static content with code samples, so a static-site generator fits. Astro with its
**Starlight** documentation theme provides, with no custom code: a Laravel-style sidebar and per-page table of contents,
full-text search (Pagefind, built at build time), Shiki syntax highlighting with light and dark themes, responsive layout,
accessible navigation, and zero JavaScript on content pages beyond search and the theme toggle. Content is plain Markdown,
which keeps contributions easy and the output host-agnostic.

## Develop

Requires Node.js 20 or later.

```bash
npm install
npm run dev          # http://localhost:4321/naluz-framework-docs/
npm run build        # static site in dist/
npm run preview
npm run check        # after a build: verifies every internal link and #anchor
```

## Structure

```text
src/content/docs/
├── index.mdx            home page
├── prologue/            introduction, requirements, installation, installer, getting started, structure, configuration
├── basics/              routing, controllers, requests and responses, middleware, views, validation, sessions, errors, logging
├── security/            overview, authentication, authorization, encryption, protections
├── database/            overview, query builder, migrations, models, relationships, factories, read/write, drivers, caching, NoSQL
├── advanced/            container, providers, events, cache, queues, mail, scheduler, storage, HTTP client, GraphQL, event streaming, packages
├── tooling/             CLI, testing, deployment, performance
├── reference/           configuration, environment variables, helpers, PSR, architecture, comparison with Laravel
├── guides/              REST API, GraphQL API, background jobs, going to production
└── releases/            release notes
astro.config.mjs         site, sidebar, theme
src/styles/custom.css    typography
scripts/check-links.mjs  link and anchor checker
```

The sidebar is defined in `astro.config.mjs`; add new pages there.

## Writing guidelines

- **Document only what exists.** Check the code in `naluz-framework` / `naluzphp-framework` first. If something is not
  built, say so or leave it out.
- Use relative links between pages (`../routing/`) and run `npm run check` after a build.
- Code blocks should be runnable. Use ```` ```php title="path/to/file.php" ```` for files.
- Use `:::note`, `:::caution` and `:::danger` asides for warnings.

## Deployment

`.github/workflows/deploy.yml` builds the site and publishes it to **GitHub Pages** on every push to `main`. In the repository
settings choose **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site is then served at
`https://taliffsss.github.io/naluz-framework-docs/`.

For a custom domain or another host, set the environment variables used by `astro.config.mjs` at build time:

```bash
SITE_URL=https://docs.example.com BASE_PATH=/ npm run build
```

## Migration from the old `docs/` folder

The former `docs/` folder of `naluzphp-framework` was moved here and reorganized:

| Old file | New page(s) |
|---|---|
| `getting-started.md` | Installation, Getting Started, Configuration |
| `architecture.md` | Introduction, Architecture, PSR Compliance, Compared with Laravel, Packages and Extending |
| `http.md` | Routing, Controllers, Requests and Responses, Middleware, Views, Sessions |
| `database.md` | Database overview, Query Builder, Migrations, Models, Relationships, Factories and Seeders, Read/Write, Drivers |
| `model-cache.md` | Model Caching |
| `nosql.md` | NoSQL, Read/Write Connections, Database Drivers |
| `queues.md`, `mail.md`, `scheduler.md`, `storage.md`, `http-client.md`, `graphql.md`, `event-streaming.md` | the pages of the same names under Digging Deeper |
| `providers-and-observers.md` | Service Providers, Events and Observers |
| `packages.md` | Packages and Extending |
| `logging.md` | Logging, Error Handling |
| `security.md` | Security Overview, Authentication, Encryption, Protections |
| `templates.md` | Views and Templates |
| `testing.md` | Testing |
| `performance.md` | Performance, Deployment |
| `releases/v1.0.0.md` | Release Notes |

While moving, statements that no longer matched the code were corrected rather than copied (for example: views *are*
auto-escaped, uploads *are* built in, the HTTP client exists, packages cannot add CLI commands, `NOSQL_DATABASE` is the
MongoDB database variable).

## License

MIT, like the framework.
