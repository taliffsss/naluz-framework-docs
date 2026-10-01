---
title: "Authentication"
description: "Session login for browsers and JWT bearer tokens for APIs, plus the guards that protect routes."
---

NaluzPHP provides two authentication styles:

| Style | Use for | Middleware |
|---|---|---|
| Session (cookie) | browser applications on `web` routes | `auth` |
| JWT bearer token | APIs, mobile clients, GraphQL on `api` routes | `jwt` (or `jwt.optional`) |

## Configuration

```php title="config/auth.php"
return [
    'model'      => App\Models\User::class,
    'username'   => 'email',        // the column to look users up by
    'password'   => 'password',     // the hashed password column
    'login_path' => '/login',       // where the `auth` middleware sends browsers
];
```

Hash passwords with the `hashed` cast so they are hashed on assignment:

```php
protected array $casts = ['password' => 'hashed'];
```

## Session authentication

Inject `Naluz\Auth\Auth`:

```php
use Naluz\Auth\Auth;

public function login(ServerRequestInterface $request, Auth $auth): Response
{
    $credentials = Validator::make(Request::input($request), [
        'email' => 'required|email',
        'password' => 'required',
    ])->validate();

    if (!$auth->attempt($credentials)) {
        throw new HttpException(401, 'Invalid credentials.');
    }
    return Response::redirect('/dashboard');
}
```

| Method | Purpose |
|---|---|
| `attempt(array $credentials)` | look up the user, verify the password, log in. Returns `bool` |
| `login(Model $user)` | log a user in (regenerates the session ID) |
| `logout()` | invalidate the session |
| `check()` / `guest()` | is someone logged in? |
| `user()` | the user model, or `null` |
| `id()` | the user's key, or `null` |

Details that matter for security:

- `attempt()` always spends hashing time, even for unknown emails, so response timing does not reveal which accounts exist.
- It rehashes the stored hash automatically when the hashing parameters change.
- `login()` regenerates the session ID, which prevents session fixation.

### Protecting routes

```php
$router->get('/dashboard', …)->middleware('auth');
```

Unauthenticated browsers are redirected to `auth.login_path`. JSON clients receive `401`.

In templates use `@auth … @endauth` and `@guest … @endguest`.

:::danger
Use cookie-session authentication only on `web` routes. `api` routes are cookie-less and have no CSRF protection.
:::

Apply a tight rate limit to the login route: `->middleware('throttle:5,1')`.

## JWT bearer tokens

Set `JWT_SECRET` (at least 32 characters) and issue tokens with `Naluz\Security\Jwt`:

```php
use Naluz\Security\Jwt;

public function token(Jwt $jwt, User $user): array
{
    return ['token' => $jwt->encode(['sub' => $user->id], ttl: 900)];     // 15 minutes
}
```

Protect routes with the `jwt` middleware. The caller's ID and claims are available as request attributes:

```php
$router->get('/me', fn (ServerRequestInterface $req) => User::find($req->getAttribute('auth.id')))->middleware('jwt');

$claims = $request->getAttribute('auth.claims');      // array
$userId = $request->getAttribute('auth.id');          // the `sub` claim
```

A missing token returns `401 Missing bearer token.`; an invalid or expired token returns `401 Invalid or expired token.` with a
`WWW-Authenticate` header.

### Optional authentication

The skeleton's `jwt.optional` middleware (`App\Http\Middleware\OptionalJwt`) sets the attributes when a valid token is sent and
lets anonymous requests through. The GraphQL endpoint uses it so queries can be public while mutations require a user.

### Token properties

- HS256 only; the algorithm is pinned, so `alg: none` and algorithm-switching attacks fail.
- The signature is compared with `hash_equals`.
- `exp` is required; `nbf` and the issuer (`security.jwt.issuer`) are validated, with a small leeway.
- Tokens are stateless. For refresh tokens or revocation, store a token ID (`jti`) server-side.

```php title="config/security.php"
'jwt' => ['secret' => env('JWT_SECRET', ''), 'issuer' => env('APP_URL'), 'leeway' => 10],
```
