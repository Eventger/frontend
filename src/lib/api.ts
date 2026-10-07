function getApiUrl() {
  const apiUrl =
    import.meta.env.VITE_API_URL?.replace(
      /\/$/,
      '',
    )

  if (!apiUrl) {
    throw new Error(
      'VITE_API_URL is not configured',
    )
  }

  return apiUrl
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function getApiFieldError(error: unknown, field: string): string | null {
  if (!(error instanceof ApiError) || error.status !== 400) return null
  const body = error.body
  if (typeof body !== 'object' || body === null || !('errors' in body)) return null
  const errors = body.errors
  if (typeof errors !== 'object' || errors === null || !(field in errors)) return null
  const messages = (errors as Record<string, unknown>)[field]
  return Array.isArray(messages) && typeof messages[0] === 'string' ? messages[0] : null
}

export type ApiRequestOptions = RequestInit & { expectedStatus?: number }

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { expectedStatus, ...requestOptions } = options
  const headers = new Headers(requestOptions.headers)

  headers.set('Accept', 'application/json')

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...requestOptions,
    headers,
  })

  const body =
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  if (!response.ok || (expectedStatus !== undefined && response.status !== expectedStatus)) {
    throw new ApiError(response.status, body)
  }

  return body as T
}
