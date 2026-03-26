# Order Processing System

Учбовий проект для підготовки до технічного співбесіди.
Покриває весь AWS serverless стек з вакансії.

## Стек

| Категорія | Технологія |
|-----------|-----------|
| Runtime | Node.js 24 + TypeScript |
| Framework | Hono (Lambda + Node.js адаптери) |
| ORM | Drizzle ORM + drizzle-zod |
| Validation | Zod v4 |
| Database | PostgreSQL (Drizzle) + DynamoDB (idempotency) |
| Queue | SQS FIFO + DLQ |
| Orchestration | Step Functions (SAGA pattern) |
| Notifications | SNS + SQS |
| IaC | Terraform |
| Tests | Vitest (unit / integration / smoke) |
| CI/CD | GitHub Actions |
| Local AWS | LocalStack |

## Архітектура

```
Client
  └── API Gateway
        └── Lambda (Hono)
              ├── DynamoDB     — idempotency keys (TTL 24h)
              ├── PostgreSQL   — orders, users (Drizzle ORM)
              └── SQS FIFO     — async processing
                    └── Step Functions — SAGA
                          ├── Reserve inventory  (Lambda)
                          ├── Process payment    (Lambda)
                          │     └── [fail] → Release inventory (компенсація)
                          └── Send notification  (SNS → SQS → Lambda)
```

## Ключові технічні рішення

**Idempotency** — кожен `POST /orders` вимагає `Idempotency-Key` заголовок.
Перевіряємо DynamoDB перед обробкою. Захист від дублікатів при retry.

**SQS FIFO + MessageGroupId** — шардинг по `userId`.
Порядок замовлень гарантований в межах одного юзера.

**Composite index** — `(user_id, status, created_at DESC)`.
Покриває найчастіший запит без додаткового сортування.

**SAGA через Step Functions** — при помилці платежу
автоматично компенсуємо резерв інвентарю через `Catch`.

**Retry з exponential backoff + jitter** — уникаємо thundering herd
при тимчасових збоях зовнішніх сервісів.

**drizzle-zod** — Zod схеми генеруються зі схеми Drizzle.
Одне джерело правди — не дублюємо типи вручну.

## Швидкий старт

```bash
# 1. Встановити залежності
npm install

# 2. Запустити LocalStack + PostgreSQL
docker compose up -d

# 3. Згенерувати та застосувати міграції
npm run db:generate
npm run db:migrate

# 4. Запустити сервер
npm run dev
# → http://localhost:3000

# 5. Тести
npm test
```

## API

```
POST /orders
  Headers: Idempotency-Key: <uuid>
  Body: {
    userId: string (uuid),
    currency?: string (3 chars, default: "USD"),
    items: [{
      productId: string,
      name: string,
      quantity: number,
      unitPrice: number
    }]
  }

GET /orders/:id

GET /orders?userId=<uuid>&status=<pending|confirmed|cancelled>
```

## Terraform (LocalStack)

```bash
cd terraform
terraform init
terraform apply -var="environment=local"
```

## Drizzle команди

```bash
npm run db:generate   # згенерувати міграції зі schema.ts
npm run db:migrate    # застосувати міграції
npm run db:studio     # веб UI для перегляду даних
```

## Що покриває проект з вакансії

- TypeScript · Node.js · Hono
- AWS Lambda · API Gateway · SQS · SNS · DynamoDB · Step Functions
- PostgreSQL з composite та partial indexes
- Terraform (IaC)
- Idempotency pattern
- SAGA pattern з компенсацією
- Retry з exponential backoff + jitter
- Unit · Integration · Smoke тести
- CI/CD через GitHub Actions
- LocalStack для локальної розробки без AWS акаунту
