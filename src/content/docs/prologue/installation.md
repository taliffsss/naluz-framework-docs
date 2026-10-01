---
title: "Installation"
description: "Create a new NaluzPHP project, either with the naluz new command or by cloning the skeleton."
---

## Create a project

NaluzPHP projects start from the application skeleton, [`naluzphp-framework`](https://github.com/taliffsss/naluzphp-framework).
The framework itself arrives in `vendor/naluz/framework` when you run `composer install`.

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

Open <http://127.0.0.1:8000> and try `GET /api/ping`.

### Use the project generator

From inside a clone of the skeleton you can scaffold further projects:

```bash
php naluz new my-app
cd my-app && php naluz migrate && php naluz run:server
```

`naluz new` copies the starter, writes a `.env` with a fresh `APP_KEY` and `JWT_SECRET`, and runs `composer install`.

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
