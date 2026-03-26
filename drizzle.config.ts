import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:    './src/db/schema.ts',
  out:       './drizzle',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://orders_user:orders_pass@localhost:5432/orders_db',
  },
})
