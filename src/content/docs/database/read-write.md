---
title: "Read/Write Connections"
description: "Send reads to replicas and writes to the primary, with sticky reads, failover and read-only replicas."
---

Reads and writes can use separate database servers. They use **separate PDO sessions** that never share state, so one cannot
disturb the other.

## Configuration

Leave `DB_READ_HOST` empty and nothing changes: there is one connection for everything. Set it to use replicas:

```ini
DB_CONNECTION=mysql
DB_WRITE_HOST=10.0.0.1                 # the primary (defaults to DB_HOST)
DB_READ_HOST=10.0.0.2,10.0.0.3         # one host or a comma-separated list of replicas
DB_READ_USERNAME=app_reader            # optional: separate credentials for replicas
DB_READ_PASSWORD=secret
DB_READ_PORT=3306
DB_STICKY=true                         # reads after a write in the same request use the primary
DB_READ_FALLBACK=true                  # if every replica is down, use the primary
DB_READ_STRATEGY=random                # random | ordered
```

Everything else (database name, charset, …) is inherited from the connection. The split applies to the `mysql`, `pgsql`
and `sqlsrv` connections in `config/database.php`.

### Per-connection arrays

For more control define the sections yourself in `config/database.php`:

```php
'mysql' => [
    'driver' => 'mysql', 'database' => 'app', 'username' => 'app', 'password' => '…',
    'write' => ['host' => '10.0.0.1'],
    'read'  => ['host' => ['10.0.0.2', '10.0.0.3'], 'password' => 'read-only-user-password'],
    // or one array per replica:
    // 'read' => [['host' => '10.0.0.2'], ['host' => '10.0.0.3', 'port' => 3307]],
],
```

Keys a section does not set are inherited from the connection itself.

## How reads are routed

| Statement | Goes to |
|---|---|
| plain `SELECT` | a replica |
| any write (`INSERT`, `UPDATE`, `DELETE`, DDL) | the primary |
| any statement inside a transaction | the primary |
| a `SELECT` after a write in the same request, when `DB_STICKY=true` | the primary (read-your-writes) |
| `SELECT … FOR UPDATE`, `INSERT … RETURNING` | the primary |
| migrations, queue reservation, the validator's `unique` / `exists`, model-cache misses | the primary |

Force the primary for a query with `->useWritePdo()`:

```php
$db->table('orders')->where('id', $id)->useWritePdo()->first();
```

## Replica selection and failover

- `DB_READ_STRATEGY=random` picks a replica at random per connection; `ordered` tries them in the order listed.
- If a replica fails to connect, the next one is tried. If all fail and `DB_READ_FALLBACK=true`, reads use the primary; with
  `false` the error surfaces.
- After an outage a failed replica is retried after about 30 seconds.

## Read-only replicas

Replica sessions are opened read-only where the database supports it, so a mistaken write cannot reach a replica:

| Driver | How |
|---|---|
| SQLite | `PRAGMA query_only = ON` |
| MySQL | `SET SESSION TRANSACTION READ ONLY` |
| PostgreSQL | `SET default_transaction_read_only = on` |
| SQL Server | `ApplicationIntent=ReadOnly` in the connection string |

Set `'read_only' => false` on a connection to turn this off.

## Replication lag

Replicas can lag behind the primary. NaluzPHP avoids the common problems: sticky reads after a write, primary reads inside
transactions, and primary reads for uniqueness checks and model-cache population (set `MODEL_CACHE_READ_FROM_PRIMARY=false` to
change the last one). Reads that you do not mark otherwise may still be slightly stale; call `->useWritePdo()` where that matters.

See [Model caching](../model-caching/) for how caching interacts with replicas.
