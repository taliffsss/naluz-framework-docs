---
title: "Error Handling"
description: "How exceptions become responses, what is logged, and how to customize error pages."
---

Every uncaught exception in a request is converted into a response by `Naluz\Foundation\ExceptionHandler`. Internals are only
exposed when `APP_DEBUG=true`.

## What clients see

| Situation | JSON / API clients | Browsers |
|---|---|---|
| `HttpException` (404, 403, 401 …) | `{"message": "…"}` with the status | an HTML error page |
| `ModelNotFoundException` | `404` | 404 page |
| `ValidationException` | `422` `{message, errors}` | `303` redirect back with flashed `errors` and `old` |
| any other exception | `500` `{"message": "Server Error"}` | 500 page |

With `APP_DEBUG=true`, 5xx responses also include the exception class, file, line and the first trace frames. **Never
enable debug in production.**

A request is treated as expecting JSON when it has `Accept: …json`, a JSON body, a path under `/api`, or
`X-Requested-With: XMLHttpRequest`.

## Throwing HTTP errors

```php
use Naluz\Http\HttpException;

throw new HttpException(404, 'No such invoice.');
throw new HttpException(429, 'Slow down.', ['Retry-After' => '30']);
```

The message of an `HttpException` is shown to the client, so never put secrets in it.

## Custom error pages

Create `resources/views/errors/{status}.naluz.php`, for example `404.naluz.php` or `500.naluz.php`. The view receives `$status` and
`$message`. In debug mode for a 5xx error the detailed page is shown instead.

## What gets logged

| Situation | Behavior |
|---|---|
| Exception in a controller or middleware | rendered as above; **5xx are logged** with the exception |
| 4xx (HTTP errors, validation, 404) | rendered, **not** logged: they are normal |
| PHP warning or notice | converted by `ErrorHandler` into an `ErrorException`, so it is handled like any exception. `@` and `error_reporting` are respected |
| PHP deprecation | logged at `warning`, execution continues |
| Uncaught exception outside a request (CLI, queue worker) | logged at `critical`; the CLI prints a short message (full trace only in debug) |
| Fatal error (out of memory, parse error) | logged at `critical` from a shutdown handler |
| Failed queue job after its last retry | logged, stored in `failed_jobs`, `Job::failed()` is called |
| Failed scheduled task | logged and reported by `schedule:run`; other tasks still run |

`public/index.php` (through `Application::run()`) and the `naluz` CLI register the `ErrorHandler` for you.

## If logging itself fails

A log must never take the application down and must never lose a message silently. If `storage/logs` is missing or unwritable,
the file logger falls back to PHP's own `error_log()`, which is the web server or php-fpm log. `ErrorHandler` does the same if the
PSR-3 logger throws. In containers, send logs to `stderr` (see [Logging](../logging/)).

## Reporting unexpected errors elsewhere

Send critical errors to Slack with the `slack` channel, or plug in Sentry through a custom PSR-3 channel. See [Logging](../logging/).
