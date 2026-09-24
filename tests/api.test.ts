import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.stubEnv('VITE_API_URL', 'https://api.eventger.test')

const { apiRequest } = await import('@/lib/api')

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
})
