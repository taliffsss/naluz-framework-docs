---
title: "Migrations"
description: "Version your schema with migrations and the fluent schema builder."
---

Migrations are PHP files in `database/migrations/`, run in filename order and recorded in a `migrations` table.

```bash
php naluz make:migration create_orders_table
php naluz migrate | migrate:rollback --step=2 | migrate:status
```

```php
return new class extends Migration {
    public function up(Schema $schema): void
    {
        $schema->create('orders', function ($t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('number', 32)->unique();
            $t->decimal('total', 10, 2)->default(0);
            $t->boolean('paid')->default(false);
            $t->json('meta')->nullable();
            $t->timestamps();
            $t->softDeletes();
            $t->index(['user_id', 'paid']);
        });
    }
    public function down(Schema $schema): void { $schema->dropIfExists('orders'); }
};
```

Column types: `id string text integer bigInteger boolean decimal float json date timestamp foreignId`.
Modifiers: `nullable() default() unsigned() unique() index() useCurrent() constrained() cascadeOnDelete()`.
`Schema::table()` adds columns / drops columns / adds indexes to existing tables. Migrations run inside a transaction
on PostgreSQL and SQLite (MySQL implicitly commits DDL).
