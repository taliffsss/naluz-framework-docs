---
title: "Release Notes"
description: "What changed in each NaluzPHP release."
---

NaluzPHP follows [semantic versioning](https://semver.org/). The framework core (`naluz/framework`) and the application
skeleton (`naluzphp-framework`) are released in step. Both are installed from Packagist; the skeleton requires
`"naluz/framework": "^1.2.2"`.

:::caution
Do not use `naluz/framework` **1.2.0 or 1.2.1**. Packagist indexed them at a commit without the GraphQL server. Use **1.2.2 or later**.
:::

| Version | Highlights |
|---|---|
| [v1.3.0](v1-3-0/) | Optional **event streaming**: Redis Streams, RabbitMQ and Kafka, consumer groups, retries, dead letters, signed messages |
| [v1.2.2](v1-2-2/) | The clean release of GraphQL and model observers; `Application::VERSION` now reports the real version |
| v1.2.1 | Superseded (see v1.2.2) |
| [v1.2.0](v1-2-0/) | Built-in **GraphQL** server; model **observers** (`Model::observe()`, `#[ObservedBy]`, `make:observer`) |
| v1.1.0 | Model observers, released on their own (included in v1.2.0) |
| [v1.0.0](v1-0-0/) | The first release: router, ORM, query builder, queues, mail, scheduler, storage, templates, security, SQL Server, NoSQL, model caching, read/write connections |

## Upgrading

```bash
composer update naluz/framework
```

The changelog with every change is kept in the repositories: [framework core](https://github.com/taliffsss/naluz-framework/blob/main/CHANGELOG.md)
and [application skeleton](https://github.com/taliffsss/naluzphp-framework/blob/master/CHANGELOG.md).
