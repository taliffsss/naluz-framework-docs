---
title: "Views and Templates"
description: "The built-in compiled, auto-escaping template engine: syntax, layouts, forms and caching."
---

NaluzPHP has its own template engine. Files named `*.naluz.php` are **compiled to plain PHP once** and the compiled file is
cached in `storage/cache/views`, so rendering runs at native PHP speed. Every `{{ }}` echo is **HTML-escaped automatically**,
so the "forgot to escape" mistake of plain PHP views cannot happen unless you type `{!! !!}`.

Views live in `resources/views/<name>.naluz.php`. Plain `*.php` views (using `$this->e()`) still work; `*.naluz.php` wins
when both exist.

## Rendering

```php
return view('posts/show', ['post' => $post]);          // global helper → Response
return view('errors/custom', [], 404);                  // with a status
```

## Syntax

```text
{{ $user->name }}              escaped output (htmlspecialchars, UTF-8, quotes encoded)
{!! $html !!}                  raw output: only for HTML you generated and trust
{{ $a ?? 'default' }}          any PHP expression
{{-- not rendered --}}         comment
@{{ literal }}   @@if          prints "{{ literal }}" / "@if" as-is
```

### Control structures

```text
@if ($n > 5) … @elseif ($n > 1) … @else … @endif
@unless ($ok) … @endunless          @isset($x) … @endisset          @empty($list) … @endempty
@foreach ($posts as $post) … @endforeach        @for (…) … @endfor        @while (…) … @endwhile
@forelse ($posts as $post) … @empty no posts @endforelse
@break  @continue  @switch / @case / @default / @endswitch
@auth … @endauth       @guest … @endguest
@php $x = compute(); @endphp
```

Directives may be followed immediately by `(` and nested parentheses are fine: `@if (in_array($x, [1, (2)]))`. Things that merely look
like directives (`@media` in CSS, `dev@example.com`) are left alone.

### Layouts

```blade
{{-- resources/views/layouts/app.naluz.php --}}
<title>@yield('title', 'My site')</title>
<body>@yield('content') @stack('scripts')</body>

{{-- resources/views/posts/show.naluz.php --}}
@extends('layouts/app')
@section('title', $post->title)            {{-- inline sections are escaped for you --}}
@section('content')
    <h1>{{ $post->title }}</h1>
    @include('partials/comments', ['comments' => $post->comments])
@endsection
@push('scripts') <script src="/js/post.js"></script> @endpush
```

`@include` passes the current variables plus any you give it.

### Forms and data

```blade
<form method="POST" action="/posts/1">
    @csrf                       {{-- hidden _token input --}}
    @method('PUT')              {{-- hidden _method (PUT, PATCH or DELETE only) --}}
</form>
<script>const data = @json($payload);</script>   {{-- safe in HTML, attributes and <script> --}}
```

## Validation errors and old input

When validation fails for a browser request, the framework redirects back with flashed `errors` and `old` input. Passwords
are excluded. Read them from the session:

```php
$errors = app(Naluz\Session\Store::class)->get('errors');
```

## Error pages

Create `resources/views/errors/{status}.naluz.php` (for example `404.naluz.php` or `500.naluz.php`). It receives `$status` and
`$message`. Without a custom page, a minimal built-in HTML page is shown. See [Error handling](../errors/).

## Caching and deployment

- **Development (`APP_ENV` not production):** templates are recompiled when their *content* changes (content-hash keyed, so even
  a same-second edit is picked up) and superseded compiled files are deleted.
- **Production:** compiled files are trusted and never re-checked (no `stat` or hash per request). Run
  `php naluz view:clear` as part of each deploy.

Compiled files are written atomically (temp file and rename), so concurrent requests never read a half-written template.

## Security notes

- Template source is trusted code, like any PHP file. Never build templates from user input.
- `{!! !!}` and `@yield` / `@stack` output are unescaped: sections contain already-rendered template output.
- View names are validated (`[A-Za-z0-9_./-]`, no `..`), so `view($request->input('page'))` cannot traverse the filesystem.

## Extending

`Naluz\View\Compiler` is a small class: add directives to its tables, or subclass `View\Factory` and bind your own in a
[service provider](../../advanced/providers/).
