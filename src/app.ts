import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { bearerAuth } from 'hono/bearer-auth'
import { HTTPException } from 'hono/http-exception'
import { ordersRouter } from './handlers/orders'

const app = new Hono()

app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

const apiKey = process.env.API_KEY || 'local-secret-key'

app.use('/orders', bearerAuth({ token: apiKey }))
app.use('/orders/*', bearerAuth({ token: apiKey }))
app.route('/orders', ordersRouter)

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse()

  console.error(err)
  return c.text('Internal Server Error', 500)
})

export default app
