---
title: "Sessions"
description: "Server-side sessions with file, array and Redis drivers, flash data and the session cookie."
---

Sessions are available on routes in the `web` group (the `StartSession` middleware). API routes are stateless and have no
session.

```php
use Naluz\Session\Store;

$session = app(Store::class);
$session->put('cart', ['id' => 5]);
$session->get('cart');                // value or default: get('x', 'default')
$session->has('cart');
$session->pull('cart');               // get and remove
$session->forget('cart');
$session->flash('notice', 'Saved');   // available on the next request only
$session->all();
$session->regenerate();               // new ID, same data (do this on login)
$session->invalidate();               // destroy everything
```

Inside a request you can also read the session from the request attribute: `$request->getAttribute('session')`.

## Drivers

Set `SESSION_DRIVER` (`config/session.php`):

| Driver | Storage |
|---|---|
| `file` (default) | `storage/sessions` |
| `redis` | Redis, using the framework's own client |
| `array` | memory, per process (tests) |

## The cookie

| Option | Default | Notes |
|---|---|---|
| `cookie` | `naluz_session` | cookie name |
| `lifetime` | `7200` | seconds |
| `secure` | automatic | the `Secure` flag is set on HTTPS requests; force it with `SESSION_SECURE=true` |
| `same_site` | `Lax` | |

The cookie is always `HttpOnly`.

## Security properties

- Session IDs are 160 bits of randomness (40 hex characters).
- An ID that the server does not know is **replaced**, never adopted, which prevents session fixation.
- `Auth::login()` regenerates the ID.
- Data is stored as **JSON**, never PHP-serialized, so a tampered store cannot trigger object injection.

See [Authentication](../../security/authentication/) and [Security protections](../../security/protections/).
