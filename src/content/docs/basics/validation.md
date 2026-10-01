---
title: "Validation"
description: "Validate input with rule strings, closures, wildcards and database rules."
---

```php
use Naluz\Validation\Validator;

$data = Validator::make(Request::input($request), [
    'title'  => 'required|string|max:200',
    'email'  => 'required|email|unique:users,email',
    'tags'   => 'array',
    'tags.*' => 'string|max:30',
])->validate();
```

`validate()` returns **only the fields that have rules**, so `Post::create($validator->validate())` cannot be polluted by extra
input. On failure it throws a `ValidationException`, which is rendered automatically (see below).

## API

| Method | Purpose |
|---|---|
| `Validator::make($data, $rules, $messages = [], $db = null)` | create a validator |
| `->validate()` | returns validated data or throws `ValidationException` |
| `->passes()` / `->fails()` | boolean checks |
| `->errors()` | `array<string, list<string>>` |
| `->validated()` | the validated subset |

## Available rules

| Rule | Passes when |
|---|---|
| `required` | present and not `null`, `''` or `[]` (`false`, `0` and `'0'` count as present) |
| `nullable`, `sometimes` | the field may be missing or empty; remaining rules are skipped |
| `string`, `integer`, `numeric`, `boolean`, `array` | the value has that type (`integer` accepts digit strings) |
| `email`, `url`, `date`, `uuid` | valid format (`url` must be http or https) |
| `alpha`, `alpha_num`, `alpha_dash` | Unicode letters, digits, dashes and underscores |
| `min:n`, `max:n`, `between:a,b` | size: string length, array count, or the number when the field is also `integer` / `numeric` |
| `in:a,b`, `not_in:a,b` | the value is (not) one of the list |
| `regex:/pattern/` | matches the pattern |
| `confirmed` | equals `<field>_confirmation` |
| `same:other`, `different:other` | equals / differs from another field |
| `unique:table,column,ignoreId,idColumn` | no row has this value (optionally ignoring one row) |
| `exists:table,column` | a row has this value |

An unknown rule throws `InvalidArgumentException`, so typos fail loudly instead of silently passing.

### Closures

A rule list may contain closures that return an error message, or `null` when valid:

```php
'code' => ['required', fn ($value, $field, $data) => $value === 'secret' ? null : 'Wrong code.'],
```

### Nested data and wildcards

Dotted paths (`address.city`) and `*` wildcards (`items.*.qty`) are supported.

## Database rules

`unique` and `exists` need a connection:

```php
Validator::make($input, [
    'email' => 'required|email|unique:users,email,' . $user->id,     // ignore the current user
], db: $db->connection());
```

These checks always read from the primary database, so replication lag cannot allow duplicates.

## Custom messages

```php
Validator::make($data, $rules, [
    'required' => 'Please fill in :field.',                 // per rule
    'title.max' => 'The title is too long (max :0).',       // per field and rule
]);
```

`:field` is the field name (underscores become spaces) and `:0`, `:1` are the rule parameters.

## What happens on failure

A `ValidationException` is converted by the exception handler:

- **JSON clients** (`Accept: application/json`, a JSON body, or `/api` paths): `422` with

  ```json
  { "message": "The given data was invalid.", "errors": { "title": ["The title field is required."] } }
  ```

- **Browsers:** a `303` redirect back to the previous page of the same site, with flashed `errors` and `old` input (fields whose names contain `password`, `_token` or `secret` are excluded).

Catch it yourself when you need custom handling:

```php
$validator = Validator::make($data, $rules);
if ($validator->fails()) {
    return Response::json(['problems' => $validator->errors()], 400);
}
```
