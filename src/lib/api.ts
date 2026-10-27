function getApiUrl() {
  const apiUrl =
    import.meta.env.VITE_API_URL?.replace(
      /\/$/,
      '',
    )

  if (!apiUrl) {
    throw new Error(
      'No pudimos conectar con Eventger. Revisa la configuración del entorno.',
    )
  }

  return apiUrl
}

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super('No pudimos completar la solicitud. Inténtalo de nuevo.')
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

const DEFAULT_TIMEOUT_MS = 35000

type TokenGetter = () => Promise<string | null>
let globalTokenGetter: TokenGetter | null = null

export function setApiAuthTokenGetter(getter: TokenGetter | null): void {
  globalTokenGetter = getter
}

export function getApiAuthTokenGetter(): TokenGetter | null {
  return globalTokenGetter
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { expectedStatus, signal, ...requestOptions } = options
  const headers = new Headers(requestOptions.headers)

  headers.set('Accept', 'application/json')

  if (globalTokenGetter && !headers.has('Authorization')) {
    const token = await globalTokenGetter()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const timeoutSignal =
    typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
      : undefined

  const finalSignal = signal
    ? typeof AbortSignal.any === 'function' && timeoutSignal
      ? AbortSignal.any([signal, timeoutSignal])
      : signal
    : timeoutSignal

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...requestOptions,
    headers,
    signal: finalSignal,
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
