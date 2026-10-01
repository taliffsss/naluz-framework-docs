---
title: "Service Container"
description: "Dependency injection with autowiring, bindings, singletons and aliases, built on PSR-11."
---

The service container (`Naluz\Container\Container`) builds objects and their dependencies. It implements **PSR-11**
(`Psr\Container\ContainerInterface`). The `Application` itself is the container, and you can reach it with the `app()` helper.

## Autowiring

If a class has no special needs you do not register anything. The container reads constructor type hints and builds the
dependencies recursively:

```php
final class InvoiceService
{
    public function __construct(
        private readonly Naluz\Database\DatabaseManager $db,
        private readonly Psr\Log\LoggerInterface $logger,
    ) {}
}

$service = app(InvoiceService::class);        // fully constructed
```

Controllers, middleware, jobs and console commands are resolved the same way, so type-hint what you need.

- A circular dependency throws a `ContainerException`.
- An interface or abstract class must be bound first (otherwise `NotFoundException` / `ContainerException`).
- Parameters with defaults or nullable types are optional.

## Binding

Bind in a [service provider](../providers/):

```php
public function register(): void
{
    // a new instance every time
    $this->app->bind(ReportBuilder::class, fn ($c) => new ReportBuilder($c->make(Connection::class)));

    // one shared instance, created on first use
    $this->app->singleton(Mailer::class, fn ($c) => new SmtpMailer(config('mail.smtp.host')));

    // an existing object
    $this->app->instance(Clock::class, new FrozenClock());

    // interface → implementation
    $this->app->bind(PaymentGateway::class, StripeGateway::class);

    // alias
    $this->app->alias('mailer', Mailer::class);
}
```

| Method | Purpose |
|---|---|
| `bind($abstract, $concrete = null, $shared = false)` | register a factory or class |
| `singleton($abstract, $concrete = null)` | like `bind` but shared |
| `instance($abstract, $object)` | register an existing object |
| `alias($alias, $abstract)` | another name for a binding |
| `has($id)` | is it registered or resolvable? |
| `get($id)` / `make($abstract, $parameters = [])` | resolve; `make` accepts named constructor overrides |
| `build($class, $parameters = [])` | build a class directly, ignoring bindings |
| `call($callable, $parameters = [])` | call any callable with injected arguments |

## Calling with injection

```php
$result = app()->call([ReportController::class, 'show'], ['id' => 5]);
$result = app()->call(fn (UserRepository $users, int $id) => $users->find($id), ['id' => 5]);
```

Values in the second argument are matched to parameters by name. Strings are cast to the declared scalar type: `int`, `float`
or `bool`. A non-numeric string for an `int` or `float` parameter throws a `404` `HttpException`, which is why bad route
parameters return 404.

## What the framework binds for you

| You can type-hint | You get |
|---|---|
| `Psr\Log\LoggerInterface` | the `LogManager` |
| `Psr\SimpleCache\CacheInterface` | the cache selected by `CACHE_DRIVER` |
| `Psr\Cache\CacheItemPoolInterface` | a PSR-6 pool over that cache |
| `Psr\Clock\ClockInterface` | a clock using `app.timezone` |
| `Psr\Http\Client\ClientInterface` | the Guzzle client |
| `Psr\Http\Message\RequestFactoryInterface`, `StreamFactoryInterface` | Nyholm PSR-17 factories |
| `Psr\EventDispatcher\EventDispatcherInterface`, `ListenerProviderInterface` | the event dispatcher |
| `Naluz\Config\Repository` | configuration |
| `Naluz\Database\DatabaseManager`, `Naluz\Database\Connection` | database access |
| `Naluz\Routing\Router` | the router |
| `Naluz\Session\Store` | the session (inside web requests) |
| `Naluz\Security\Encrypter`, `Hasher`, `Jwt` | security services |
| `Naluz\View\Factory` | the template engine |
| `Naluz\Queue\QueueManager`, `Naluz\Schedule\Schedule` | queues and the scheduler |
| `Naluz\Database\ModelCache` | the model query cache |
| `Naluz\NoSql\NoSqlManager`, `Naluz\NoSql\DocumentStore` | document stores |
| `Naluz\Mail\Mailer`, `Naluz\Storage\StorageManager`, `Naluz\Http\Client\Http` | mail, storage, HTTP client |

## Swapping an implementation

```php
$this->app->singleton(Psr\SimpleCache\CacheInterface::class, fn () => new MyRedisCache());
```

Everything that asks for the interface now receives your class. See [Packages and extending](../packages/).
