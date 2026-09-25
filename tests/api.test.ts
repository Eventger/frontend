import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubEnv('VITE_API_URL', 'https://api.eventger.test')

const { ApiError, apiRequest } = await import('@/lib/api')

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('resuelve un 204 vacío sin intentar parsear JSON', async () => {
    const response = new Response(null, { status: 204 })
    const jsonSpy = vi.spyOn(response, 'json')
    vi.mocked(fetch).mockResolvedValue(response)

    await expect(
      apiRequest<void>('/events/21/', { method: 'DELETE' }),
    ).resolves.toBeNull()

    expect(fetch).toHaveBeenCalledWith(
      'https://api.eventger.test/events/21/',
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(jsonSpy).not.toHaveBeenCalled()
  })

  it('envía Accept y devuelve el JSON de una respuesta exitosa', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(apiRequest('/events/')).resolves.toEqual({ success: true })

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const headers = new Headers(options?.headers)
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.has('Content-Type')).toBe(false)
  })

  it('añade Content-Type al enviar un cuerpo JSON', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await apiRequest('/events/', {
      method: 'POST',
      body: JSON.stringify({ name: 'Evento' }),
    })

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const headers = new Headers(options?.headers)
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('respeta un Content-Type proporcionado por quien llama', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }))

    await apiRequest('/upload/', {
      method: 'POST',
      body: 'contenido',
      headers: { 'Content-Type': 'text/plain' },
    })

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const headers = new Headers(options?.headers)
    expect(headers.get('Content-Type')).toBe('text/plain')
  })

  it('lanza ApiError con el estado y el cuerpo del backend', async () => {
    const body = { message: 'Evento no encontrado' }
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const request = apiRequest('/events/404/')

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message: 'API request failed with status 404',
      status: 404,
      body,
    })
    await expect(request).rejects.toBeInstanceOf(ApiError)
  })

  it('usa null como cuerpo cuando la respuesta no contiene JSON válido', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('error interno', { status: 500 }),
    )

    await expect(apiRequest('/events/')).rejects.toMatchObject({
      status: 500,
      body: null,
    })
  })
})
