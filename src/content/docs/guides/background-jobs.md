---
title: "Guide: Background Jobs and Scheduling"
description: "Send mail and run housekeeping in the background with queues, a worker and the scheduler."
---

This guide moves a slow task (sending a welcome email) out of the request, runs it with a worker, and schedules a nightly cleanup.

## 1. Choose a queue driver

For development the default `sync` driver runs jobs immediately. To really use a queue, use the database driver:

```ini
QUEUE_CONNECTION=database
```

```bash
php naluz migrate        # creates the jobs and failed_jobs tables
```

## 2. Write the job

```bash
php naluz make:job SendWelcomeEmail
```

```php title="app/Jobs/SendWelcomeEmail.php"
namespace App\Jobs;

use App\Models\User;
use Naluz\Mail\Mailer;
use Naluz\Queue\Job;

final class SendWelcomeEmail extends Job
{
    protected int $tries = 5;
    protected int|array $backoff = [10, 60, 300];

    public function __construct(public readonly int $userId) {}      // public properties are the job data

    public function handle(Mailer $mailer): void                     // dependencies are injected
    {
        $user = User::findOrFail($this->userId);

        $message = $mailer->message()->to($user->email, $user->name)->subject('Welcome!')->text("Hi {$user->name}");
        $mailer->send($message);
    }

    public function failed(\Throwable $e): void
    {
        logger()->error('Welcome email failed for {id}', ['id' => $this->userId, 'exception' => $e]);
    }
}
```

Pass IDs and re-load the model inside `handle()` so the payload stays small and fresh.

## 3. Dispatch it

```php
SendWelcomeEmail::dispatch($user->id);
dispatch((new SendWelcomeEmail($user->id))->onQueue('mail')->delay(60));
```

## 4. Run a worker

```bash
php naluz queue:work --queue=default --sleep=3
```

A worker finishes the current job on `SIGTERM`/`SIGINT` (when `pcntl` is installed). Run workers under a supervisor in production. See
[Deployment](../../tooling/deployment/).

Inspect and retry failures:

```bash
php naluz queue:failed
php naluz queue:retry all
```

## 5. Schedule recurring work

```php title="routes/console.php"
return function (Schedule $schedule): void {
    $schedule->command('queue:work --stop-when-empty')->everyMinute()->withoutOverlapping();
    $schedule->job(new App\Jobs\PruneOldRecords())->dailyAt('03:00');
};
```

Add one cron entry on the server:

```text
* * * * * cd /path/to/app && php naluz schedule:run >> /dev/null 2>&1
```

```bash
php naluz schedule:list       # tasks and their next run
```

## 6. Test it

Use the `sync` driver in tests, or call the worker once:

```php
SendWelcomeEmail::dispatch($user->id);
// with queue.default=sync the job has already run; assert on ArrayTransport::$sent
```

## Security notes

- Payloads are encrypted with `APP_KEY`; rotating the key without `previous_keys` sends queued jobs to `failed_jobs`.
- Do not put secrets in job properties; pass IDs.
