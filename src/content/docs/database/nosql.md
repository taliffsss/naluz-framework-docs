---
title: "NoSQL Document Stores"
description: "File, in-memory and MongoDB document stores with an injection-safe query builder."
---

NaluzPHP ships a small document-store layer next to the SQL query builder. Collections hold arrays; filters and updates
use MongoDB-style operators.

| Driver | Needs | Use for |
|---|---|---|
| `file` (default) | nothing | local dev, small apps; one JSON file per collection, `flock` + atomic rename |
| `memory` | nothing | tests |
| `mongodb` | `composer require mongodb/mongodb` (+ ext-mongodb) | production |

```ini
NOSQL_CONNECTION=file          # file | memory | mongodb
NOSQL_MONGODB_URI=mongodb://127.0.0.1:27017
NOSQL_DATABASE=naluz
```

```php
$users = nosql()->collection('users');            // or nosql('mongodb')->collection(...)
$users->createIndex(['email' => 1], ['unique' => true]);
$users->insertOne(['name' => 'Ann', 'age' => 30, 'email' => 'ann@x.io']);

$adults = $users->query()
    ->where('age', '>=', 18)->orWhere('role', 'admin')
    ->orderBy('name')->limit(20)->get();          // collection of arrays

$users->query()->where('name', 'Ann')->increment('age');
$page = $users->query()->orderBy('age')->paginate(15, 1);
```

Raw filters work too: `$users->find(['age' => ['$gt' => 18]])`, `updateOne`, `updateMany`, `replaceOne`, `deleteOne`,
`deleteMany`, `distinct`, `count`. Supported update operators: `$set $unset $inc $mul $min $max $push $pull $addToSet
$rename $setOnInsert`.

## Safety

* The fluent `Query` builder wraps every value in `$eq`/`$in`, so user input such as `['$ne' => null]` stays a literal
  (no operator injection). Field names and operators are allow-listed.
* `like` patterns are escaped and anchored; regex length and options are bounded.
* The MongoDB adapter refuses `$where`, `$function` and `$accumulator` (server-side JavaScript) and rejects `$`-prefixed
  or dotted keys in stored documents.
* The file driver refuses corrupt files instead of overwriting them, and collection names cannot traverse paths.
