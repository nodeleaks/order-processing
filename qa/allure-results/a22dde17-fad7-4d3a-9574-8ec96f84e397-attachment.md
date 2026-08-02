# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-auth.spec.ts >> Bearer auth on /orders endpoints >> GET /orders/:id without Authorization header returns 401
- Location: tests/orders-auth.spec.ts:11:3

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3000
Call log:
  - → GET http://localhost:3000/orders/e84fd73d-cf28-40e7-b659-544e12304511
    - user-agent: Playwright/1.61.1 (arm64; macOS 26.5) node/24.18
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json

```