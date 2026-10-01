---
title: "Testing"
description: "Test your application with PHPUnit and a base class that boots the real framework."
---

NaluzPHP uses **PHPUnit**. The skeleton includes a `Naluz\Tests\TestCase` base class that boots the real application against
in-memory SQLite, runs your migrations and gives you request helpers that go through the **whole** middleware stack.

```bash
vendor/bin/phpunit                          # everything
vendor/bin/phpunit --testsuite Database     # one suite
vendor/bin/phpunit --filter testEagerLoading
```

## Writing tests

```php
use Naluz\Tests\TestCase;

final class ArticleApiTest extends TestCase
{
    public function testCreate(): void
    {
        $r = $this->json('POST', '/api/articles', ['title' => 'Hi', 'body' => '…']);

        $this->assertSame(201, $r->getStatusCode());
        $this->assertSame('Hi', $this->decode($r)['title']);
        $this->assertSame(1, Article::count());
    }
}
```

### Helpers

| Helper | Purpose |
|---|---|
| `get($uri, $headers = [])` | send a GET request |
| `json($method, $uri, $data, $headers)` | send a JSON body |
| `form($method, $uri, $data, $headers)` | send form data |
| `send($request)` | send any PSR-7 request |
| `decode($response)` | decode a JSON response |
| `routes(fn, $group)` | register extra routes for one test |
| `db()` | the database connection |
| `queries(fn)` | collect every SQL statement executed while the callback runs |

A cookie jar keeps sessions between requests inside one test. Override `configOverrides()` to change configuration for a test class,
and `migrate()` to skip migrations.

### Counting queries (guarding against N+1)

```php
$sql = $this->queries(fn () => $this->get('/api/posts'));
$this->assertLessThanOrEqual(3, count($sql));
```

### Dates, queues and mail

- Use `FrozenClock` (PSR-20) for time-dependent code.
- Set `queue.default = sync` to run jobs inline, or use the `database` driver and `Worker::runNextJob()`.
- The `array` mail transport keeps messages in `ArrayTransport::$sent` for assertions.
- The `array` cache and session drivers keep state in memory.

## What the framework's own suite covers

The skeleton's suite runs against the real framework and covers: the container and support helpers; the query builder, schema
builder and ORM (including SQL-injection attempts, N+1 assertions, soft deletes and events); HTTP behavior (REST CRUD, status
codes, error rendering, views, form-method override); security (CSRF, session cookies, JWT forgery, CORS, headers, rate limiting,
open redirects, XSS escaping, encryption tamper detection, log forging, traversal); the console and generators; queues (one
contract run against the database **and** a real Redis server); mail (including header-injection attacks); storage and uploads;
the scheduler; NoSQL stores; the GraphQL engine and endpoint; and model observers.

Security-critical tests were checked by breaking the behavior on purpose (disabling CSRF validation, identifier validation or
JWT signature checks) and confirming that tests fail.

## Redis tests

Redis-backed tests (cache, sessions, queue) start a throw-away `redis-server` on a random port and are **skipped** when the binary
is not installed (`apt install redis-server`).

## Other databases

The default suite uses SQLite for speed. To check MySQL, PostgreSQL or SQL Server, point `configOverrides()` at a server and run
the Database suite against it. This is not part of the default CI.

## Coding standard

```bash
vendor/bin/phpcs         # PSR-12 (config: phpcs.xml.dist); line length is a soft-limit warning
vendor/bin/phpcbf        # auto-fix
```
