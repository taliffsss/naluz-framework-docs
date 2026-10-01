---
title: "Guide: Add a GraphQL API"
description: "Expose your models over GraphQL with queries, mutations, authentication and safe limits."
---

The skeleton ships a working GraphQL schema for posts and users at `POST /api/graphql`. This guide walks through it and shows how to
add your own types. Reference material is on the [GraphQL page](../../advanced/graphql/).

## 1. Try the sample

```bash
php naluz run:server --port=8001

curl -s localhost:8001/api/graphql -H 'Content-Type: application/json' \
  -d '{"query":"{ posts(first: 5) { id title author { name } } }"}'
```

Introspection is off unless `APP_DEBUG=true` (or `GRAPHQL_INTROSPECTION=true`), so GraphiQL-style tools need that while developing.

## 2. How the sample is built

`config/graphql.php` points to a schema class:

```php
'schema' => App\GraphQL\AppSchema::class,
```

which has a static `build()` method returning a `Schema`. The route is in `routes/api.php`:

```php
$router->match(['GET', 'POST'], '/graphql', [GraphQLController::class, 'handle'])
    ->name('graphql')->middleware('jwt.optional');
```

`jwt.optional` identifies the caller when a valid token is sent, and lets anonymous requests through. Resolvers decide what needs login.

## 3. Add a type and a query

```php
$article = new ObjectType('Article', [
    'id'    => Types::nonNull(Types::id()),
    'title' => Types::nonNull(Types::string()),
    'body'  => Types::string(),
]);

$query = new ObjectType('Query', [
    'articles' => [
        'type' => Types::nonNull(Types::listOf(Types::nonNull($article))),
        'args' => ['first' => ['type' => Types::int(), 'default' => 10]],
        'resolve' => fn ($root, array $args) => Article::published()->latest()
            ->paginate(max(1, min(50, (int) $args['first'])), 1)->items,
    ],
]);

return new Schema($query);
```

Always clamp list sizes (`min(50, …)`): GraphQL's node limit counts the fields in the query, not the rows a resolver returns.

## 4. Mutations that need a user

```php
'createArticle' => [
    'type' => Types::nonNull($article),
    'args' => ['input' => Types::nonNull($articleInput)],
    'resolve' => function ($root, array $args, ServerRequestInterface $request) {
        $userId = $request->getAttribute('auth.id')
            ?? throw new GraphQLError('Authentication required.', ['code' => 'UNAUTHENTICATED']);

        $data = Validator::make($args['input'], ['title' => 'required|string|max:200', 'body' => 'required|string'])->validate();

        $article = new Article($data);
        $article->user_id = (int) $userId;       // the caller, never a client-supplied id
        $article->save();

        return $article;
    },
],
```

Validation errors reach the client as `VALIDATION_FAILED` with the messages in `extensions.validation`.

## 5. Avoid N+1 queries

```php
'resolve' => function ($root, array $args, $context, ResolveInfo $info) {
    $query = Article::published()->latest();
    if (in_array('author', $info->subfields(), true)) {
        $query->with('author');
    }
    return $query->paginate(10, 1)->items;
},
```

With the lazy-loading guard on in development, a missing `with()` fails loudly instead of silently running a query per row.

## 6. Test it

```php
$response = $this->json('POST', '/api/graphql', ['query' => '{ articles { title } }']);
$this->assertSame(200, $response->getStatusCode());
$this->assertArrayNotHasKey('errors', $this->decode($response));
```

See `tests/GraphQL/EndpointTest.php` in the skeleton for authentication, validation, masking and limit tests.
