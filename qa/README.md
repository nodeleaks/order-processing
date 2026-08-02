# order-processing — API test suite (Playwright)

Contract/API-level test suite for the `order-processing` service, separate from the
Vitest unit/integration/smoke tests in the repo root. This suite is meant to be run
against a **running instance** of the API — either local (`npm run local`) or the
deployed dev environment — and focuses on:

- Response contract validation (Zod schemas), not just spot-checking a couple of fields
- Idempotency semantics (replay, distinct keys)
- Input validation edge cases (negative/zero quantities, missing fields, malformed JSON)
- Auth (missing/invalid bearer token) across every protected route
- Filtering/query param behavior on `GET /orders`

## Why a separate workspace

Keeping this in its own `package.json` avoids adding Playwright/Allure as dependencies
of the Lambda bundle, and lets this suite evolve independently (e.g. add a browser-based
layer later) without touching `vitest.config.ts` or the esbuild build in CI.

## Setup

```bash
cd qa
npm install
npx playwright install --with-deps chromium   # only needed for the request context binaries
cp .env.example .env
```

## Running

Against a locally running server (`npm run local` in the repo root, on port 3000):

```bash
npm test
```

Against the deployed dev environment:

```bash
API_URL=$(terraform -chdir=../terraform output -raw api_url) API_KEY=<dev api key> npm test
```

## Reports

- HTML: `npm run test:report`
- Allure: `npm run allure:generate && npm run allure:open`

## Structure

```
qa/
  src/
    api-clients/     # POM-style API clients (OrdersApiClient etc.)
    fixtures/         # custom Playwright test() with injected clients
    schemas/          # Zod schemas used to validate response contracts
    utils/            # test data factories
  tests/              # spec files, one concern per file
```
