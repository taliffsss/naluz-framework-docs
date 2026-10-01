---
title: "Performance"
description: "Compiled templates, route and model caching, eager loading, Redis and OPcache."
---

| Feature | How |
|---|---|
| Compiled templates | `*.naluz.php` becomes plain PHP, cached in `storage/cache/views`. Production never re-checks sources, so run `view:clear` on deploy |
| Route cache | `php naluz route:cache` writes `storage/cache/routes.php` and boot skips `routes/*.php` entirely. Ignored while `APP_DEBUG=true`. Closures cannot be cached, so use controller routes (the command lists offenders). `route:clear` removes it |
| Eager loading | `with()` runs one query per relation. The **lazy-load guard** turns accidental N+1 into an exception in `local` and `testing` (`PREVENT_LAZY_LOADING=true\|false` overrides) |
| Model cache | `MODEL_CACHING=true` (`MODEL_CACHE_DRIVER=redis\|local`) caches every ORM query for 5 minutes, invalidates on writes and re-caches after changes. See [Model caching](../../database/model-caching/) |
| Redis | `CACHE_DRIVER=redis`, `SESSION_DRIVER=redis`, `QUEUE_CONNECTION=redis`. A dependency-free client; `REDIS_HOST/PORT/PASSWORD/DB` |
| Read replicas | send reads to replicas. See [Read/write connections](../../database/read-write/) |
| Query helpers | `chunk()` and `cursor()` for big tables, `paginate()` capped at 1000 per page, bulk `insert()` and `upsert()` |
| OPcache | `composer install --no-dev -o`; enable `opcache.validate_timestamps=0` in production and reload PHP-FPM on deploy |

## Finding slow spots

```php
$sql = $this->queries(fn () => …);          // in tests: count and inspect statements
$db->listen(fn (string $sql) => logger($sql));  // log every statement in development
```

The lazy-loading guard catches N+1 queries during development, and the `queries()` test helper lets you assert a query budget.

## Deploy sequence

```bash
composer install --no-dev -o
php naluz migrate
php naluz route:cache && php naluz view:clear
```
