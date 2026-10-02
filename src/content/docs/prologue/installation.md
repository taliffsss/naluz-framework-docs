---
title: "Installation"
description: "Install the naluz installer and create a new NaluzPHP project, or clone the skeleton."
---

## Install the NaluzPHP installer (recommended)

The installer is a global Composer package that adds the `naluz` command, so you can create projects from anywhere:

```bash
composer global require naluz/installer
```

Make sure Composer's global `bin` directory is on your `PATH`. Find it with `composer global config bin-dir --absolute`
(commonly `~/.composer/vendor/bin` or `~/.config/composer/vendor/bin`). Check that it works:

```bash
naluz --version
```

:::note
If `composer global require naluz/installer` cannot find the package (it has not been registered on Packagist yet), install it from
GitHub instead:

```bash
composer global config repositories.naluz-installer vcs https://github.com/taliffsss/naluz-installer
composer global require naluz/installer:dev-main
```
:::

Then create a project:

```bash
naluz new my-app
cd my-app
php naluz run:server
```

`naluz new` creates the project with Composer, generates `APP_KEY` and `JWT_SECRET`, creates the default SQLite database file and,
if you agree, runs the migrations. Open <http://127.0.0.1:8000> and try `GET /api/ping`.

```bash
naluz new shop --name=acme/shop --migrate --git      # set the package name, migrate, git init + first commit
naluz new api --release=^1.2                         # a specific release
naluz new . --dev                                    # the development version, into the current empty directory
```

See [The installer](../installer/) for every option, how commands are forwarded inside a project, and troubleshooting. Update it
with `composer global update naluz/installer`.

## Other ways to create a project

NaluzPHP projects start from the application skeleton, [`naluzphp-framework`](https://github.com/taliffsss/naluzphp-framework).
The framework itself arrives in `vendor/naluz/framework` when you run `composer install`.

### With Composer directly

The skeleton is a normal Composer package, so no extra repository settings are needed:

```bash
composer create-project naluz/naluzphp my-app
composer create-project naluz/naluzphp my-app dev-master    # the development version
```

### Clone the skeleton

```bash
git clone https://github.com/taliffsss/naluzphp-framework.git my-app
cd my-app
composer install
cp .env.example .env
php naluz key:generate --jwt
touch storage/database.sqlite     # SQLite is the default database
php naluz migrate
php naluz run:server
```

### From inside an existing project

A project also has its own generator, which copies the project it is run in:

```bash
php naluz new my-app
```

| Option | Meaning |
|---|---|
| `--name=vendor/package` | sets the Composer package name |
| `--no-install` | skip `composer install` |
| `--dir=/parent/dir` | create the project in another directory |

## The development server

```bash
php naluz run:server                    # http://127.0.0.1:8000
php naluz run:server --port=8001        # another port
php naluz run:server --host=0.0.0.0 --workers=4
```

`APP_HOST` and `APP_PORT` in `.env` set the defaults. The command checks that the port is free and validates the
host, port and worker count before starting PHP's built-in server. It is meant for development only.

## Configure your environment

Copy `.env.example` to `.env` and adjust it. The generated keys are required:

```bash
php naluz key:generate           # writes APP_KEY (encryption)
php naluz key:generate --jwt     # also writes JWT_SECRET (token auth)
php naluz key:generate --show    # print the values instead of writing them
```

See [Configuration](../configuration/) for the full list.

## Choose a database

SQLite works with no setup. For MySQL, PostgreSQL or SQL Server, set the connection in `.env`:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=myapp
DB_USERNAME=myapp
DB_PASSWORD=secret
```

See [Database drivers](../../database/drivers/) and [Read/write connections](../../database/read-write/).

## Web server

Point the document root at `public/`. Only that directory should be web-accessible.

### Apache

`public/.htaccess` is included and needs `mod_rewrite`.

### nginx

```nginx
root /var/www/my-app/public;

location / {
    try_files $uri /index.php$is_args$args;
}

location ~ \.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root/index.php;
    fastcgi_pass unix:/run/php/php-fpm.sock;
}
```

## Next steps

Build [your first feature](../getting-started/), or read the [production guide](../../guides/going-to-production/)
before you deploy.
