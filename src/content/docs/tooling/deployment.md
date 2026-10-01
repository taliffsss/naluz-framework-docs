---
title: "Deployment"
description: "Deploy NaluzPHP to production: web server, environment, caches, workers and the scheduler."
---

## Checklist

```bash
composer install --no-dev --optimize-autoloader
php naluz migrate
php naluz route:cache
php naluz view:clear
```

| Setting | Production value |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` (the default). **Never enable it in production** |
| `APP_KEY`, `JWT_SECRET` | strong, secret, set in the environment |
| HTTPS | enabled. HSTS and `Secure` cookies then switch on automatically |
| `storage/` | writable by the web server user, **not** web-accessible |
| document root | `public/` only |

:::note
`migrate` runs without a confirmation prompt. `migrate:fresh` and `db:seed` refuse to run in production without `--force`, so avoid `migrate:fresh` there.
:::

## Environment

Set variables in the platform (systemd, Docker, your host's panel) rather than shipping a `.env`. Real environment variables take
precedence over `.env`. Never commit `.env`.

## Web server

### nginx + PHP-FPM

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    root /var/www/my-app/public;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/index.php;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }

    location ~ /\.(?!well-known) { deny all; }
}
```

### Apache

`public/.htaccess` is included (needs `mod_rewrite`). Point `DocumentRoot` at `public/`.

### Real client IP

Behind a load balancer or CDN, restore the real client address at the web server (nginx `real_ip_module`, Apache `mod_remoteip`).
The rate limiter and logs use `REMOTE_ADDR`.

## PHP settings

- Enable **OPcache**. In production set `opcache.validate_timestamps=0` and reload PHP-FPM on each deploy.
- Keep `expose_php` off and `display_errors` off.

## Caches

| Command | When |
|---|---|
| `php naluz route:cache` | every deploy (controller routes only; closures cannot be cached) |
| `php naluz view:clear` | every deploy, because compiled templates are trusted in production |
| `php naluz model-cache:flush` | after out-of-band database changes, if you use model caching |

## Queue workers

Run workers under a supervisor and restart them on every deploy:

```ini title="/etc/supervisor/conf.d/naluz-worker.conf"
[program:naluz-worker]
command=php /var/www/my-app/naluz queue:work --queue=default --sleep=3 --max-jobs=500 --memory=128
numprocesses=2
autostart=true
autorestart=true
stopwaitsecs=60
user=www-data
```

A worker finishes its current job on `SIGTERM` when `pcntl` is installed. Keep `queue.retry_after` above your slowest job.

## Scheduler

Add one cron entry:

```text
* * * * * cd /var/www/my-app && php naluz schedule:run >> /dev/null 2>&1
```

## Logging in production

Use `LOG_CHANNEL=production` (daily files plus Slack for critical errors), or `stderr` with JSON format in containers. See
[Logging](../../basics/logging/).

## Containers

Set `LOG_CHANNEL=stderr`, pass configuration as environment variables, mount `storage/` as a volume (or use shared Redis for cache,
sessions and queues) and run `php naluz run:server` only for development, never in production. Use PHP-FPM with nginx.

## Zero-downtime tips

- Run migrations that are backward compatible with the previous release.
- Restart queue workers after the new code is in place.
- Clear the view cache and rebuild the route cache as part of the release step.

See also the [Going to production guide](../../guides/going-to-production/).
