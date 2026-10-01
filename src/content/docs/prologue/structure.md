---
title: "Project Structure"
description: "What each directory of a NaluzPHP application is for."
---

```text
my-app/
├── app/                  your application code (namespace App\)
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   ├── Models/
│   ├── Observers/        model observers
│   ├── Providers/        service providers
│   ├── GraphQL/          the sample GraphQL schema
│   └── Services/
├── bootstrap/app.php     creates the Application
├── config/               configuration files, one per concern
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── public/               the only web-accessible directory (index.php, .htaccess)
├── resources/views/      *.naluz.php templates
├── routes/
│   ├── web.php           browser routes (sessions + CSRF)
│   ├── api.php           API routes (stateless, /api prefix, rate limited)
│   └── console.php       scheduled tasks
├── storage/              logs, caches, sessions, uploads, the SQLite file
├── tests/                PHPUnit tests
├── vendor/               Composer packages, including naluz/framework
├── .env                  environment-specific settings (never commit)
├── composer.json
└── naluz                 the command-line entry point
```

## `app/`

Your code lives here and is autoloaded as `App\`. The generators put files in the conventional places:

| Command | Creates |
|---|---|
| `make:controller` | `app/Http/Controllers/` |
| `make:model` | `app/Models/` |
| `make:middleware` | `app/Http/Middleware/` |
| `make:job` | `app/Jobs/` |
| `make:provider` | `app/Providers/` |
| `make:observer` | `app/Observers/` |
| `make:factory` | `database/factories/` |
| `make:seeder` | `database/seeders/` |
| `make:migration` | `database/migrations/` |

## `bootstrap/` and `public/`

`public/index.php` is the single entry point for web requests. It loads `bootstrap/app.php`, which creates the
`Naluz\Foundation\Application`, and calls `$app->run()`. The `naluz` script does the same for the command line.

## `config/`

One PHP file per concern (`app.php`, `database.php`, `logging.php` …). Each returns an array and reads environment
variables with `env()`. See [Configuration](../configuration/) and the [configuration reference](../../reference/configuration/).

## `routes/`

`web.php` is wrapped in the `web` middleware group (sessions and CSRF). `api.php` is wrapped in the `api` group, prefixed
with `/api`, named `api.*` and rate limited. `console.php` returns a closure that defines scheduled tasks.

## `storage/`

Everything the application writes at runtime: `logs/`, `cache/` (views, routes, data, models), `sessions/`, `app/`
(private uploads), `nosql/` and the default SQLite database. It must be writable by the web server user and must not be
served by the web server.

## `vendor/naluz/framework`

The framework core (namespace `Naluz\`). You do not edit it; you configure it, extend it through service providers, and
update it with Composer.
