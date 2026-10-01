---
title: "Requirements"
description: "PHP version, extensions and optional services NaluzPHP needs."
---

## PHP

NaluzPHP requires **PHP 8.2 or later** and is tested in CI on PHP 8.2, 8.3, 8.4 and 8.5.

## Required extensions

| Extension | Used for |
|---|---|
| `pdo` plus a driver (`pdo_sqlite`, `pdo_mysql`, `pdo_pgsql` or `pdo_sqlsrv`) | the database layer |
| `mbstring` | string handling |
| `openssl` | TLS (SMTP, HTTP client) |
| `sodium` | encryption (XChaCha20-Poly1305) and Argon2id password hashing |
| `fileinfo` | content-based upload type detection |

Composer checks these when you run `composer install`.

## Optional

| Need | Requirement |
|---|---|
| Microsoft SQL Server | `pdo_sqlsrv` and the Microsoft ODBC driver |
| MongoDB document store | `composer require mongodb/mongodb` and `ext-mongodb` |
| Redis cache, sessions or queue | a Redis server. No PHP extension is needed because the framework ships its own client |
| Graceful queue worker shutdown | `pcntl`, so `queue:work` finishes the current job on `SIGTERM` / `SIGINT` |

## Tooling

- [Composer](https://getcomposer.org/) 2
- Git, to clone the skeleton
- A web server (Apache or nginx with PHP-FPM) for production. `php naluz run:server` is enough for development.

## Runtime dependencies

The framework keeps its dependency list short: `nyholm/psr7`, `nyholm/psr7-server` and `guzzlehttp/guzzle`, plus the PSR
interface packages. Everything else (Redis client, mailer, template engine, GraphQL server) is built in.
