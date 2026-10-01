---
title: "Configuration"
description: "How configuration files and environment variables work in NaluzPHP."
---

## Configuration files

Every file in `config/` returns an array. Values are read from environment variables with `env()` and accessed anywhere
with the `config()` helper (dot notation):

```php
config('app.name');                  // 'NaluzPHP'
config('database.default');          // 'sqlite'
config('mail.from.address', 'x@y'); // with a default
```

Or inject the repository:

```php
use Naluz\Config\Repository;

public function __construct(private readonly Repository $config) {}
// $this->config->get('app.debug');
```

The full list of files and keys is in the [configuration reference](../../reference/configuration/).

## Environment variables

Settings that differ per environment live in `.env`. Copy `.env.example` to `.env` and edit it. `.env` is ignored by Git;
**never commit it**.

```ini
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:…
JWT_SECRET=…
DB_CONNECTION=sqlite
```

Rules of the `.env` parser:

- `KEY=value`, one per line. `#` starts a comment, including after an unquoted value.
- Values may be quoted with `"` or `'`. In double quotes `\n` and `\"` are expanded.
- An optional `export ` prefix is accepted.
- `true`, `false`, `null` and `empty` (also in parentheses) become `true`, `false`, `null` and `''` when read through `env()`.

### Precedence

1. values set explicitly in code (`Env::set()`)
2. real environment variables (the web server, php-fpm, Docker, CI)
3. the `.env` file

So a variable set by your platform always wins over the file. In production you often have no `.env` at all.

## Environment

`APP_ENV` names the environment (`local`, `testing`, `production` …). It affects a few defaults:

| Setting | Behavior |
|---|---|
| `APP_DEBUG` | Defaults to **false**. When true, error responses include the exception, file and trace. Never enable it in production. |
| lazy-loading guard | On by default for `local`, `testing` or when debugging; override with `PREVENT_LAZY_LOADING`. See [Models](../../database/models/). |
| route cache | Ignored while `APP_DEBUG=true`. |
| templates | Recompiled on change outside production; trusted as-is in production. |

## Key settings

| Key | Purpose |
|---|---|
| `APP_KEY` | 32-byte key for the `encrypted` cast, the `Encrypter` and queue payloads. Generate with `php naluz key:generate`. |
| `JWT_SECRET` | at least 32 characters, used for token authentication. |
| `APP_URL` | base URL, also the JWT issuer. |
| `APP_TIMEZONE` | timezone for `now()` and the scheduler (default `UTC`). |
| `DB_CONNECTION` | `sqlite` (default), `mysql`, `pgsql` or `sqlsrv`. |
| `CACHE_DRIVER` | `file` (default), `array` or `redis`. |
| `SESSION_DRIVER` | `file` (default), `array` or `redis`. |
| `QUEUE_CONNECTION` | `sync` (default), `database` or `redis`. |
| `LOG_CHANNEL` | `daily` (default), `single`, `stderr`, `errorlog`, `slack`, `production` … |

See the [environment variable reference](../../reference/environment/) for everything.

## Secrets and rotation

Rotate `APP_KEY` without breaking existing encrypted data by moving the old key into `previous_keys` in `config/app.php`:

```php
'key' => env('APP_KEY'),
'previous_keys' => ['base64:old-key-here'],
```

Existing data encrypted with an old key can still be decrypted. Anything encrypted from now on uses the new key.
