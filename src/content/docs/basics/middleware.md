---
title: "Middleware"
description: "Filter requests with PSR-15 middleware, configure global and route middleware, and write your own."
---

Middleware wraps the request pipeline. NaluzPHP middleware are standard **PSR-15** `MiddlewareInterface`
implementations, so any PSR-15 middleware from Packagist can be used.

## The pipeline

```text
SecurityHeaders → Cors → MethodOverride            (global, config/app.php)
  → route group middleware (web: session, csrf | api: throttle)
    → route middleware
      → controller
```

## Built-in middleware

| Class | Alias | Purpose |
|---|---|---|
| `SecurityHeaders` | (global) | adds the default security headers, including a restrictive CSP |
| `Cors` | (global) | cross-origin rules from `security.cors`; disabled until you list origins |
| `MethodOverride` | (global) | `_method` field for `PUT`/`PATCH`/`DELETE` from forms |
| `StartSession` | `session` | starts the session and saves it after the response |
| `VerifyCsrfToken` | `csrf` | checks the CSRF token and `Origin` on unsafe methods |
| `Throttle` | `throttle` | fixed-window rate limiting |
| `Authenticate` | `auth` | session auth guard |
| `AuthenticateJwt` | `jwt` | bearer-token guard |

The skeleton also ships `App\Http\Middleware\OptionalJwt` (alias `jwt.optional`), which identifies the caller when a valid
token is present but lets anonymous requests through.

## Using middleware

```php
$router->get('/me', $handler)->middleware('jwt');
$router->post('/login', $handler)->middleware('throttle:5,1');       // 5 requests per 1 minute
$router->prefix('admin')->middleware(['auth', 'admin'])->group(function ($router) { … });
```

Anything after the colon is passed to the middleware constructor as `array $parameters = []` (here `['5', '1']`).

## Writing middleware

```bash
php naluz make:middleware EnsureAdmin
```

```php title="app/Http/Middleware/EnsureAdmin.php"
namespace App\Http\Middleware;

use Naluz\Auth\Auth;
use Naluz\Http\HttpException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

final class EnsureAdmin implements MiddlewareInterface
{
    public function __construct(private readonly Auth $auth) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        if (!$this->auth->user()?->is_admin) {
            throw new HttpException(403, 'Admins only.');
        }
        return $handler->handle($request);
    }
}
```

Register an alias in `config/app.php`:

```php
'middleware_aliases' => [
    // …
    'admin' => App\Http\Middleware\EnsureAdmin::class,
],
```

Then use it: `->middleware('admin')`. Middleware are resolved from the container, so constructor dependencies are injected.

To change the work done *after* the controller, modify the response returned by `$handler->handle($request)`.

## Global middleware and groups

`config/app.php` controls what runs where:

```php
'middleware' => [                       // every request, outermost first
    Middleware\SecurityHeaders::class,
    Middleware\Cors::class,
    Middleware\MethodOverride::class,
],
'middleware_groups' => [
    'web' => ['session', 'csrf'],       // routes/web.php
    'api' => ['throttle:60,1'],         // routes/api.php
],
```

:::danger
Do not put cookie-session authentication on `api` routes. They are cookie-less and have no CSRF protection by design; use
bearer tokens there.
:::

## Rate limiting

`throttle:60,1` allows 60 requests per minute per client IP and path. Responses carry `X-RateLimit-Limit` and
`X-RateLimit-Remaining`; over the limit returns `429` with `Retry-After`. The counter lives in the application cache, so use
Redis when you run several servers. The window is fixed, so it is slightly bursty at window edges. Apply a tight limit to login
and password-reset routes.
