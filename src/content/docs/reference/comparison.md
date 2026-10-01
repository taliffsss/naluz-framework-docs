---
title: "Compared with Laravel"
description: "An honest comparison with Laravel: where NaluzPHP is stricter by default, and what it does not have."
---

Laravel is the benchmark for developer experience, so naming and ergonomics are deliberately similar (`Model::with()`,
`$router->apiResource()`, `php naluz migrate`, `Job::dispatch()`). NaluzPHP does **not** claim to be feature-for-feature "more
advanced": Laravel has far more features and a vast ecosystem. What NaluzPHP offers is a much smaller, auditable codebase with
stricter defaults.

## Where NaluzPHP is stricter or different

| | NaluzPHP | Laravel |
|---|---|---|
| Size and dependencies | small core; three runtime packages (`nyholm/psr7`, `nyholm/psr7-server`, `guzzlehttp/guzzle`) plus PSR interfaces; own Redis client, mailer, template engine and GraphQL server | many packages |
| HTTP layer | PSR-7 / PSR-15 end to end, so any PSR-15 middleware drops in | Symfony HttpFoundation (PSR-7 through a bridge) |
| Query-builder identifiers | validated: non-identifiers throw, so user-controlled column names cannot inject | quoted but not validated |
| Debug output | `APP_DEBUG` defaults to `false` | configured per project |
| Queue payloads | encrypted JSON; the class must extend `Job`; no `unserialize` | PHP-serialized; encryption is opt-in per job |
| Uploads | content-sniffed, **mandatory** allow-list, random names | validation rules are opt-in |
| Security headers / CSP, CORS allow-list, CSRF `Origin` check | on by default | opt-in or packages |
| Lazy-load (N+1) guard | on by default in `local` and `testing` | available; you enable it |
| Polymorphic `_type` column | must resolve to a `Model` subclass (with a morph map) | class name stored; morph map optional |
| GraphQL | built in, with depth and size limits | a package |

## What NaluzPHP does not have

- **Authorization:** no Gate, policies or roles. See [Authorization](../../security/authorization/).
- **Queues:** no batches, chains, unique jobs, rate limiting, SQS or Beanstalk drivers, or dashboard (sync, database and Redis only).
- **Mail:** SMTP, log and array transports; no SES, Mailgun or Postmark drivers, Markdown mailables or notifications.
- **Storage:** local disks only; implement `Filesystem` for S3 or other cloud disks.
- **Scheduler:** no per-task timezones, background runs or maintenance-mode awareness.
- **ORM:** no `morphToMany`, pivot models, global scopes, `withCount` / `whereHas`, custom cast classes or API resources.
- **Templates:** layouts, sections, stacks and includes; no components or slots (`<x-…>`).
- **Route cache:** controller routes only (closures cannot be cached).
- **GraphQL:** no subscriptions, interfaces, unions, SDL schemas or persisted queries.
- **Everything else:** broadcasting, cache tags and locks, first-party auth packages (Sanctum, Passport, Socialite, Cashier), Telescope,
  Livewire / Inertia, `tinker`, localization, testing assertions such as `assertJson`, and the community ecosystem.

## Choosing

Pick NaluzPHP when you want a small, readable framework with strong defaults for APIs and monoliths, and you are happy to write
a little more yourself. Pick Laravel when you need its ecosystem and breadth.
