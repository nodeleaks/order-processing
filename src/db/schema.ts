import { pgTable, uuid, varchar, numeric, jsonb, timestamp, index } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:        uuid('id').primaryKey().defaultRandom(),
  email:     varchar('email', { length: 255 }).notNull().unique(),
  name:      varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const orders = pgTable(
  'orders',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    userId:      uuid('user_id').notNull().references(() => users.id),
    status:      varchar('status', { length: 50 }).notNull().default('pending'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    currency:    varchar('currency', { length: 3 }).notNull().default('USD'),
    items:       jsonb('items').notNull().default([]),
    createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Composite index
    index('idx_orders_user_status_date')
      .on(table.userId, table.status, table.createdAt),
  ]
)

export type User  = typeof users.$inferSelect
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
