---
title: "The Installer"
description: "Reference for the global naluz installer: options, commands inside a project, security and troubleshooting."
---

The NaluzPHP installer ([`naluz/installer`](https://github.com/taliffsss/naluz-installer)) is a small, dependency-free global
Composer package that provides the `naluz` command. It needs PHP 8.2+ and [Composer](https://getcomposer.org/).

```bash
composer global require naluz/installer
naluz new my-app
```

See [Installation](../installation/) for how to install it and put it on your `PATH`.

## `naluz new`

```bash
naluz new <name> [options]
```

It runs `composer create-project` for the NaluzPHP skeleton, then:

1. generates `APP_KEY` and `JWT_SECRET` in `.env`;
2. creates the default SQLite database file (`storage/database.sqlite`);
3. runs the database migrations if you pass `--migrate` or answer yes when asked (the question is only asked in a terminal);
4. creates a Git repository with a first commit if you pass `--git`.

| Option | Meaning |
|---|---|
| `--dir=PATH` | create the project inside `PATH` (default: the current directory) |
| `--release=VERSION` | install a specific release such as `1.2.2` or `^1.2` (default: the latest stable release) |
| `--dev` | install the development version (`dev-master`) |
| `--name=vendor/package` | set the Composer package name of the new project (lower case, `vendor/package`) |
| `--git` | run `git init` and make the first commit |
| `--migrate` | run the migrations after installing, without asking |
| `--no-install` | create the files only; the installer then copies `.env.example` to `.env` and you run `composer install` and `php naluz key:generate --jwt` yourself |
| `--no-interaction` | never ask questions (this is also the default when there is no terminal) |

Examples:

```bash
naluz new blog
naluz new shop --name=acme/shop --migrate --git
naluz new api --dir=~/Sites --release=^1.2
naluz new . --dev            # into the current directory, which must be empty
naluz new app --no-install
```

Options use the `--key=value` form.

### Where the files go

The target directory must not exist, or must be empty. The installer never deletes anything and never writes into a directory
that has files in it. With `.` as the name it installs into the current directory (which must be empty).

### Which version you get

Without `--release` or `--dev`, Composer installs the latest stable release of the skeleton. Use `--dev` to get what is on the
skeleton's `master` branch.

## Commands inside a project

Inside a NaluzPHP project (a directory containing `naluz` and `bootstrap/app.php`), every command other than `new` is passed to the
project's own `naluz` script. These pairs are equivalent:

```bash
naluz migrate                 php naluz migrate
naluz make:model Post         php naluz make:model Post
naluz queue:work --once       php naluz queue:work --once
naluz                         php naluz list
```

The exit code of the project command is returned. `naluz new` and `naluz --version` always run the installer, wherever you are.
Outside a project, an unknown command prints an error. See [Command line](../../tooling/cli/) for the project commands.

## Updating and removing

```bash
composer global update naluz/installer
composer global remove naluz/installer
```

The installer only creates projects. Update an existing project's framework with `composer update naluz/framework`.

## Security

- The project name, `--release` and `--name` are validated. A name may contain only letters, digits, `.`, `_` and `-` (no path
  separators, no `..`, no leading `-`), so a value cannot become a path outside the target or an option for Composer.
- Programs (Composer, Git, PHP) are started with an argument list and never through a shell, so nothing in a name is interpreted
  by `sh`.
- Commands are forwarded only when the current directory really looks like a NaluzPHP project; an unrelated file named `naluz` is
  never executed.
- The skeleton (`naluz/naluzphp`) is installed by Composer from Packagist over HTTPS, with Composer's usual
  integrity checks.

## Troubleshooting

| Message | What to do |
|---|---|
| `naluz: command not found` (or `'naluz' is not recognized`) | add Composer's global `bin` directory to your `PATH`: [steps for macOS, Linux and Windows](../installation/#naluz-command-not-found) |
| `Composer was not found` | install Composer, or set the `COMPOSER_BINARY` environment variable to its path |
| `The directory [...] is not empty` | choose another name, or empty the directory |
| `Invalid project name` | use letters, digits, `.`, `_` and `-` only |
| `Composer failed (exit code N)` | read Composer's output above the message: network, PHP version and missing extensions are the usual causes |
| `Migrations failed` | check the database settings in `.env`, then run `php naluz migrate` |
| `Could not commit` | set `git config user.name` and `user.email`, then commit yourself |

## Environment variables

| Variable | Purpose |
|---|---|
| `COMPOSER_BINARY` | full path to the Composer executable (default: `composer` on your `PATH`, or `composer.phar` in the current directory) |
| `NO_COLOR` | set to disable coloured output |
