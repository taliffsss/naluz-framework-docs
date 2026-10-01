---
title: "Authorization"
description: "Deciding who may do what. NaluzPHP does not include a Gate or policies, so this page shows the supported patterns."
---

Authentication answers "who are you?". Authorization answers "may you do this?". NaluzPHP provides authentication but **does
not include a Gate, policy classes or roles**. Authorization is plain PHP in middleware, controllers and resolvers. That keeps
the checks explicit and easy to audit.

:::note
Not having a built-in policy layer is a deliberate scope limit. If you want one, wrap your rules in a small class and register
it in a [service provider](../../advanced/providers/).
:::

## Pattern 1: middleware for whole route groups

```php title="app/Http/Middleware/EnsureAdmin.php"
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

```php
$router->prefix('admin')->middleware(['auth', 'admin'])->group(function ($router) { … });
```

## Pattern 2: ownership checks in the controller

```php
public function update(ServerRequestInterface $request, int $post): Post
{
    $model = Post::findOrFail($post);

    if ((int) $model->user_id !== (int) $request->getAttribute('auth.id')) {
        throw new HttpException(403, 'You can only edit your own posts.');
    }
    // …
}
```

Better still, scope the query so a record the user may not touch simply does not exist for them:

```php
$post = Post::where('user_id', $userId)->findOrFail($id);     // 404 for other people's posts
```

## Pattern 3: a reusable policy class

```php
final class PostPolicy
{
    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->is_admin;
    }
}

// in a controller
if (!app(PostPolicy::class)->update($user, $post)) {
    throw new HttpException(403);
}
```

Resolve it from the [container](../../advanced/container/) so it can use injected dependencies.

## Authorization in GraphQL

Resolvers receive the PSR-7 request as `$context`. Check `auth.id` there and throw a `GraphQLError` with a code such as
`UNAUTHENTICATED` or `FORBIDDEN`. See the [GraphQL page](../../advanced/graphql/).

## Checklist

- Authorize on **every** write path, not only in the UI.
- Prefer scoping queries to the current user over checking after loading.
- Return `403` for "you may not" and `404` when the existence of the record should not be revealed.
- Never trust identifiers in the request body for ownership (take the user from the token or session).
