---
title: "Release Notes"
description: "What changed in each NaluzPHP release."
---

NaluzPHP follows [semantic versioning](https://semver.org/). The framework core (`naluz/framework`) and the application
skeleton (`naluzphp-framework`) are versioned together.

| Version | Highlights |
|---|---|
| [v1.2.0](v1-2-0/) | Built-in **GraphQL** server; model **observers** (`Model::observe()`, `#[ObservedBy]`, `make:observer`) |
| v1.1.0 | Model observers, released on their own (included in v1.2.0) |
| [v1.0.0](v1-0-0/) | The first release: router, ORM, query builder, queues, mail, scheduler, storage, templates, security, SQL Server, NoSQL, model caching, read/write connections |

## Upgrading

```bash
composer update naluz/framework
```

The changelog with every change is kept in the repositories: [framework core](https://github.com/taliffsss/naluz-framework/blob/main/CHANGELOG.md)
and [application skeleton](https://github.com/taliffsss/naluzphp-framework/blob/master/CHANGELOG.md).
