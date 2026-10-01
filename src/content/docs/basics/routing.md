---
title: "Routing"
description: "Define routes, parameters, groups and REST resources, and generate URLs."
---

NaluzPHP speaks PSR-7 and PSR-15 natively: requests are plain `Psr\Http\Message\ServerRequestInterface` objects and
middleware are standard PSR-15 `MiddlewareInterface` implementations, so third-party middleware just works.

## Route files

| File | Wrapped in | Notes |
|---|---|---|
| `routes/web.php` | the `web` group: sessions and CSRF | browser routes |
| `routes/api.php` | the `api` group: rate limiting | prefixed with `/api`, named `api.*`, stateless (no cookies, no CSRF) |

The groups are defined in `config/app.php` under `middleware_groups`. Inside a route file the router is available as `$router`.

## Basic routes

```php title="routes/web.php"
$router->get('/', fn () => view('home'));
$router->post('/contact', [ContactController::class, 'send']);
$router->match(['GET', 'POST'], '/multi', $handler);
$router->any('/ping', $handler);
```

An action is a closure, or `[Controller::class, 'method']`. Available verbs: `get` (also answers `HEAD`), `post`, `put`,
`patch`, `delete`, `options`, `any` and `match`.

An unknown path returns `404`. A known path with another method returns `405` with an `Allow` header.

## Route parameters

```php
$router->get('/users/{id}', [UserController::class, 'show'])->where('id', '[0-9]+');
$router->get('/posts/{slug:[a-z0-9-]+}', …);          // inline pattern
$router->get('/archive/{year?}', fn (?int $year = null) => …);   // optional
```

Parameters are passed to the action by name. Scalar type hints (`int $id`) are honored. See [Controllers](../controllers/).

## Named routes and URLs

```php
$router->get('/users/{id}', …)->name('users.show');

route('users.show', ['id' => 5]);            // /users/5
route('users.show', ['id' => 5, 'q' => 1]);  // /users/5?q=1
route('users.show', ['id' => 5], absolute: true);
```

## Groups

```php
$router->prefix('admin')->name('admin.')->middleware('auth')->group(function ($router) {
    $router->get('/dashboard', …)->name('dashboard');    // /admin/dashboard, admin.dashboard
});

// the same with an array
$router->group(['prefix' => 'admin', 'middleware' => ['auth'], 'name' => 'admin.'], function ($router) { … });
```

## Resource routes

```php
$router->resource('photos', PhotoController::class);
$router->resource('photos', PhotoController::class, only: ['index', 'show']);
$router->apiResource('photos', PhotoController::class);   // no create / edit
```

| Verb | URI | Method | Name |
|---|---|---|---|
| GET | `/photos` | `index` | `photos.index` |
| GET | `/photos/create` | `create` | `photos.create` (not in `apiResource`) |
| POST | `/photos` | `store` | `photos.store` |
| GET | `/photos/{photo}` | `show` | `photos.show` |
| GET | `/photos/{photo}/edit` | `edit` | `photos.edit` (not in `apiResource`) |
| PUT / PATCH | `/photos/{photo}` | `update` | `photos.update` |
| DELETE | `/photos/{photo}` | `destroy` | `photos.destroy` |

## Form method spoofing

HTML forms only send `GET` and `POST`. Send `PUT`, `PATCH` or `DELETE` with a hidden field. In templates use `@method('PUT')`:

```html
<form method="POST" action="/posts/1">
  <input type="hidden" name="_method" value="DELETE">
</form>
```

The global `MethodOverride` middleware accepts only `PUT`, `PATCH` and `DELETE`.

## Middleware on routes

```php
$router->get('/me', $handler)->middleware('jwt');
$router->post('/login', $handler)->middleware('throttle:5,1');
```

See [Middleware](../middleware/).

## Inspecting and caching routes

```bash
php naluz route:list      # every registered route
php naluz route:cache     # compile the table for faster boots
php naluz route:clear
```

The route cache only supports controller routes (`[Class::class, 'method']` and `Class::class`), because closures cannot
be cached. The command lists any offending routes. It is ignored while `APP_DEBUG=true`. See [Performance](../../tooling/performance/).
