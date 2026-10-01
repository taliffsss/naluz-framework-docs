---
title: "Service Providers"
description: "Register bindings and boot your application's services in service providers, with samples."
---

A provider is where you wire things into the container. Extend `Naluz\Foundation\ServiceProvider`.

```bash
php naluz make:provider PaymentServiceProvider
```

```php title="app/Providers/AppServiceProvider.php"
namespace App\Providers;

use App\Models\Post;
use App\Models\User;
use App\Services\Greeter;
use Naluz\Config\Repository;
use Naluz\Database\Orm\Model;
use Naluz\Foundation\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // A shared instance, built on first use.
        $this->app->singleton(Greeter::class, fn ($c) => new Greeter((string) $c->make(Repository::class)->get('app.name', 'NaluzPHP')));
    }

    public function boot(): void
    {
        // Short names for polymorphic relations instead of class names in the database.
        Model::morphMap(['user' => User::class, 'post' => Post::class]);
    }
}
```

| Method | When it runs | Use it to |
|---|---|---|
| `register()` | while providers are being loaded | **bind** services into the container. Do not resolve other services here |
| `boot()` | after every provider has registered | do work that needs other services: attach observers, register routes, set defaults |

`$this->app` is the application (the container).

## Registering providers

List your providers in `config/app.php`:

```php
'providers' => [
    App\Providers\AppServiceProvider::class,
    App\Providers\ObserverServiceProvider::class,
],
```

Providers from Composer packages are discovered automatically (see [Packages](../packages/)).

The framework's own providers load first: core services, queues, mail, storage, scheduler, model cache, NoSQL and GraphQL. Then
discovered package providers, then yours.

## Sample: attaching observers

```php title="app/Providers/ObserverServiceProvider.php"
final class ObserverServiceProvider extends ServiceProvider
{
    /** @var array<class-string<Model>, class-string> model => observer */
    protected array $observers = [
        Post::class => PostObserver::class,
    ];

    public function boot(): void
    {
        foreach ($this->observers as $model => $observer) {
            $model::observe($observer);
        }
    }
}
```

See [Events and observers](../events/#model-observers).

## Sample: registering routes from a package

```php
public function boot(): void
{
    $router = $this->app->make(Naluz\Routing\Router::class);
    $router->get('/blog', [BlogController::class, 'index']);
}
```
