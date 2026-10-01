---
title: "Logging"
description: "PSR-3 logging with daily, single, stderr, Slack, stack and custom channels."
---

NaluzPHP implements **PSR-3** itself, so no logging library is needed. The application logger (`Naluz\Log\LogManager`, bound
to `Psr\Log\LoggerInterface`) sends records to a *channel*. Channels live in `config/logging.php` and the default is chosen
with `LOG_CHANNEL`.

```php
logger()->warning('Disk almost full');                              // default channel
logger()->channel('slack')->critical('Payment provider {p} down', ['p' => 'Stripe']);
logger()->stack(['daily', 'slack'])->error('Checkout failed', ['exception' => $e]);   // ad-hoc stack
logger('Order {id} shipped', ['id' => $order->id]);                 // info shortcut
```

Inject `Psr\Log\LoggerInterface` into your classes to log without helpers.

## Channels

| Driver | What it does | Options |
|---|---|---|
| `daily` (default) | `storage/logs/naluz-YYYY-MM-DD.log`; files older than `days` are deleted | `level`, `days`, `path`, `format` |
| `single` | one file, e.g. `storage/logs/naluz.log` | `level`, `file`, `path`, `format` |
| `stderr` / `stdout` | for containers, Kubernetes, systemd: the platform collects it | `level`, `format` |
| `errorlog` | PHP's own `error_log()` (web server / php-fpm) | `level` |
| `slack` | Slack incoming webhook | `url`, `level` (default `critical`), `username`, `emoji`, `include_trace` |
| `stack` | several channels at once; one failing member never blocks the others | `channels` |
| `null` | discard | none |
| `custom` | any PSR-3 logger (Monolog, a Sentry handler …) | `via` (class name or closure returning a `LoggerInterface`) |

`format` is `line` (default, human-readable) or `json` (one JSON object per line for Loki, Elastic, Datadog or CloudWatch).
Every channel has its own minimum `level` (`debug` … `emergency`).

### Typical setups

```text
development              LOG_CHANNEL=daily
production on a VM       LOG_CHANNEL=production   (daily files + Slack for critical) and LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/…
containers / Kubernetes  LOG_CHANNEL=stderr       (set 'format' => 'json' in config/logging.php)
```

## Slack

Create an *Incoming Webhook* in Slack, put the URL in `LOG_SLACK_WEBHOOK_URL`, and add `slack` to a stack (or log to it directly).

- It defaults to `critical` and above, because Slack is for things that need a human. Change it with `LOG_SLACK_LEVEL`.
- Messages show the app name and environment, the level (colour-coded), the interpolated message, and the exception class and
  `file:line` (basename only). **Stack traces are not sent** unless you set `include_trace` (only for private channels).
- User-controlled text is escaped (`& < >`), so a log line cannot inject `<!channel>` pings or fake links.
- It never throws: if Slack is down or returns an error, the record falls back to PHP's `error_log()`.
- The webhook URL is a secret and is never written to any log; only `https://hooks.slack.com/…` URLs are accepted.
- Slack is called synchronously with a short timeout. For high volume, send to Slack from a queued job instead of per request.

## Your own channel

```php title="config/logging.php"
'sentry' => ['driver' => 'custom', 'via' => fn (array $config) => new App\Logging\SentryLogger(env('SENTRY_DSN'))],
```

Any object implementing `Psr\Log\LoggerInterface` works as a channel.

## Safety

- Newlines in log context are neutralized, so user input cannot forge log lines.
- If the log directory is not writable, records go to `error_log()` instead of being lost.

See [Error handling](../errors/) for what the framework logs on its own.
