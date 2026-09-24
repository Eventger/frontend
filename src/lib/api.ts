const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

if (!API_URL) {
  throw new Error('VITE_API_URL is not configured')
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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const body =
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, body)
  }

  return body as T
}