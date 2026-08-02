import { test as base } from '@playwright/test'
import { OrdersApiClient } from '../api-clients/OrdersApiClient'

interface Fixtures {
  ordersApi: OrdersApiClient
}

export const test = base.extend<Fixtures>({
  ordersApi: async ({ request }, use) => {
    await use(new OrdersApiClient(request))
  },
})

export { expect } from '@playwright/test'
