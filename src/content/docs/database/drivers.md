---
title: "Database Drivers"
description: "Notes for SQLite, MySQL / MariaDB, PostgreSQL and SQL Server, including what is tested."
---

| Driver | `DB_CONNECTION` | PHP extension |
|---|---|---|
| SQLite | `sqlite` | `pdo_sqlite` |
| MySQL / MariaDB | `mysql` | `pdo_mysql` |
| PostgreSQL | `pgsql` | `pdo_pgsql` |
| SQL Server / Azure SQL | `sqlsrv` | `pdo_sqlsrv` + Microsoft ODBC driver |

SQL differences (identifier quoting, upsert syntax, `LIMIT` / `OFFSET`, `RETURNING`, auto-increment types) are handled in
`Query\Grammar` and `Schema\Schema`, so your code does not change between drivers.

:::caution[What is verified]
The automated test suite runs against SQLite (and a real Redis server). The MySQL, PostgreSQL and SQL Server grammars are
verified by SQL-generation tests only, and there is no live SQL Server in CI. **Run your own test suite against your target
database** before relying on it in production.
:::

## SQLite

The default. `DB_DATABASE` is a path relative to the project (default `storage/database.sqlite`) or `:memory:`. Foreign keys are
enabled for you. Good for development, tests and small deployments.

## MySQL and MariaDB

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=myapp
DB_USERNAME=myapp
DB_PASSWORD=secret
```

The connection uses `utf8mb4`, real server-side prepared statements, and a strict SQL mode. MySQL implicitly commits DDL, so
migrations on MySQL are not wrapped in a transaction (they are on SQLite and PostgreSQL).

## PostgreSQL

```ini
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=myapp
DB_USERNAME=postgres
DB_PASSWORD=secret
```

Supports `RETURNING`, and migrations run inside a transaction.

## SQL Server

```ini
DB_CONNECTION=sqlsrv
DB_HOST=sql.example.com
DB_PORT=1433
DB_DATABASE=myapp
DB_USERNAME=sa
DB_PASSWORD=secret
DB_ENCRYPT=true                      # default: true
DB_TRUST_SERVER_CERTIFICATE=false    # default: false; set true only for a self-signed dev server
```

Requires `pdo_sqlsrv` and the Microsoft ODBC driver. What the SQL Server dialect handles:

- identifiers are quoted with `[ ]`; values with `N'…'`
- pagination uses `OFFSET … FETCH` (adding `ORDER BY (SELECT 0)` when you did not order); `limit(0)` uses `TOP (0)`
- upserts use `MERGE`; `IDENTITY` columns; `NVARCHAR`, `BIT` and `DATETIME2` column types
- `ALTER TABLE … ADD` (no `COLUMN` keyword) and `DROP` ordering that removes foreign keys first for `migrate:fresh`
- savepoints use `SAVE TRANSACTION` / `ROLLBACK TRANSACTION`
- bulk `insert` / `upsert` are split into chunks that respect SQL Server's limits (1000 rows, 2100 parameters)
- `whereIn` with more than 2000 values throws instead of failing at the database
- `insert($row, ignore: true)` is not supported and throws

The connection string rejects values containing `;`, `{` or `}`, so configuration cannot inject extra connection options.
Read-only replicas use `ApplicationIntent=ReadOnly`; see [Read/write connections](../read-write/).

## Adding a driver

Extend `Query\Grammar` and `Schema\Schema` for the new dialect and add a factory in `DatabaseManager`.
