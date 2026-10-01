---
title: "Architecture"
description: "The request lifecycle, framework components and where each piece lives."
---

## Request lifecycle

```text
public/index.php → bootstrap/app.php → Application::boot()   (env, config, providers, routes)
  → PSR-15 pipeline: SecurityHeaders → Cors → MethodOverride        (global, config/app.php)
    → Router: match route → route middleware (web: session, csrf | api: throttle | …)
      → controller (container-resolved) → response normalized to PSR-7
  exceptions → ExceptionHandler (JSON for APIs / HTML for browsers; logs 5xx)
  → Emitter
```

1. The web server sends every request to `public/index.php`.
2. `Application::boot()` loads `.env` and `config/*.php`, registers the framework providers, discovered package providers and your
   providers, boots them, then loads the routes (from the cache when present).
3. The global middleware run, then the router matches the route and runs the group and route middleware.
4. The controller is resolved from the container and called with injected arguments.
5. The return value is converted to a PSR-7 response and emitted.
6. Any exception is turned into a response by the exception handler.

## Components

The framework core (`vendor/naluz/framework/src`) contains these namespaces under `Naluz\`:

| Namespace | Responsibility |
|---|---|
| `Container` | PSR-11 service container |
| `Config` | configuration repository |
| `Foundation` | `Application`, service providers, exception and error handlers, emitter, package discovery |
| `Http` (+ `Http\Middleware`, `Http\Client`) | requests, responses, middleware, the HTTP client |
| `Routing` | router, routes, route groups |
| `Database` (`Query`, `Schema`, `Migrations`, `Orm`) | connections, query builder, schema builder, migrations, ORM, model cache |
| `NoSql` | document stores and query builder |
| `GraphQL` | parser, validator, executor, introspection, controller |
| `Validation` | validator |
| `Security` | hashing, encryption, JWT, CSRF |
| `Session`, `Auth` | sessions and authentication |
| `View` | template compiler and factory |
| `Cache`, `Redis` | PSR-6/16 caches and the Redis client |
| `Queue`, `Mail`, `Schedule`, `Storage` | background jobs, mail, scheduler, files |
| `Log` | PSR-3 channels |
| `Events` | PSR-14 dispatcher |
| `Console` | the `naluz` command line |
| `Support` | helpers, collections, strings, clocks |

## Repositories

The framework is split into a core package and an application skeleton:

- **`naluz/framework`** ([`naluz-framework`](https://github.com/taliffsss/naluz-framework)): the core library, installed into `vendor/`.
- **[`naluzphp-framework`](https://github.com/taliffsss/naluzphp-framework)**: the skeleton you clone. It requires `"naluz/framework": "^1.2"`
  and holds `app/`, `config/`, `routes/`, tests and the `naluz` script.

You update the framework with `composer update naluz/framework`.

The skeleton's `composer.json` fetches the core from its GitHub repository through a Composer `vcs` repository entry:

```json
"repositories": [{ "type": "vcs", "url": "https://github.com/taliffsss/naluz-framework" }],
"require": { "naluz/framework": "^1.2" }
```

Once the package is registered on Packagist the `repositories` entry can be removed.

## Known limitations

- MySQL, PostgreSQL and SQL Server grammars are verified by SQL-generation tests only; the executable suite runs on SQLite and a real Redis server.
- The MongoDB adapter is tested against a fake collection, not a live server.
- Rate limiting uses a fixed window, so it is slightly bursty at window edges.
- The template engine is regex-based: directive arguments containing unbalanced parentheses inside strings are not supported.
- Route caching supports controller routes only.
- The `naluz` command has a fixed set of commands; packages cannot add commands.
