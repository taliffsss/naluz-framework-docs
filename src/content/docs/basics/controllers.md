---
title: "Controllers"
description: "Write controllers as plain classes with dependency injection and return values that become responses."
---

A controller is any callable, or a `[Class::class, 'method']` pair. There is no base class to extend.

```bash
php naluz make:controller PostController
```

```php title="app/Http/Controllers/PostController.php"
namespace App\Http\Controllers;

use App\Models\Post;

final class PostController
{
    public function index(): array
    {
        return Post::published()->latest()->get()->toArray();
    }

    public function show(int $post): Post
    {
        return Post::findOrFail($post);
    }
}
```

```php title="routes/api.php"
$router->get('/posts', [PostController::class, 'index']);
$router->get('/posts/{post}', [PostController::class, 'show']);
```

## Dependency injection

The service container resolves the controller and injects arguments by **type**. Route parameters are injected by **name**:

```php
public function show(ServerRequestInterface $request, UserRepository $users, int $id): User
```

- Classes (and interfaces that are bound) are resolved from the [container](../../advanced/container/).
- Route parameters are strings in the URL. They are cast to the declared scalar type (`int`, `float`, `bool`). A value that
  is not a valid number for an `int` or `float` parameter returns **404**.
- Parameters with defaults or nullable types are optional.
- Constructor injection works the same way.

```php
final class PostController
{
    public function __construct(private readonly Naluz\Database\DatabaseManager $db) {}
}
```

## Return values

| Return | Response |
|---|---|
| `Psr\Http\Message\ResponseInterface` | used as is |
| `array`, or any `JsonSerializable` (models, collections, paginators) | JSON, status 200 |
| `string`, `Stringable` or scalar | HTML, status 200 |
| `null` | `204 No Content` |

Anything else throws a `LogicException`.

```php
public function store(ServerRequestInterface $request): Response
{
    return Response::json(Post::create($data), 201);
}

public function destroy(int $post): Response
{
    Post::findOrFail($post)->delete();
    return Response::noContent();
}
```

## Resource controllers

`$router->apiResource('posts', PostController::class)` expects `index`, `store`, `show`, `update` and `destroy` methods.
`$router->resource(...)` also expects `create` and `edit`. See [Routing](../routing/#resource-routes).

## Failing

Throw `Naluz\Http\HttpException` to stop with a specific status:

```php
use Naluz\Http\HttpException;

throw new HttpException(403, 'You cannot edit this post.');
throw new HttpException(401, 'Unauthenticated.', ['WWW-Authenticate' => 'Bearer']);
```

`Model::findOrFail()` throws a `ModelNotFoundException`, which is rendered as a 404. See [Error handling](../errors/).
