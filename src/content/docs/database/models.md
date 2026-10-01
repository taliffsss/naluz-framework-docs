---
title: "Models (ORM)"
description: "Define models, mass assignment, casts, accessors, scopes, soft deletes and events with the active-record ORM."
---

Models map a table to a class and rows to objects (the active-record pattern). Generate one with:

```bash
php naluz make:model Post
```

```php title="app/Models/Post.php"
use Naluz\Database\Orm\HasFactory;
use Naluz\Database\Orm\Model;
use Naluz\Database\Orm\SoftDeletes;

class Post extends Model
{
    use HasFactory;                                    // Post::factory()
    use SoftDeletes;                                   // optional

    protected ?string $table = 'posts';                // default: snake_case plural of the class name
    protected string $primaryKey = 'id';
    protected ?string $connection = null;              // a named connection from config/database.php
    protected bool $incrementing = true;
    protected bool $timestamps = true;                 // created_at / updated_at

    protected array $fillable = ['title', 'body'];     // mass-assignment allow-list (default: nothing)
    protected array $hidden = ['internal_notes'];      // never serialized
    protected array $appends = ['excerpt'];            // accessor-backed extra fields
    protected array $casts = ['published' => 'bool', 'meta' => 'array', 'api_key' => 'encrypted'];
}
```

## Retrieving models

```php
Post::all();                                           // Collection of models
Post::find(1);                                         // model or null
Post::find([1, 2]);                                    // Collection
Post::findOrFail(1);                                   // throws ModelNotFoundException → HTTP 404
Post::where('views', '>', 100)->orderBy('id')->get();
Post::where('slug', 'a')->first();                     // first() or firstOrFail()
Post::latest()->paginate(15, page: 2);                 // Paginator
Post::query()->chunk(500, fn ($posts) => …);           // process big tables in batches
foreach (Post::query()->cursor() as $post) { … }       // generator, constant memory
```

Everything available on the [query builder](../query-builder/) (`where`, `orderBy`, `count`, `sum` …) works on a model query too.

## Creating and updating

```php
$post = Post::create(['title' => 'Hello', 'body' => '…']);      // only $fillable keys are used

$post->title = 'New title';
$post->isDirty('title');                    // true
$post->save();

$post->update(['title' => 'x']);
$post->delete();
Post::destroy([1, 2]);

Post::firstOrCreate(['slug' => 'a'], ['title' => 'A']);
Post::updateOrCreate(['slug' => 'a'], ['title' => 'B']);

$post->fresh();                             // a new instance read from the database
$post->refresh();                           // reload this instance
```

### Mass assignment

A model accepts **nothing** until `$fillable` lists the fields, so a request cannot set `is_admin` unless you allow it.
`forceFill()` bypasses `$fillable` and must never be given raw request data. Factories use `forceFill()` because they are trusted code.

## Casts

```php
protected array $casts = [
    'published' => 'bool',          // int, float, bool, array / json, datetime / date
    'meta'      => 'array',         // JSON in the column
    'starts_at' => 'datetime',      // DateTimeImmutable
    'status'    => Status::class,   // a PHP enum
    'api_key'   => 'encrypted',     // encrypted with APP_KEY (not searchable)
    'password'  => 'hashed',        // hashed with Argon2id on assignment
];
```

## Accessors, mutators and scopes

```php
public function getExcerptAttribute(): string
{
    return mb_substr($this->body, 0, 80);
}

public function setTitleAttribute(string $value): void
{
    $this->setRawAttribute('title', trim($value));
}

public function scopePublished(Builder $query): void       // Post::published()->get()
{
    $query->where('published', true);
}
```

Accessors listed in `$appends` are included when the model is serialized.

## Soft deletes

Add the `SoftDeletes` trait and a `deleted_at` column (`$t->softDeletes()` in a migration):

```php
$post->delete();                 // sets deleted_at; hidden from queries
Post::withTrashed()->find(1);
Post::onlyTrashed()->get();
$post->trashed();                // true
$post->restore();
$post->forceDelete();            // really delete
```

## Events

Models fire `saving`, `saved`, `creating`, `created`, `updating`, `updated`, `deleting` and `deleted`. Listen with a closure:

```php
User::creating(fn (User $u) => $u->slug = Str::slug($u->name));
```

Returning `false` from a `-ing` listener cancels the operation. To group listeners in a class, use
[observers](../../advanced/events/#model-observers).

:::note
Model events fire for operations on model instances. Bulk query writes (`Post::where(…)->update([…])`) do not fire them.
:::

## Serialization

`toArray()`, `toJson()` and `json_encode($model)` apply `$hidden`, `$appends`, casts and loaded relations. A `Paginator` serializes to:

```json
{ "data": [ … ], "meta": { "total": 42, "per_page": 15, "current_page": 1, "last_page": 3 } }
```

## Caching a model's queries

With [model caching](../model-caching/) enabled, opt a model out with `protected bool $cache = false;` or give it a longer
lifetime with `protected ?int $cacheTtl = 86400;`.

## Next

[Relationships](../relationships/) · [Factories and seeders](../factories-seeders/) · [Model caching](../model-caching/)
