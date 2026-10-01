---
title: "Relationships"
description: "hasOne, hasMany, belongsTo, belongsToMany, polymorphic and has-many-through relations, eager loading and the N+1 guard."
---

Declare a relationship as a method that returns a relation. Then read it as a property (lazy loaded) or call it as a query.

```php
$user->hasMany(Post::class, 'user_id');        $user->hasOne(Profile::class);
$post->belongsTo(User::class, 'user_id');
$post->belongsToMany(Tag::class, 'post_tag', 'post_id', 'tag_id');   // table + keys optional

$user->posts;                              // lazy loaded property
$user->posts()->where('published', true)->get();   // relation as query
$user->posts()->create([...]);             // hasMany
$post->tags()->attach([1, 2]); ->detach(1); ->sync([2, 3]);
$comment->post()->associate($post);        // belongsTo

User::with('posts.comments', ['posts' => fn ($q) => $q->latest()])->get();   // eager loading
$user->load('posts');
```

## Eager loading

Eager loading uses one query per relation (`WHERE fk IN (…)`), which eliminates N+1 queries. The test suite asserts it.

## Polymorphic relations

One table of comments for many owner types:

```php
// comments: id, body, commentable_type, commentable_id
class Post extends Model    { public function comments(): MorphMany { return $this->morphMany(Comment::class, 'commentable'); } }
class Comment extends Model { public function commentable(): MorphTo { return $this->morphTo('commentable'); } }

Model::morphMap(['post' => Post::class, 'video' => Video::class]);   // store aliases, not class names (recommended)

$post->comments()->create(['body' => 'Nice']);
Comment::with('commentable')->get();     // 1 query for comments + 1 per distinct type, however many rows
```

Also `morphOne`. The `_type` column is data, so it is **never trusted**: it must resolve (through the morph map when you
define one) to a `Model` subclass, otherwise `InvalidArgumentException` — a tampered row cannot instantiate arbitrary classes.
(`morphToMany` / nested eager loading through a `morphTo` are not implemented.)

## Has-many-through

```php
// Country → users → posts
public function posts(): HasManyThrough { return $this->hasManyThrough(Post::class, User::class, 'country_id', 'user_id'); }
public function latestPost(): HasOneThrough { return $this->hasOneThrough(Post::class, User::class)->latest('posts.id'); }
Country::with('posts')->get();           // 2 queries
```

## The lazy-loading guard (N+1 detector)

```php
foreach (Post::all() as $post) { echo $post->author->name; }   // throws LazyLoadingViolationException
// "Attempted to lazy load [author] on model [Post]. Eager load it with ::with('author') or ->load('author')."
foreach (Post::with('author')->get() as $post) { … }           // fine
```

On by default when `APP_ENV` is `local`/`testing` or `APP_DEBUG=true` (override with `PREVENT_LAZY_LOADING=true|false`,
or `Model::preventLazyLoading(false)`). Production never throws. Models created during the current request are exempt, and
`load()` / calling the relation as a query (`$post->author()->first()`) are explicit and always allowed.
