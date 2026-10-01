---
title: "PSR Compliance"
description: "Which PHP-FIG standards NaluzPHP implements and where."
---

Each row is covered by a test (`tests/Unit/PsrComplianceTest.php`) and the coding standard is enforced by `phpcs` in CI.

| PSR | Standard | Where |
|---|---|---|
| 1 | Basic Coding Standard | enforced with `phpcs` (part of the PSR-12 ruleset) |
| 3 | Logger | `Log\FileLogger` and the channel loggers; the container serves `LoggerInterface` |
| 4 | Autoloading | `Naluz\` → `src/`, `App\` → `app/`, `Database\Factories\` and `Database\Seeders\` |
| 6 | Caching Interface | `Cache\Psr6\CacheItemPool`, an adapter over any PSR-16 cache |
| 7 | HTTP Message | via `nyholm/psr7`. `Naluz\Http\Response` extends the Nyholm response |
| 11 | Container | `Container\Container` with autowiring, singletons, aliases and method injection |
| 12 | Extended Coding Style | enforced with `phpcs`; the 120-character line length is a soft limit |
| 13 | Hypermedia Links | `Http\Link`, `Http\LinkProvider`, `Paginator::links()` |
| 14 | Event Dispatcher | `Events\Dispatcher` is both dispatcher and listener provider; stoppable events supported |
| 15 | HTTP Handlers / Middleware | the router is a `RequestHandlerInterface`; every built-in middleware is a `MiddlewareInterface` |
| 16 | Simple Cache | `Cache\FileCache`, `ArrayCache`, `Redis\RedisCache` |
| 17 | HTTP Factories | `Psr17Factory` is bound for requests, responses, streams, URIs and uploaded files |
| 18 | HTTP Client | Guzzle, wrapped by `Http\Client\Http` with safe redirects and SSRF protection |
| 20 | Clock | `Support\SystemClock`, `FrozenClock` |

PSR-2, 5, 8, 9, 10, 19 and 21 are abandoned, drafts or withdrawn and are not applicable.

Because the standards are interfaces, you can replace implementations (for example a Monolog logger or a Symfony cache) by
binding them in a [service provider](../../advanced/providers/).
