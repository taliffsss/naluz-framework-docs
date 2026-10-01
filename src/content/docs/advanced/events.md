---
title: "Events and Observers"
description: "PSR-14 events and listeners, model events and observer classes."
---

NaluzPHP has two event systems that complement each other:

1. A **PSR-14 dispatcher** for your own application events.
2. **Model events** (`creating`, `saved` …), which you can group into **observer** classes.

## The event dispatcher

`Naluz\Events\Dispatcher` implements both `EventDispatcherInterface` and `ListenerProviderInterface` (PSR-14).

```php
use Naluz\Events\Dispatcher;

final class UserRegistered
{
    public function __construct(public readonly User $user) {}
}

$events = app(Dispatcher::class);

$events->listen(UserRegistered::class, function (UserRegistered $event) {
    logger('New user {id}', ['id' => $event->user->id]);
});

$events->dispatch(new UserRegistered($user));
```

- Listeners are matched on the event's class, its parent classes and the interfaces it implements.
- `dispatch()` returns the event object, so listeners can enrich it.
- If the event implements `Psr\EventDispatcher\StoppableEventInterface` and a listener stops propagation, later listeners are skipped.

Register listeners in a [service provider's](../providers/) `boot()` method. Inject
`Psr\EventDispatcher\EventDispatcherInterface` to dispatch events without the concrete class.

For slow listeners, dispatch a [queued job](../queues/) from the listener.

## Model events

Models fire `saving`, `saved`, `creating`, `created`, `updating`, `updated`, `deleting` and `deleted`:

```php
User::creating(fn (User $u) => $u->slug = Str::slug($u->name));
```

Returning `false` from a `-ing` listener cancels the operation.

On create the order is `saving → creating → created → saved`; on update `saving → updating → updated → saved`; on delete
`deleting → deleted`. Soft deletes also run the update events.

## Model observers

An observer groups the listeners for one model. Any **public method named after a model event** is called with the model.

```bash
php naluz make:observer UserObserver
```

```php title="app/Observers/UserObserver.php"
final class UserObserver
{
    /** Runs before INSERT. Returning false would cancel the save. */
    public function creating(User $user): void
    {
        $user->email = strtolower(trim((string) $user->email));
    }

    public function created(User $user): void
    {
        logger('User created', ['id' => $user->getKey()]);     // never log passwords or other secrets
    }

    public function deleted(User $user): void
    {
        logger('User deleted', ['id' => $user->getKey()]);
    }
}
```

Attach it in one of two ways:

```php
// 1. declaratively, on the model (inherited by child models)
#[ObservedBy(UserObserver::class)]
class User extends Model {}

// 2. from a service provider
User::observe(UserObserver::class);        // a class name, an object, or a list of them
```

- Class names are built **lazily** on the first event, through the container, so constructor dependencies are injected. One
  instance is reused per model class.
- Attaching the same observer twice is ignored. An unknown class throws `InvalidArgumentException`.
- `Model::flushEventListeners()` removes every listener and observer (useful in tests).
- Observers run on **model instances only**. Bulk query writes (`Post::where(…)->update([…])`) do not fire model events, the same
  as closure listeners.

The skeleton includes `UserObserver` (attached with `#[ObservedBy]`) and `PostObserver` (attached from `ObserverServiceProvider`).
