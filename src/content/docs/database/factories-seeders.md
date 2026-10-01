---
title: "Factories and Seeders"
description: "Generate test and development data with model factories and database seeders."
---

```bash
php naluz make:factory PostFactory        php naluz make:seeder PostSeeder
php naluz db:seed [--class=Database\Seeders\DatabaseSeeder]      php naluz migrate:fresh --seed
```

```php
// database/factories/PostFactory.php
final class PostFactory extends Factory
{
    protected string $model = Post::class;

    public function definition(): array
    {
        return [
            'user_id' => UserFactory::new(),                 // nested factories are created and their id used
            'title'   => ucfirst($this->fake()->words(4)),
            'body'    => $this->fake()->paragraph(),
        ];
    }
    public function published(): static { return $this->state(['published' => true]); }
}

// models: `use HasFactory;`
User::factory()->create();                                   // persisted        ->make() = not persisted
Post::factory(5)->published()->create(['user_id' => 1]);     // 5 rows with overrides
Post::factory()->state(fn (array $a) => ['title' => strtoupper($a['title'])])->afterCreating(fn ($p) => …)->create();

// database/seeders/DatabaseSeeder.php
public function run(): void { User::factory(10)->create(); $this->call([PostSeeder::class]); }
```

`Naluz\Support\Fake` is a small built-in generator (names, emails, words/sentences, uuid, dates, numbers…);
`Fake::seed(42)` makes data reproducible. Factories use `forceFill()` (trusted code, `$fillable` doesn't apply).
`migrate:fresh` and `db:seed` refuse to run in production without `--force`.
