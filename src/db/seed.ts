import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { users } from './schema'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ??
    'postgresql://orders_user:orders_pass@localhost:5432/orders_db',
})

const db = drizzle(pool)

async function seed() {
  console.log('Seeding...')

  await db
    .insert(users)
    .values({
      id:    '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      name:  'Test User',
    })
    .onConflictDoNothing()

  console.log('Done')
  await pool.end()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
