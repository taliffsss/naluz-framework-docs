---
title: "Event Streaming"
description: "Optional event-driven messaging between services over Redis Streams, RabbitMQ or Kafka: publish events, consume them in groups, retries, dead letters and signed messages."
---

:::note
Event streaming is available from **naluz/framework 1.3.0**. It is optional: nothing is connected or loaded until you use it, and
the default `memory` connection needs no server.
:::

Use event streaming when one part of your system announces that something happened (`orders.placed`) and other services react to it
(billing, email, analytics) without the publisher knowing who they are.

| | [Queues](../queues/) | Event streaming |
|---|---|---|
| Purpose | do slow work for *this* application later | announce facts to *other* services |
| Who consumes | one worker runs each job | **every consumer group** gets every event |
| Message format | encrypted `Job` payload | plain JSON envelope (optionally signed) |
| Backends | sync, database, Redis | Redis Streams, RabbitMQ, Kafka (and `memory` for tests) |

## Pick a broker

| Connection | Needs | Choose it when |
|---|---|---|
| `memory` | nothing | tests and local development (nothing survives the process) |
| `redis` | a Redis **6.2+** server, nothing else (the framework's own client) | you already run Redis and want the simplest durable option |
| `rabbitmq` | `composer require php-amqplib/php-amqplib` and a RabbitMQ server | you want routing with wildcards and a classic message broker |
| `kafka` | `ext-rdkafka` and a Kafka cluster | you need very high throughput, replay and ordering by key |

Set the connection in `.env`:

```ini
MESSAGING_CONNECTION=redis
MESSAGING_GROUP=billing          # this service's consumer group
```

All settings live in `config/messaging.php` (see [Configuration](../../reference/configuration/#messagingphp)).

## Publish an event

Inject the `EventBus` anywhere the container builds objects (controllers, jobs, subscribers):

```php
use Naluz\Messaging\EventBus;

final class OrderController
{
    public function store(Request $request, EventBus $bus): Response
    {
        $order = Order::create($request->validated());

        $bus->publish('orders.placed', ['order_id' => $order->id, 'total' => $order->total]);

        return Response::json($order, 201);
    }
}
```

Or give the event its own class and dispatch it:

```php
use Naluz\Messaging\PublishableEvent;

final class OrderPlaced implements PublishableEvent
{
    public function __construct(private readonly Order $order) {}

    public function topic(): string { return 'orders.placed'; }
    public function payload(): array { return ['order_id' => $this->order->id, 'total' => $this->order->total]; }
    public function key(): ?string { return 'order-' . $this->order->id; }   // events with one key stay in order (Kafka)
}

$bus->dispatch(new OrderPlaced($order));
```

Topic names may contain letters, digits, `.`, `_` and `-` (up to 200 characters). Payloads must be JSON-serialisable. **Do not put secrets
or personal data you would not log in an event**: every consumer group can read it.

:::caution
Publishing happens immediately. If you publish inside a database transaction, the consumer may receive the event before the transaction
commits. Publish after the commit.
:::

## Subscribe to events

```bash
php naluz make:subscriber SendReceipt
```

```php
namespace App\Subscribers;

use Naluz\Messaging\Message;
use Naluz\Messaging\Subscriber;

final class SendReceipt implements Subscriber
{
    public function __construct(private readonly Mailer $mailer) {}      // dependencies are injected

    public function handle(Message $message): void
    {
        $orderId = $message->payload['order_id'];
        // ...send the receipt. Throw to retry the message.
    }
}
```

Register it for a topic (or a pattern with `*`) in `config/messaging.php`:

```php
'subscribers' => [
    'orders.placed' => [\App\Subscribers\SendReceipt::class],
    'orders.*'      => [\App\Subscribers\AuditTrail::class],
],
```

`Message` gives you `id`, `topic`, `type`, `payload`, `headers`, `timestamp` and `attempts()`.

:::caution
Delivery is **at-least-once**: a message can arrive more than once (a consumer crashed before acknowledging it, or it was retried).
Make every subscriber idempotent, for example by recording the `message->id` you already handled or by using an upsert.
:::

## Run a consumer

```bash
php naluz messaging:consume orders.placed                      # as the group in MESSAGING_GROUP
php naluz messaging:consume orders.placed,payments.captured --group=billing
php naluz messaging:consume orders.placed --tries=5 --backoff=2 --max-messages=1000 --memory=128
php naluz messaging:consume orders.placed --stop-when-empty    # drain and exit (cron, tests)
```

| Option | Default | Meaning |
|---|---|---|
| `--group=` | `MESSAGING_GROUP` | consumer group |
| `--connection=` | `MESSAGING_CONNECTION` | which connection in `config/messaging.php` |
| `--tries=` | `3` | total attempts before a message is dead-lettered |
| `--backoff=` | `0` | seconds to wait before a retry, multiplied by the attempt number (max 30; the consumer pauses meanwhile) |
| `--max-messages=` | unlimited | exit after this many messages (let your supervisor restart it) |
| `--memory=` | `128` | exit when memory use passes this many MB |
| `--stop-when-empty` | off | exit when nothing arrives |

`SIGTERM` / `SIGINT` finish the current message first when the `pcntl` extension is installed. Run consumers under a supervisor,
the same way as [queue workers](../../tooling/deployment/): start several instances with the same group to share the work.

### Groups

Every **group** receives its own copy of every event, so `billing` and `email` both see `orders.placed`. Instances that use the *same*
group split the messages between them. Give each service its own group name.

## Retries and dead letters

When a subscriber throws:

1. The message is published again for **that group only**, with an incremented attempt counter (other groups are not affected).
2. After `--tries` attempts it is published to `<topic>.dlq` (for example `orders.placed.dlq`) with the headers `x-original-topic`,
   `x-failed-group`, `x-error` (class and message, truncated) and `x-attempts`. The original is acknowledged.

To inspect dead letters, subscribe to the `.dlq` topic like any other topic. To replay one, publish its payload to the original topic again.
Retries are published behind newer messages, so **a retried message can arrive out of order**.

If several subscribers are registered for a topic and one fails, the whole message is retried, including the subscribers that already
succeeded. Another reason to keep subscribers idempotent.

## Sign messages

By default the body is a plain JSON envelope that services written in any language can read and write:

```json
{"id":"…","type":"App\\Events\\OrderPlaced","topic":"orders.placed","timestamp":1700000000,"headers":{},"payload":{"order_id":7}}
```

Anyone who can write to your broker can publish. To make sure you only act on events from your own services, set the same key everywhere:

```ini
MESSAGING_SIGNING_KEY=use-a-long-random-secret
```

Messages are then wrapped with an HMAC-SHA256 signature, and unsigned or tampered messages are **dropped** (logged, acknowledged, never
handled). To rotate, deploy the new key in `signing_key` and move the old one to `previous_signing_keys` until all publishers have switched.
Signing authenticates messages; it does not encrypt them. Use TLS to the broker for confidentiality.

Other protections, always on: messages are only parsed as JSON (never unserialised), the `type` field is informational and is never turned
into an object, and bodies are limited to `max_bytes` (1 MiB) and 32 levels of nesting.

## Broker notes

### Redis Streams

- Needs Redis **6.2 or newer** (`XAUTOCLAIM`). Uses `config/redis.php` unless the connection sets its own `host`, `port`, `password`.
- A message a consumer received but never acknowledged is taken over by another consumer after `visibility_timeout` seconds (default 60).
  Keep it above your slowest subscriber or the message will run twice.
- `max_length` (default 100000) trims old entries from each stream. `start_id` is `'0'` by default, so a brand-new group replays the
  stream; use `'$'` for only new messages.

### RabbitMQ

- Install the client: `composer require php-amqplib/php-amqplib`.
- Events go to one durable `topic` exchange (`naluz.events`); each group gets a durable queue named `<group>.<topic>`. Subscribe with
  AMQP wildcards (`orders.*`, `orders.#`) if you like.
- RabbitMQ **drops a message when no queue is bound to its topic**. Run `php naluz messaging:declare orders.placed --group=billing`
  (or start the consumer once) *before* the first event is published.
- Messages are persistent. For quorum queues set `'queue_arguments' => ['x-queue-type' => ['S', 'quorum']]`. TLS: `'ssl' => true`.

### Kafka

- Needs `ext-rdkafka` (`pecl install rdkafka`, and `librdkafka`).
- The producer is idempotent with `acks=all` and waits for the broker to confirm each message. Consumers commit an offset only after the
  subscriber succeeded.
- Pass any librdkafka setting in `options`, for example SASL and TLS:

```php
'kafka' => [
    'driver' => 'kafka',
    'brokers' => env('KAFKA_BROKERS', '127.0.0.1:9092'),
    'options' => [
        'security.protocol' => 'SASL_SSL',
        'sasl.mechanisms' => 'PLAIN',
        'sasl.username' => env('KAFKA_USER'),
        'sasl.password' => env('KAFKA_PASSWORD'),
    ],
],
```

- Create topics ahead of time (or enable auto-creation on the cluster). Events with the same `key()` go to the same partition and stay in order.

## Test your code

The `memory` broker keeps everything in the process, so tests need no server:

```php
use Naluz\Messaging\BrokerManager;
use Naluz\Messaging\Brokers\MemoryBroker;
use Naluz\Messaging\Consumer;
use Naluz\Messaging\EventBus;

$broker = new MemoryBroker();
$app->make(BrokerManager::class)->extend('memory', $broker);
$broker->declare(['orders.placed'], 'billing');           // the group must exist before the event is published

$app->make(EventBus::class)->publish('orders.placed', ['order_id' => 7]);
$app->make(Consumer::class)->consumeOne(['orders.placed'], 'billing');   // "processed"
```

`consumeOne()` returns `processed`, `retried`, `dead`, `skipped` (no subscriber, or a retry meant for another group), `invalid`
(signature or format failure) or `null` when nothing arrived.

## Add another broker

Implement `Naluz\Messaging\Broker` (`publish`, `declare`, `receive` returning a `Delivery` whose `ack()` acknowledges it) and register it
with `$app->make(BrokerManager::class)->extend('name', new MyBroker())` in a [service provider](../providers/).

## What is tested

The memory broker and Redis Streams (against a real `redis-server`, including crash recovery) are covered end to end. The RabbitMQ and Kafka
drivers are tested against stand-ins for `php-amqplib` and `ext-rdkafka` because CI has no RabbitMQ or Kafka server, so run them against
your own broker in staging before you depend on them.
