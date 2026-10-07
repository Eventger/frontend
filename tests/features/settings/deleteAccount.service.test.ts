import { describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError } from '@/lib/api'
import { deleteOwnAccount } from '@/features/settings/services/deleteAccount.service'

const hint = {
  success: false,
  clerk_error: { type: 'forbidden', reason: 'reverification-error', metadata: { reverification: 'strict' } },
}

describe('borrado de la cuenta propia', () => {
  it('entrega el hint de 403 a Clerk para reverificar y permite reintentar', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(hint), { status: 403 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetch)
    expect(await deleteOwnAccount('ELIMINAR', apiRequest)).toEqual(hint)
    expect(await deleteOwnAccount('ELIMINAR', apiRequest)).toEqual({ deleted: true })
  })

  it.each([400, 401, 403, 503])('propaga un error HTTP %s sin anunciar que la cuenta se eliminó', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status })))
    await expect(deleteOwnAccount('ELIMINAR', apiRequest)).rejects.toBeInstanceOf(ApiError)
  })

  it('no acepta una respuesta con cuerpo como confirmación del borrado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 })))
    await expect(deleteOwnAccount('ELIMINAR', apiRequest)).rejects.toBeInstanceOf(ApiError)
  })

  it('no acepta un 200 vacío como confirmación del borrado', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetch)
    await expect(deleteOwnAccount('ELIMINAR', apiRequest)).rejects.toBeInstanceOf(ApiError)
    expect(fetch.mock.calls[0][1]).not.toHaveProperty('expectedStatus')
  })
})
