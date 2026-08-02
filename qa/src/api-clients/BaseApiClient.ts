import { APIRequestContext, APIResponse } from '@playwright/test'

export interface ApiClientOptions {
  apiKey?: string
}

/**
 * Thin wrapper around Playwright's request context.
 * Centralizes auth header injection so individual clients
 * (OrdersApiClient etc.) only deal with domain methods, not headers.
 */
export class BaseApiClient {
  protected readonly request: APIRequestContext
  protected readonly apiKey: string

  constructor(request: APIRequestContext, options: ApiClientOptions = {}) {
    this.request = request
    this.apiKey = options.apiKey ?? process.env.API_KEY ?? 'local-secret-key'
  }

  protected authHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      ...extra,
    }
  }

  protected async parseJson(response: APIResponse) {
    const text = await response.text()
    try {
      return text ? JSON.parse(text) : null
    } catch {
      return { rawBody: text }
    }
  }
}
