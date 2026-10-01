---
title: "Guide: Build a REST API"
description: "Build a complete, authenticated JSON API for articles with validation, pagination and tests."
---

In this guide you build an `articles` API with validation, pagination, authenticated writes and tests. It uses the pieces from
the rest of the documentation. Start from a fresh [installation](../../prologue/installation/).

## 1. The table and model

```bash
php naluz make:migration create_articles_table
php naluz make:model Article
```

```php title="database/migrations/…_create_articles_table.php"
return new class extends Migration {
    public function up(Schema $schema): void
    {
        $schema->create('articles', function ($t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('title', 200);
            $t->text('body');
            $t->boolean('published')->default(false);
            $t->timestamps();
            $t->index(['published', 'created_at']);
        });
    }

    public function down(Schema $schema): void
    {
        $schema->dropIfExists('articles');
    }
};
```

```php title="app/Models/Article.php"
class Article extends \Naluz\Database\Orm\Model
{
    protected array $fillable = ['title', 'body', 'published'];
    protected array $casts = ['published' => 'bool'];

    public function author(): \Naluz\Database\Orm\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopePublished(\Naluz\Database\Orm\Builder $query): void
    {
        $query->where('published', true);
    }
}
```

Note that `user_id` is **not** fillable, so a client cannot choose the author. The controller sets it from the token.

:::caution
The `author` relation serializes the whole `User` model. Hide private columns on the model (for example
`protected array $hidden = ['password', 'email'];`) or the list endpoint will expose every author's email address.
:::

## 2. Authentication

Mint a token for a user (for example from a login endpoint you write with `Auth` or your own credentials check):

```php
$token = app(Naluz\Security\Jwt::class)->encode(['sub' => $user->id], ttl: 3600);
```

Clients send it as `Authorization: Bearer <token>`. See [Authentication](../../security/authentication/).

## 3. The controller

```php title="app/Http/Controllers/Api/ArticleController.php"
namespace App\Http\Controllers\Api;

use App\Models\Article;
use Naluz\Database\Paginator;
use Naluz\Http\HttpException;
use Naluz\Http\Request;
use Naluz\Http\Response;
use Naluz\Validation\Validator;
use Psr\Http\Message\ServerRequestInterface;

final class ArticleController
{
    public function index(ServerRequestInterface $request): Paginator
    {
        $q = $request->getQueryParams();

        return Article::published()->with('author')->latest()
            ->paginate((int) ($q['per_page'] ?? 15), (int) ($q['page'] ?? 1));
    }

    public function show(int $article): Article
    {
        return Article::published()->with('author')->findOrFail($article);
    }

    public function store(ServerRequestInterface $request): Response
    {
        $data = Validator::make(Request::input($request), [
            'title'     => 'required|string|max:200',
            'body'      => 'required|string',
            'published' => 'boolean',
        ])->validate();

        $article = new Article($data);                                   // only $fillable fields are used
        $article->user_id = (int) $request->getAttribute('auth.id');     // the author is the caller, set explicitly
        $article->save();

        return Response::json($article, 201);
    }

    public function destroy(ServerRequestInterface $request, int $article): Response
    {
        $model = Article::findOrFail($article);

        if ((int) $model->user_id !== (int) $request->getAttribute('auth.id')) {
            throw new HttpException(403, 'You can only delete your own articles.');
        }
        $model->delete();

        return Response::noContent();
    }
}
```

## 4. Routes

Public reads, authenticated writes:

```php title="routes/api.php"
use App\Http\Controllers\Api\ArticleController;

$router->get('/articles', [ArticleController::class, 'index']);
$router->get('/articles/{article}', [ArticleController::class, 'show']);

$router->prefix('articles')->middleware('jwt')->group(function ($router) {
    $router->post('/', [ArticleController::class, 'store']);
    $router->delete('/{article}', [ArticleController::class, 'destroy']);
});
```

```bash
php naluz migrate
php naluz route:list
```

## 5. Try it

```bash
curl -s localhost:8001/api/articles
curl -s -X POST localhost:8001/api/articles \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"First","published":true}'
```

Without a token the POST returns `401`. A missing title returns `422` with the field messages.

## 6. Tests

```php title="tests/Http/ArticleApiTest.php"
final class ArticleApiTest extends \Naluz\Tests\TestCase
{
    public function testWritesNeedAToken(): void
    {
        $this->assertSame(401, $this->json('POST', '/api/articles', ['title' => 'x', 'body' => 'y'])->getStatusCode());
    }

    public function testPublishedArticlesAreListed(): void
    {
        $user = User::create(['name' => 'Ann', 'email' => 'ann@example.test', 'password' => 'secret-password']);
        (new Article())->forceFill(['user_id' => $user->id, 'title' => 'Hi', 'body' => 'b', 'published' => true])->save();

        $queries = $this->queries(fn () => $this->get('/api/articles'));
        $this->assertLessThanOrEqual(3, count($queries), 'authors are eager loaded');
    }
}
```

## Next steps

- Add [rate limiting](../../basics/middleware/#rate-limiting) to the write routes.
- Expose the same data over [GraphQL](../graphql-api/).
- Cache reads with [model caching](../../database/model-caching/).
