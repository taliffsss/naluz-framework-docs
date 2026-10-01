---
title: "Encryption and Hashing"
description: "Encrypt values with XChaCha20-Poly1305, hash passwords with Argon2id and rotate keys."
---

## Hashing passwords

`Naluz\Security\Hasher` uses **Argon2id** (bcrypt if Argon2 is unavailable).

```php
use Naluz\Security\Hasher;

$hash = $hasher->make('secret');
$hasher->check('secret', $hash);        // true
$hasher->needsRehash($hash);            // true when the parameters changed
```

The `hashed` model cast hashes on assignment, and `Auth::attempt()` rehashes when needed.

## Encrypting data

`Naluz\Security\Encrypter` uses **XChaCha20-Poly1305** with `APP_KEY`:

```php
use Naluz\Security\Encrypter;

$token = $encrypter->encryptString('secret');
$encrypter->decryptString($token);          // 'secret'

$payload = $encrypter->encrypt(['id' => 5]);    // any JSON-serializable value
$encrypter->decrypt($payload);
```

A wrong key or tampered payload throws `Naluz\Security\DecryptException`; data is never returned unauthenticated.

For sensitive database columns use the `encrypted` cast:

```php
protected array $casts = ['api_key' => 'encrypted'];
```

Encrypted columns cannot be searched in SQL.

## Keys

```bash
php naluz key:generate           # APP_KEY
php naluz key:generate --jwt     # also JWT_SECRET
php naluz key:generate --show    # print instead of writing .env
```

`APP_KEY` must be 32 bytes (`base64:` prefixed). Rotate it without losing data by listing old keys in
`config/app.php`:

```php
'key' => env('APP_KEY'),
'previous_keys' => ['base64:the-old-key'],
```

Decryption tries the current key first, then each previous key. New encryption always uses the current key.

## What uses `APP_KEY`

- the `encrypted` cast
- queue payloads
- optional model-cache encryption (`MODEL_CACHE_ENCRYPT=true`)

:::caution
Changing `APP_KEY` without adding the old one to `previous_keys` makes existing encrypted data unreadable and sends queued jobs
to the failed-jobs table.
:::
