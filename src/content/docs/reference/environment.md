---
title: "Environment Variables"
description: "Every environment variable NaluzPHP reads, its default and what it does."
---

Set these in `.env` or in the real environment. Real environment variables take precedence over `.env`. Boolean values accept
`true`/`false` (and `1`/`0` where a filter is used). Defaults are shown for an unset variable.

## Application

| Variable | Default | Purpose |
|---|---|---|
| `APP_NAME` | `NaluzPHP` | application name (logs, Slack, user agent) |
| `APP_ENV` | `production` | environment name. `local` and `testing` enable the lazy-loading guard |
| `APP_DEBUG` | `false` | show exception details. **Never true in production** |
| `APP_URL` | `http://localhost` | base URL, also the JWT issuer |
| `APP_HOST` | `127.0.0.1` | default host for `run:server` |
| `APP_PORT` | `8000` | default port for `run:server` |
| `APP_KEY` | empty | 32-byte encryption key (`php naluz key:generate`) |
| `APP_TIMEZONE` | `UTC` | timezone for `now()` and the scheduler |
| `PREVENT_LAZY_LOADING` | unset | force the N+1 guard on or off (default: on for `local`, `testing` and debug) |
| `JWT_SECRET` | empty | at least 32 characters, for JWT authentication |

## Cache, session, queue, Redis

| Variable | Default | Purpose |
|---|---|---|
| `CACHE_DRIVER` | `file` | `file`, `array` or `redis` |
| `SESSION_DRIVER` | `file` | `file`, `array` or `redis` |
| `SESSION_SECURE` | unset | force the `Secure` cookie flag (otherwise automatic on HTTPS) |
| `QUEUE_CONNECTION` | `sync` | `sync`, `database` or `redis` |
| `REDIS_HOST` | `127.0.0.1` | |
| `REDIS_PORT` | `6379` | |
| `REDIS_PASSWORD` | unset | |
| `REDIS_DB` | `0` | |

## Database

| Variable | Default | Purpose |
|---|---|---|
| `DB_CONNECTION` | `sqlite` | `sqlite`, `mysql`, `pgsql` or `sqlsrv` |
| `DB_HOST` | `127.0.0.1` | |
| `DB_PORT` | `3306` / `5432` / `1433` | depends on the driver |
| `DB_DATABASE` | `naluz` (SQLite: `storage/database.sqlite`) | |
| `DB_USERNAME` | `root` / `postgres` / `sa` | depends on the driver |
| `DB_PASSWORD` | empty | |
| `DB_ENCRYPT` | `true` | SQL Server: encrypt the connection |
| `DB_TRUST_SERVER_CERTIFICATE` | `false` | SQL Server: trust a self-signed certificate |
| `DB_WRITE_HOST` | empty | primary host (defaults to `DB_HOST`) |
| `DB_READ_HOST` | empty | replica host or comma-separated list. Empty disables read/write splitting |
| `DB_READ_USERNAME`, `DB_READ_PASSWORD`, `DB_READ_PORT` | inherit | replica credentials / port |
| `DB_STICKY` | `true` | reads after a write use the primary |
| `DB_READ_FALLBACK` | `true` | use the primary if all replicas fail |
| `DB_READ_STRATEGY` | `random` | `random` or `ordered` |

## NoSQL

| Variable | Default | Purpose |
|---|---|---|
| `NOSQL_CONNECTION` | `file` | `file`, `memory` or `mongodb` |
| `NOSQL_MONGODB_URI` | `mongodb://127.0.0.1:27017` | |
| `NOSQL_DATABASE` | `naluz` | MongoDB database name |

## Model cache

| Variable | Default | Purpose |
|---|---|---|
| `MODEL_CACHING` | `false` | turn model query caching on |
| `MODEL_CACHE_DRIVER` | `local` | `local`, `redis` or `array` |
| `MODEL_CACHE_TTL` | `300` | seconds an entry lives |
| `MODEL_CACHE_RECACHE` | `true` | re-run hot queries after a write |
| `MODEL_CACHE_RECACHE_LIMIT` | `20` | queries re-cached per write |
| `MODEL_CACHE_RECACHE_DEBOUNCE` | `2` | seconds; a burst of writes re-caches once |
| `MODEL_CACHE_READ_FROM_PRIMARY` | `true` | cache misses read the primary |
| `MODEL_CACHE_FALLBACK` | `true` | keep serving from the database if the store is down |
| `MODEL_CACHE_FLUSH_ON_DELETE` | `all` | `all` or `table` |
| `MODEL_CACHE_ENCRYPT` | `false` | encrypt cached rows with `APP_KEY` |

## Mail

| Variable | Default | Purpose |
|---|---|---|
| `MAIL_MAILER` | `log` | `log`, `smtp` or `array` |
| `MAIL_HOST` | `127.0.0.1` | |
| `MAIL_PORT` | `587` | |
| `MAIL_ENCRYPTION` | `tls` | `tls` (STARTTLS), `ssl` or `none` |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | unset | |
| `MAIL_FROM_ADDRESS` | `hello@example.com` | |
| `MAIL_FROM_NAME` | `APP_NAME` | |

## Logging and storage

| Variable | Default | Purpose |
|---|---|---|
| `LOG_CHANNEL` | `daily` | default channel |
| `LOG_LEVEL` | `debug` | minimum level for the file, stderr and errorlog channels |
| `LOG_DAYS` | `14` | days of daily logs to keep |
| `LOG_SLACK_WEBHOOK_URL` | empty | Slack incoming webhook |
| `LOG_SLACK_LEVEL` | `critical` | minimum level sent to Slack |
| `FILESYSTEM_DISK` | `local` | default storage disk |

## GraphQL

| Variable | Default | Purpose |
|---|---|---|
| `GRAPHQL_MAX_DEPTH` | `10` | maximum selection depth |
| `GRAPHQL_MAX_NODES` | `500` | maximum fields after expanding fragments |
| `GRAPHQL_MAX_QUERY_LENGTH` | `20000` | maximum query size in bytes |
| `GRAPHQL_INTROSPECTION` | unset | `true` / `false`; unset = on only when `APP_DEBUG` is on |
