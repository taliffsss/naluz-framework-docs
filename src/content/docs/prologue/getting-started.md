---
title: "Getting Started"
description: "Build your first feature end to end with a migration, model, controller and route."
---

This walkthrough adds an `articles` JSON API to a fresh project. It uses the generators, the ORM, validation and the
router, so you meet most of the framework in a few minutes. Make sure you have [installed](../installation/) the skeleton first.

## 1. Generate the pieces

```bash
php naluz make:migration create_articles_table
php naluz make:model Article
php naluz make:controller ArticleController
```

## 2. Define the table

Edit the new file in `database/migrations/`:

```php title="database/migrations/…_create_articles_table.php"
return new class extends Migration {
    public function up(Schema $schema): void
    {
        $schema->create('articles', function ($t) {
            $t->id();
            $t->string('title');
            $t->text('body');
            $t->timestamps();
        });
    }

    public function down(Schema $schema): void
    {
        $schema->dropIfExists('articles');
    }
};
```

## 3. Describe the model

Mass assignment is disabled until you list the fillable fields:

```php title="app/Models/Article.php"
class Article extends \Naluz\Database\Orm\Model
{
    protected array $fillable = ['title', 'body'];
}
```

## 4. Write the controller

```php title="app/Http/Controllers/ArticleController.php"
use App\Models\Article;
use Naluz\Http\Request;
use Naluz\Http\Response;
use Naluz\Validation\Validator;
use Psr\Http\Message\ServerRequestInterface;

final class ArticleController
{
    public function index(): array
    {
        return Article::latest()->get()->toArray();
    }

    public function store(ServerRequestInterface $request): Response
    {
        $data = Validator::make(Request::input($request), [
            'title' => 'required|string|max:200',
            'body'  => 'required|string',
        ])->validate();

        return Response::json(Article::create($data), 201);
    }

    public function show(int $article): Article
    {
        return Article::findOrFail($article);
    }
}
```

Controllers are plain classes. The container injects dependencies by type, route parameters by name, and the return value is
turned into a response. See [Controllers](../../basics/controllers/).

## 5. Add the routes

```php title="routes/api.php"
$router->apiResource('articles', ArticleController::class);
```

Routes in `routes/api.php` are served under `/api`, are stateless and are rate limited. See [Routing](../../basics/routing/).

## 6. Run it

```bash
php naluz migrate
php naluz route:list
php naluz run:server --port=8001
```

```bash
curl -s localhost:8001/api/articles \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","body":"First post"}'

curl -s localhost:8001/api/articles
```

An invalid request returns `422` with the messages per field:

```json
{ "message": "The given data was invalid.", "errors": { "title": ["The title field is required."] } }
```

## Where to go from here

- [Validation](../../basics/validation/) and [error handling](../../basics/errors/)
- [Models](../../database/models/) and [relationships](../../database/relationships/)
- [Authentication](../../security/authentication/) to protect the routes
- The longer [REST API guide](../../guides/rest-api/)
