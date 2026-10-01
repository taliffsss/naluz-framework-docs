---
title: "Cache"
description: "PSR-16 and PSR-6 caching with file, array and Redis drivers."
---

The application cache implements **PSR-16** (`Psr\SimpleCache\CacheInterface`). A **PSR-6** pool
(`Psr\Cache\CacheItemPoolInterface`) is bound as an adapter over the same store.

## Usage

```php
use Psr\SimpleCache\CacheInterface;

$cache = app(CacheInterface::class);

$cache->set('report', $data, 300);             // seconds, or a DateInterval
$report = $cache->get('report');               // null when missing
$cache->get('report', 'default');
$cache->has('report');
$cache->delete('report');
$cache->clear();

$cache->setMultiple(['a' => 1, 'b' => 2], 60);
$cache->getMultiple(['a', 'b']);
```

Inject `Psr\SimpleCache\CacheInterface` instead of using helpers where you can.

:::note
PSR-16 keys may not contain `{ } ( ) / \ @ :`. Use underscores or dots as separators.
:::

## Drivers

Choose with `CACHE_DRIVER`:

| Driver | Storage | Notes |
|---|---|---|
| `file` (default) | `storage/cache/data` | single server. Expired entries are removed when read, or by `FileCache::prune()` |
| `array` | memory, per process | tests |
| `redis` | Redis | shared across servers. Uses the framework's own client (`REDIS_*` settings) |

Values read back are never allowed to instantiate objects (`allowed_classes => false`), so a tampered cache file or Redis value
cannot inject objects.

## Redis

```ini
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

No PHP extension is needed. Redis commands use length-prefixed arguments, so values cannot inject commands.

## Atomic counters

The array, file and Redis caches implement `Naluz\Cache\Incrementable`, which the [rate limiter](../../basics/middleware/#rate-limiting)
and the scheduler's overlap locks use. With several servers use Redis so those counters and locks are shared.

## PSR-6

```php
use Psr\Cache\CacheItemPoolInterface;

$pool = app(CacheItemPoolInterface::class);
$item = $pool->getItem('key');
if (!$item->isHit()) {
    $item->set($value)->expiresAfter(300);
    $pool->save($item);
}
```

## Caching model queries automatically

See [Model caching](../../database/model-caching/).
