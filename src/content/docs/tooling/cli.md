---
title: "Command Line (naluz)"
description: "Every naluz command, its options and examples."
---

The `naluz` script in the project root is the command-line entry point:

```bash
php naluz list                 # or: php naluz help
php naluz <command> [arguments] [--options]
```

Unknown commands print an error and exit with status 1. Commands boot the application first, so they use your `.env` and config.

## Application

| Command | Purpose |
|---|---|
| `new <name>` | create a new project from the starter. Options: `--name=vendor/pkg`, `--no-install`, `--dir=path` |
| `run:server` | start the development server. Options: `--port=8001`, `--host=127.0.0.1`, `--workers=N`, `--dry-run` |
| `key:generate` | write `APP_KEY` to `.env`. `--jwt` also writes `JWT_SECRET`; `--show` prints instead of writing |

```bash
php naluz run:server --port=8001
php naluz key:generate --jwt
```

`run:server` defaults come from `APP_HOST` and `APP_PORT`. It validates the host, port and worker count and checks that the port is free.

## Database

| Command | Purpose |
|---|---|
| `migrate` | run pending migrations |
| `migrate:rollback` | roll back the last batch. `--step=N` for more |
| `migrate:status` | show which migrations have run |
| `migrate:fresh` | drop all tables and re-run every migration. `--seed` seeds afterwards |
| `db:seed` | run seeders. `--class=Database\Seeders\DatabaseSeeder` |

`migrate:fresh` and `db:seed` refuse to run when `APP_ENV=production` unless you pass `--force`.

## Generators

All generators take a name (letters, digits, underscores and `/` for subfolders) and refuse to overwrite an existing file.

| Command | Creates |
|---|---|
| `make:controller Name` | `app/Http/Controllers/Name.php` |
| `make:model Name` | `app/Models/Name.php` |
| `make:middleware Name` | `app/Http/Middleware/Name.php` |
| `make:migration create_x_table` | `database/migrations/<timestamp>_create_x_table.php` |
| `make:factory NameFactory` | `database/factories/` |
| `make:seeder NameSeeder` | `database/seeders/` |
| `make:job Name` | `app/Jobs/` |
| `make:provider Name` | `app/Providers/` |
| `make:observer NameObserver` | `app/Observers/` |

```bash
php naluz make:controller Admin/UserController     # app/Http/Controllers/Admin/UserController.php
```

The name is validated against a strict allow-list, so path traversal (`../`) and code injection into generated files are rejected.

## Routing and views

| Command | Purpose |
|---|---|
| `route:list` | list every registered route |
| `route:cache` | compile the route table (controller routes only) |
| `route:clear` | remove the route cache |
| `view:clear` | delete compiled templates |

## Queues and scheduling

| Command | Purpose |
|---|---|
| `queue:work` | process jobs. `--queue=default`, `--once`, `--stop-when-empty`, `--max-jobs=N`, `--sleep=3`, `--memory=128` |
| `queue:failed` | list failed jobs |
| `queue:retry <id\|all>` | re-queue a failed job |
| `queue:flush` | delete all failed jobs |
| `schedule:run` | run due tasks (call from cron every minute) |
| `schedule:list` | list tasks and their next run |

## Model cache

| Command | Purpose |
|---|---|
| `model-cache:flush` | invalidate everything, or one model with `--model="App\Models\Post"` |
| `model-cache:prune` | delete expired files (local driver) |

## Exit codes

`0` on success, `1` on error (unknown command, invalid arguments, failed task).
