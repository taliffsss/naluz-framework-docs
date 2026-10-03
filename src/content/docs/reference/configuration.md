---
title: "Configuration Reference"
description: "Every configuration file in config/ and the keys it contains."
---

All files are in `config/` and return arrays. Read a value with `config('file.key')`.

## `app.php`

| Key | Default | Description |
|---|---|---|
| `name` | `APP_NAME` | application name |
| `env` | `APP_ENV` (`production`) | environment |
| `debug` | `APP_DEBUG` (`false`) | show error details |
| `prevent_lazy_loading` | `PREVENT_LAZY_LOADING` | N+1 guard override |
| `routes_cache` | `null` | path of the route cache (default `storage/cache/routes.php`) |
| `url` | `APP_URL` | base URL |
| `timezone` | `APP_TIMEZONE` (`UTC`) | |
| `key` | `APP_KEY` | encryption key |
| `previous_keys` | `[]` | old keys still accepted for decryption |
| `cache` | `CACHE_DRIVER` (`file`) | cache driver |
| `dont_discover` | `[]` | packages whose providers are not auto-registered (`['*']` for none) |
| `providers` | `[]` | your service providers |
| `middleware` | security headers, CORS, method override | global middleware, outermost first |
| `middleware_aliases` | `session`, `csrf`, `throttle`, `auth`, `jwt` | short names for route middleware |
| `middleware_groups` | `web`, `api` | middleware applied to `routes/web.php` and `routes/api.php` |

## `auth.php`

| Key | Default | Description |
|---|---|---|
| `model` | `App\Models\User` | the authenticatable model |
| `username` | `email` | login column |
| `password` | `password` | password column |
| `login_path` | `/login` | where browsers are sent when unauthenticated |

## `database.php`

`default` (`DB_CONNECTION`) and `connections` for `sqlite`, `mysql`, `pgsql` and `sqlsrv`. Each has `driver`, `host`, `port`,
`database`, `username`, `password`; `mysql` adds `charset`; `sqlsrv` adds `encrypt` and `trust_server_certificate`. Connections
that support splitting also accept `write`, `read`, `sticky`, `read_fallback`, `read_strategy` and `read_only`. See
[Read/write connections](../../database/read-write/).

## `filesystems.php`

`default` (`FILESYSTEM_DISK`) and `disks`: `local` (`storage/app`, private) and `public` (`public/storage`, URL `/storage`).

## `http.php`

| Key | Default | Description |
|---|---|---|
| `timeout` | `10` | seconds, whole request |
| `connect_timeout` | `5` | |
| `max_redirects` | `3` | `0` disables following |
| `user_agent` | `APP_NAME` | |
| `allow_private_networks` | `false` | disable SSRF protection (trusted internal calls only) |

## `logging.php`

`default` and `channels` (`daily`, `single`, `stderr`, `errorlog`, `slack`, `production` stack, `null`, plus your own). See
[Logging](../../basics/logging/).

## `mail.php`

`default` (`MAIL_MAILER`), `from` (`address`, `name`) and `smtp` (`host`, `port`, `encryption`, `username`, `password`, `timeout`).

## `model_cache.php`

`enabled`, `driver`, `ttl`, `recache`, `recache_limit`, `recache_debounce`, `read_from_primary`, `fallback`, `prefix`,
`exclude_tables` (default `migrations`, `jobs`, `failed_jobs`, `sessions`), `flush_on_delete`, `encrypt`. See
[Model caching](../../database/model-caching/).

## `nosql.php`

`default` and `connections` (`file`, `memory`, `mongodb`).

## `queue.php`

| Key | Default | Description |
|---|---|---|
| `default` | `QUEUE_CONNECTION` (`sync`) | |
| `retry_after` | `90` | seconds before a crashed worker's job is released |

## `redis.php`

`host`, `port`, `password`, `database`, `timeout` (2.0 seconds).

## `security.php`

| Key | Description |
|---|---|
| `headers` | override or disable (`null`) default security headers |
| `cors` | `allowed_origins`, `allowed_methods`, `allowed_headers`, `exposed_headers`, `supports_credentials`, `max_age` |
| `jwt` | `secret`, `issuer`, `leeway` (seconds) |

## `session.php`

`driver` (`file`), `cookie` (`naluz_session`), `lifetime` (`7200`), `secure` (automatic), `same_site` (`Lax`).

## `graphql.php`

`schema` (class with `public static function build(): Schema`, or a closure), `max_depth`, `max_nodes`, `max_query_length`,
`introspection`.

## `messaging.php`

Optional event streaming ([guide](../../advanced/event-streaming/)). Needs `naluz/framework` 1.3.0 or later.

| Key | Default | Meaning |
|---|---|---|
| `default` | `memory` (`MESSAGING_CONNECTION`) | `memory`, `redis`, `rabbitmq` or `kafka` |
| `group` | `naluzphp` (`MESSAGING_GROUP`) | consumer group for `messaging:consume` |
| `subscribers` | `[]` | topic or `orders.*` pattern => list of `Subscriber` classes |
| `signing_key` / `previous_signing_keys` | empty | HMAC-SHA256 signing and rotation |
| `max_bytes` | `1048576` | largest accepted message |
| `connections.redis` | | `prefix`, `max_length` (100000), `visibility_timeout` (60 s), `start_id` (`'0'`), optional `host`/`port`/`password` |
| `connections.rabbitmq` | | `host`, `port`, `user`, `password`, `vhost`, `ssl`, `exchange` (`naluz.events`), `prefetch`, `queue_arguments` |
| `connections.kafka` | | `brokers`, `offset_reset` (`earliest`), `options` (raw librdkafka settings) |
