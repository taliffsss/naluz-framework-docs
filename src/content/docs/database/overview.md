---
title: "Database: Getting Started"
description: "Connections, configuration and the three layers of the database stack."
---

NaluzPHP's database layer has three parts that you can use independently:

1. **`Connection`**: a PDO wrapper with prepared statements, transactions and query listeners.
2. **Query builder**: `Naluz\Database\Query\Builder`, returns collections of plain arrays. See [Query builder](../query-builder/).
3. **ORM**: `Naluz\Database\Orm\Model`, returns models, built on top of the query builder. See [Models](../models/).

```php
$manager = app(Naluz\Database\DatabaseManager::class);
$db = $manager->connection();                                // the default connection
$db->table('users')->where('active', true)->get();           // query builder, no models involved
User::where('active', true)->get();                          // ORM
```

## Configuration

Connections are defined in `config/database.php`. Choose the default with `DB_CONNECTION`:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=myapp
DB_USERNAME=myapp
DB_PASSWORD=secret
```

| Driver | `DB_CONNECTION` | Default for |
|---|---|---|
| SQLite | `sqlite` | `storage/database.sqlite` (the default connection) |
| MySQL / MariaDB | `mysql` | port 3306 |
| PostgreSQL | `pgsql` | port 5432 |
| SQL Server / Azure SQL | `sqlsrv` | port 1433 |

See [Database drivers](../drivers/) for driver-specific notes.

### More than one connection

Add connections to `config/database.php` and use them by name:

```php
$manager->connection('reporting')->table('events')->get();

class Event extends Model
{
    protected ?string $connection = 'reporting';
}
```

### Transactions

```php
$db->transaction(function () use ($db) {
    $db->table('accounts')->where('id', 1)->decrement('balance', 100);
    $db->table('accounts')->where('id', 2)->increment('balance', 100);
});    // commits, or rolls back if the closure throws
```

Nested `transaction()` calls use savepoints.

### Debugging queries

```php
$sql = $db->table('users')->where('id', 5)->toSql();        // 'SELECT * FROM "users" WHERE "id" = ?'
$bindings = $db->table('users')->where('id', 5)->getBindings();
$db->listen(fn (string $sql) => logger($sql));              // every statement executed
```

## Read replicas

Send reads to replicas and writes to a primary with a few environment variables. See [Read/write connections](../read-write/).

## Other stores

For document data, see [NoSQL](../nosql/). To cache query results automatically, see [Model caching](../model-caching/).
