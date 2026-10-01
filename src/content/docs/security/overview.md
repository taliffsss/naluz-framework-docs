---
title: "Security Overview"
description: "What NaluzPHP protects automatically, what you must still do yourself, and how to report vulnerabilities."
---

NaluzPHP aims for "secure unless you opt out". This page lists what is automatic and what remains your responsibility. The
following pages go deeper: [Authentication](../authentication/), [Authorization](../authorization/),
[Encryption and hashing](../encryption/) and [Protections](../protections/).

## Automatic protections

| Area | What the framework does |
|---|---|
| SQL injection | Real prepared statements. Identifiers, operators and sort directions are validated; raw SQL is opt-in. |
| Mass assignment | A model accepts nothing until `$fillable` lists the fields. `validate()` returns only fields that have rules. |
| XSS | `{{ }}` in templates always escapes. View names cannot traverse the filesystem. |
| CSRF | All `web` routes verify a token and the `Origin` header on unsafe methods. |
| Sessions | 160-bit IDs, `HttpOnly` and `SameSite=Lax` cookie, no fixation, JSON storage. |
| Headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, a restrictive CSP and HSTS over HTTPS. |
| Passwords | Argon2id (bcrypt if unavailable), automatic rehash, constant-time-style login that does not reveal which emails exist. |
| Encryption | XChaCha20-Poly1305 with key rotation. |
| JWT | HS256 only, algorithm pinned, signature compared with `hash_equals`, `exp` required. |
| Rate limiting | `throttle` middleware, 60 requests per minute on the `api` group by default. |
| CORS | Disabled until you list allowed origins. |
| Errors | With `APP_DEBUG=false` clients only see generic messages. Details go to the log, with newlines neutralized. |
| Queues | Payloads are encrypted JSON, never `unserialize()`d. |
| Mail | CR/LF/NUL and malformed addresses are rejected before sending. TLS certificates are verified. |
| Uploads | Type detected from content, mandatory allow-list, random names, root-confined paths. |
| HTTP client | SSRF protection on every hop, credentials stripped on cross-origin redirects. |
| Redis | Arguments are length-prefixed (no command injection). Cached values are read without object instantiation. |
| Polymorphic relations | The `_type` column must resolve to a `Model` subclass. Use a morph map. |
| GraphQL | Depth and size limits, schema validation before execution, masked internal errors, introspection off in production. |

## Your responsibility

- **Authorize** every action on a record (who may edit *this* one). Authentication is provided; there is no Gate or policy
  layer, so write checks in controllers or middleware. See [Authorization](../authorization/).
- **Allow-list** sortable and filterable columns taken from user input.
- **Output**: use `{{ }}` and avoid `{!! !!}` for anything user-controlled.
- **Uploads**: serve them from a domain or path that never executes PHP; scan documents if you accept them from untrusted users.
- **Transport**: serve over HTTPS and keep `.env` out of the web root (the default layout serves only `public/`).
- **Proxies**: set the real client IP at your web server and only trust forwarded headers from your proxy.
- **Dependencies**: keep Composer packages updated.
- **Secrets**: never commit `.env`; rotate `APP_KEY` and `JWT_SECRET` if they leak.

## Reporting vulnerabilities

Please report vulnerabilities **privately** to the maintainer (anthony.naluz15@gmail.com) rather than opening a public issue.
Do not include exploit details in public issues or pull requests.
