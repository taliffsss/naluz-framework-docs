---
title: "Helpers and Utilities"
description: "Global helper functions and the Str, Arr, Collection and Env utilities."
---

## Global helpers

| Helper | Purpose |
|---|---|
| `env($key, $default = null)` | read an environment variable (`true`, `false`, `null`, `empty` are converted) |
| `config($key = null, $default = null)` | read configuration with dot notation |
| `app($abstract = null)` | the application, or resolve a class from the container |
| `base_path($path = '')` | absolute path inside the project |
| `storage_path($path = '')` | absolute path inside `storage/` |
| `e($value)` | HTML-escape (UTF-8) |
| `response($body = '', $status = 200, $headers = [])` | an HTML response |
| `json($data, $status = 200, $headers = [])` | a JSON response |
| `redirect($to, $status = 302)` | a redirect response |
| `view($name, $data = [], $status = 200)` | render a template into a response |
| `route($name, $params = [], $absolute = false)` | generate a URL for a named route |
| `csrf_token()` / `csrf_field()` | the session token / a hidden input |
| `method_field($method)` | hidden `_method` input |
| `json_for_html($value)` | JSON that is safe inside HTML and `<script>` |
| `now()` | the current time as a `DateTimeImmutable` (uses the PSR-20 clock and `app.timezone`) |
| `logger($message = null, $context = [])` | the logger, or log an `info` message |
| `storage($disk = null)` | a storage disk |
| `dispatch($job)` | dispatch a queued job |
| `http()` | the HTTP client |
| `nosql($connection = null)` | a document store |
| `collect($items = [])` | a `Collection` |

## `Naluz\Support\Str`

`snake()`, `studly()`, `camel()`, `slug($value, $separator = '-')`, `plural()`, `singular()`, `random($length = 32)`,
`classBasename()`.

```php
Str::slug('Hello World');     // hello-world
Str::studly('user_profile');  // UserProfile
```

## `Naluz\Support\Arr`

Dot-notation helpers for arrays: `get()`, `has()`, `set()`, `forget()`, `only()`, `except()`, `isList()`.

## `Naluz\Support\Collection`

An array wrapper returned by queries. It is iterable, countable, array-accessible and JSON-serializable.

| Group | Methods |
|---|---|
| Transform | `map`, `filter`, `each`, `values`, `keys`, `pluck`, `keyBy`, `groupBy`, `sortBy`, `unique`, `merge`, `push` |
| Read | `all`, `toArray`, `first`, `last`, `contains`, `isEmpty`, `isNotEmpty`, `count`, `sum` |

```php
Post::all()->pluck('title');
Post::all()->groupBy('user_id');
collect([3, 1, 2])->sortBy(fn ($n) => $n)->values()->all();
```

## `Naluz\Support\Env`

The `.env` loader behind `env()`. `Env::get()`, `Env::set()` (explicit values win), `Env::load()` and `Env::parse()`.

## `Naluz\Support\Fake`

A small data generator for factories (names, emails, words, sentences, UUIDs, dates, numbers). `Fake::seed(42)` makes the output
reproducible. See [Factories and seeders](../../database/factories-seeders/).

## Clocks

`SystemClock` and `FrozenClock` implement PSR-20, so time-dependent code is easy to test.
