---
title: "Packages and Extending"
description: "Build reusable packages with auto-discovered service providers, and extend the framework."
---

A NaluzPHP package is an ordinary Composer package. To be picked up automatically after `composer require`, list your
service providers in its `composer.json`:

```json
{
  "name": "acme/blog",
  "require": { "naluz/framework": "^1.2" },
  "autoload": { "psr-4": { "Acme\\Blog\\": "src/" } },
  "extra": { "naluz": { "providers": ["Acme\\Blog\\BlogServiceProvider"] } }
}
```

```php
final class BlogServiceProvider extends Naluz\Foundation\ServiceProvider
{
    public function register(): void { $this->app->singleton(Blog::class, fn ($c) => new Blog($c->make(Connection::class))); }
    public function boot(): void
    {
        $router = $this->app->make(Naluz\Routing\Router::class);
        $router->get('/blog', [BlogController::class, 'index']);
    }
}
```

Packages can ship middleware (any PSR-15 middleware works), routes, migrations (run them with `Migrator` pointed at your path), model factories, jobs and event listeners. The `naluz` command has a fixed set of commands today, so packages cannot add CLI commands.

## Controlling discovery

- Opt a package out in your app's `composer.json`: `"extra": {"naluz": {"dont-discover": ["acme/blog"]}}`
  (or `['*']` for none), or set `app.dont_discover` in `config/app.php`.
- Only classes extending `ServiceProvider` are ever instantiated from package metadata; anything else is ignored.

## Community

Contribution guidelines, a code of conduct and a security policy live in the [application repository](https://github.com/taliffsss/naluzphp-framework). Publish packages with the `naluz` keyword on Packagist so they are easy to find.


## Extending the framework

- Swap any service by binding it in a [service provider](../providers/): `$this->app->singleton(CacheInterface::class, fn () => new MyRedisCache())`.
- Use any PSR-15 middleware from Packagist in route or global stacks.
- Add database drivers by extending `Query\Grammar` and `Schema\Schema` and registering a factory.
- Implement `Naluz\Mail\Transport` for another mail provider, `Naluz\Storage\Filesystem` for another disk, or `Naluz\Log` channels through a `custom` driver.
