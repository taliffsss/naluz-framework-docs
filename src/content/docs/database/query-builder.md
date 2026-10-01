---
title: "Query Builder"
description: "Build SQL fluently with bound parameters and validated identifiers, independent of the ORM."
---

The query builder (`Naluz\Database\Query\Builder`) returns collections of plain arrays and does not involve models. The ORM is built on top of it.

```php
$manager = app(Naluz\Database\DatabaseManager::class);
$db = $manager->connection();                              // the default connection
$db->table('users')->where('active', true)->get();         // array of rows
```

```php
$db->table('users')
   ->select('id', 'name')->distinct()
   ->where('age', '>', 18)->orWhere('vip', true)
   ->where(fn ($q) => $q->where('a', 1)->orWhere('b', 2))      // grouped
   ->whereIn('id', [1, 2, 3])->whereNotIn(...)->whereNull('deleted_at')->whereBetween('age', [18, 65])
   ->whereExists(fn ($q) => $q->from('orders')->whereColumn('orders.user_id', '=', 'users.id'))
   ->whereIn('id', $db->table('orders')->select('user_id'))     // subquery
   ->join('profiles', 'users.id', '=', 'profiles.user_id')      // leftJoin, rightJoin, crossJoin
   ->groupBy('role')->having('n', '>', 1)
   ->orderBy('name', 'desc')->latest()->limit(10)->offset(20)
   ->when($term !== '', fn ($q) => $q->where('name', 'like', "%{$term}%"))
   ->get();
```

| Read | Write |
|---|---|
| `get() first() find($id) value($col) pluck($col, $key) exists()` | `insert() insertGetId() upsert() update() increment() decrement() delete() truncate()` |
| `count() sum() avg() min() max()` | `insert([[…], […]])` bulk, `insert($row, ignore: true)` |
| `paginate($perPage, $page)` → `Paginator` (JSON: `{data, meta}`) | `transaction(fn)` on the connection (nested = savepoints) |
| `chunk($size, fn)` · `cursor()` (generator, constant memory) | `toSql()` / `getBindings()` for debugging |

## SQL injection safety

- Every value is a **bound parameter**, never concatenated.
- Identifiers (`where($column…)`, `orderBy`, `select`, joins, table names) must be plain `name`, `table.name`,
  `table.*` or `x as y`. Anything else throws `InvalidArgumentException`, so passing user input as a column name can't
  inject — it fails loudly. **Still allow-list sortable columns** if you accept them from users.
- Operators and sort directions are allow-listed.
- Raw SQL requires an explicit opt-in: `selectRaw()`, `whereRaw($sql, $bindings)`, `orderByRaw()`, `Connection::raw()`.
  Put user input only in `$bindings`.

```php
$sortable = ['name', 'created_at'];
$col = in_array($req['sort'] ?? '', $sortable, true) ? $req['sort'] : 'created_at';
User::orderBy($col, ($req['dir'] ?? '') === 'asc' ? 'asc' : 'desc')->get();
```
