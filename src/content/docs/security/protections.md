---
title: "Security Protections"
description: "CSRF, security headers, CORS, rate limiting, safe redirects and other built-in protections in detail."
---

## SQL injection

Every value is a bound parameter. Identifiers and operators are validated. See
[Query builder](../../database/query-builder/#sql-injection-safety).

## CSRF

All `web` routes use the `VerifyCsrfToken` middleware. Unsafe methods (`POST`, `PUT`, `PATCH`, `DELETE`) need a token in the
`_token` form field or an `X-CSRF-TOKEN` header equal to the session token. If the request carries an `Origin` header it must match the host.
A failure returns `419`.

In templates:

```blade
<form method="POST" action="/posts">@csrf …</form>
```

or `csrf_field()` and `csrf_token()` in PHP. API routes are cookie-less and use bearer tokens instead.

## Security headers

The global `SecurityHeaders` middleware sets these on every response:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- a restrictive `Content-Security-Policy` (it forbids inline scripts and styles; loosen it deliberately)
- HSTS when the request is HTTPS

Override or disable any header in `config/security.php`:

```php
'headers' => [
    'Content-Security-Policy' => "default-src 'self'; img-src 'self' data:",
    'X-Frame-Options' => null,        // null disables a default header
],
```

## CORS

Cross-origin requests are refused until you allow origins:

```php title="config/security.php"
'cors' => [
    'allowed_origins' => ['https://app.example.com'],     // empty disables CORS
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
    'exposed_headers' => [],
    'supports_credentials' => false,
    'max_age' => 600,
],
```

## Rate limiting

`->middleware('throttle:5,1')` allows 5 requests per minute per IP and path. See [Middleware](../../basics/middleware/#rate-limiting).

## Mass assignment

A model accepts nothing until `$fillable` lists the fields. `forceFill()` bypasses it and must never be fed raw request data.

## Open redirects

`Response::redirect()` rejects CR/LF, and validation redirects only go back to a path on the same host.

## Uploads

Files are checked by content and stored under random names. See [File storage](../../advanced/storage/).

## Outbound requests

The HTTP client refuses private and loopback addresses on every hop. See [HTTP client](../../advanced/http-client/).

## Reverse proxies

`REMOTE_ADDR` is the proxy's address behind a reverse proxy. Configure your web server to restore the real client IP rather
than trusting `X-Forwarded-For`. This matters for rate limiting and logs.
