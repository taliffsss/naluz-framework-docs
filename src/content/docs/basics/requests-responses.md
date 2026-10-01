---
title: "Requests and Responses"
description: "Read input, headers and files from PSR-7 requests, and build JSON, HTML and redirect responses."
---

NaluzPHP uses **PSR-7** objects (via `nyholm/psr7`). A request is a `Psr\Http\Message\ServerRequestInterface`; responses are
`Naluz\Http\Response`, which extends the Nyholm response, so every PSR-7 method is available.

## The request

Type-hint `ServerRequestInterface` in a controller to receive it:

```php
use Psr\Http\Message\ServerRequestInterface;

public function store(ServerRequestInterface $request)
{
    $request->getMethod();                    // 'POST'
    $request->getUri()->getPath();            // '/api/posts'
    $request->getHeaderLine('Accept');
    $request->getQueryParams();               // ?page=2
    $request->getUploadedFiles();             // PSR-7 uploaded files
    $request->getAttribute('route');          // the matched Naluz\Routing\Route
}
```

### Helpers

`Naluz\Http\Request` provides static helpers that take the request:

| Helper | Returns |
|---|---|
| `Request::input($request)` | query string and parsed body merged (the body wins) |
| `Request::body($request)` | the parsed body only: a form or JSON. Malformed JSON throws a `400` |
| `Request::bearerToken($request)` | the token from `Authorization: Bearer …`, or `null` |
| `Request::ip($request)` | the client address (`REMOTE_ADDR`) |
| `Request::expectsJson($request)` | true for `Accept: …json`, a JSON body, paths under `/api`, or `X-Requested-With: XMLHttpRequest` |
| `Request::wantsJsonBody($request)` | true when `Content-Type` contains `json` |

```php
$data = Validator::make(Request::input($request), ['title' => 'required'])->validate();
```

:::caution
`Request::ip()` returns `REMOTE_ADDR`. Behind a reverse proxy that is the proxy's address. Configure your web server to
restore the real client address (for example `mod_remoteip` or nginx `real_ip_module`) instead of trusting
`X-Forwarded-For` blindly.
:::

### Request attributes

Middleware attaches data to the request. For example `StartSession` adds `session`, and the JWT middleware adds
`auth.claims` and `auth.id`:

```php
$userId = $request->getAttribute('auth.id');
```

## Responses

```php
use Naluz\Http\Response;

Response::json($data, 201);                    // JSON, UTF-8, safe escaping for HTML contexts
Response::json($data, 200, ['X-Total' => '5']);
Response::html('<h1>Hello</h1>');
Response::redirect('/dashboard');              // 302; Response::redirect('/x', 301)
Response::noContent();                         // 204
```

Global helpers do the same and are shorter in route closures:

```php
json($data, 201);
response('plain text');
view('posts/show', ['post' => $post]);
redirect('/to');
```

`Response::redirect()` rejects targets containing CR or LF, so a user-supplied value cannot split headers.

Because responses are immutable PSR-7 objects, add headers with `withHeader()`:

```php
return Response::json($data)->withHeader('Cache-Control', 'max-age=60');
```

## Pagination in responses

A paginator returned from a controller is serialized as:

```json
{ "data": [ … ], "meta": { "total": 42, "per_page": 15, "current_page": 1, "last_page": 3 } }
```

`Paginator::links($url)` returns a PSR-13 link provider with the `first`, `prev`, `next` and `last` relations (RFC 8288 `Link` serialization).

## Validation failures

A `ValidationException` is rendered for you: `422` with `{message, errors}` for API/JSON clients, or a redirect back with
flashed errors and old input for browsers. See [Validation](../validation/).

## File uploads

Use `Naluz\Storage\Uploads::store()` for content-checked uploads. See [File storage](../../advanced/storage/).
