---
title: "Guide: Going to Production"
description: "A step-by-step checklist for a safe first deployment."
---

Work through this list before your first deployment. Each item links to the page that explains it.

## 1. Configuration

- [ ] `APP_ENV=production`, `APP_DEBUG=false`
- [ ] A fresh `APP_KEY` and `JWT_SECRET` (`php naluz key:generate --jwt --show`), stored as environment variables, not committed
- [ ] `APP_URL` set to the public HTTPS URL
- [ ] A real database (MySQL, PostgreSQL or SQL Server) with a dedicated user. See [Database drivers](../../database/drivers/)
- [ ] `CACHE_DRIVER`, `SESSION_DRIVER` and `QUEUE_CONNECTION` on Redis if you run more than one server

## 2. Security

- [ ] HTTPS everywhere (HSTS and `Secure` cookies then activate automatically)
- [ ] Document root is `public/` only; `.env` and `storage/` are not web-accessible
- [ ] CORS origins listed if browsers on other origins call your API (`config/security.php`)
- [ ] Tight `throttle` limits on login and password-reset routes
- [ ] Real client IP restored at the web server (see [Deployment](../../tooling/deployment/#real-client-ip))
- [ ] Authorization checks on every write path. See [Authorization](../../security/authorization/)
- [ ] GraphQL introspection off (the default outside debug)

## 3. Build and release

```bash
composer install --no-dev --optimize-autoloader
php naluz migrate
php naluz route:cache
php naluz view:clear
```

- [ ] OPcache enabled with `validate_timestamps=0`; reload PHP-FPM after deploy

## 4. Background work

- [ ] Queue workers under a supervisor, restarted on each deploy
- [ ] The scheduler's single cron entry
- [ ] `queue.retry_after` above your slowest job

## 5. Observability

- [ ] `LOG_CHANNEL=production` (daily files plus Slack for critical errors) or `stderr` with JSON in containers
- [ ] Logs are collected and alerts exist for critical errors. See [Logging](../../basics/logging/)

## 6. Optional performance

- [ ] [Model caching](../../database/model-caching/) with Redis (`MODEL_CACHING=true`, `MODEL_CACHE_DRIVER=redis`)
- [ ] [Read replicas](../../database/read-write/) if reads dominate

## 7. After deploying

- [ ] Hit `GET /api/ping` and a few real routes
- [ ] Trigger a handled error and confirm no stack trace is shown to clients
- [ ] Check the log file or Slack for the error you triggered
