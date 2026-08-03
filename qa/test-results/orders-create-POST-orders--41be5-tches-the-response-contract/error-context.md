# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-create.spec.ts >> POST /orders — create order >> creates an order and matches the response contract
- Location: tests/orders-create.spec.ts:6:3

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/orders
    - user-agent: Playwright/1.61.1 (arm64; macOS 26.5) node/24.18
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json
    - Authorization: Bearer local-secret-key
    - Idempotency-Key: 2e807057-a61e-4e8a-ab28-3b246cc77847
    - content-length: 151

```