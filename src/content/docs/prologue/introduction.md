---
title: "Introduction"
description: "What NaluzPHP is, what it includes and how its repositories fit together."
---

NaluzPHP is a PHP framework for building monolithic web applications and REST APIs. It follows the conventions that Laravel
developers know (`Model::with()`, `$router->apiResource()`, `php naluz migrate`, `Job::dispatch()`), but it is a much smaller,
auditable codebase with **stricter defaults**: debug output is off, SQL identifiers are validated, templates escape output,
queue payloads are encrypted and uploads are checked by content.

It was created by Mark Anthony Naluz and is released under the MIT license.

## What is included

| Area | Highlights |
|---|---|
| HTTP | PSR-7 / PSR-15 pipeline, router with groups and route caching, CORS, rate limiting, security headers |
| Database | Query builder, active-record ORM with relationships, migrations, factories and seeders, read/write splitting |
| Drivers | SQLite, MySQL / MariaDB, PostgreSQL, SQL Server, plus NoSQL document stores (file, memory, MongoDB) |
| Performance | Optional model query caching, route caching, compiled templates, Redis support |
| Background work | Queues (sync, database, Redis), cron-style scheduler, mail |
| Views | Compiled, auto-escaping template engine (`*.naluz.php`) |
| Security | Argon2id hashing, encryption, JWT, CSRF, sessions, validation, SSRF-guarded HTTP client |
| APIs | JSON responses and pagination, a built-in GraphQL server |
| Operations | PSR-3 logging with Slack, JSON and stack channels; an error handler that never loses a message |
| Tooling | The `naluz` CLI, generators, a test base class that boots the whole application |

## How the repositories fit together

| Repository | What it is |
|---|---|
| [`naluzphp-framework`](https://github.com/taliffsss/naluzphp-framework) | The **application skeleton**. Clone it to start a project. It contains `app/`, `config/`, `routes/`, the test suite and the `naluz` command. |
| [`naluz-framework`](https://github.com/taliffsss/naluz-framework) | The **framework core**, a Composer package (`naluz/framework`) installed into `vendor/` by `composer install`. |
| [`naluz-framework-docs`](https://github.com/taliffsss/naluz-framework-docs) | This documentation site, the single source of truth for NaluzPHP documentation. |

:::note
Everything in this documentation describes behavior that exists in the framework today. Where something is deliberately
missing (for example policies or a Gate, subscriptions in GraphQL, or an S3 disk), the page says so.
:::

## Where to go next

1. [Check the requirements](../requirements/) and [install](../installation/) the framework.
2. Build [your first feature](../getting-started/) in about five minutes.
3. Skim [the project structure](../structure/) and [configuration](../configuration/).
4. Read [Security](../../security/overview/) before you go to production, and follow the
   [production guide](../../guides/going-to-production/).

## Versioning

The framework follows semantic versioning. Release notes live under [Releases](../../releases/). The application skeleton
requires the core through Composer (`"naluz/framework": "^1.2"`), so you update the framework with
`composer update naluz/framework`.
