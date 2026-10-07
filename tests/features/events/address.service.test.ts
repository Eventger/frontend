import { describe, expect, it, vi } from 'vitest'
import { searchAddresses } from '@/features/events/services/address.service'
import { addressApiFixture, addressFixture, addressProperties } from './address.fixtures'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('búsqueda de direcciones', () => {
  it('busca y normaliza la dirección sin enviar credenciales de Eventger', async () => {
    const fetch = vi.fn().mockResolvedValue(json(addressApiFixture))
    vi.stubGlobal('fetch', fetch)

    expect(await searchAddresses('  Chipichape Cali  ')).toEqual([addressFixture])
    const [url, options] = fetch.mock.calls[0]
    expect(url.origin).toBe('https://photon.komoot.io')
    expect(url.searchParams.get('q')).toBe('Chipichape Cali')
    expect(url.searchParams.get('limit')).toBe('5')
    expect(url.searchParams.has('lat')).toBe(false)
    expect(url.searchParams.has('lon')).toBe(false)
    expect(options.credentials).toBe('omit')
    expect(options.referrerPolicy).toBe('no-referrer')
    expect(new Headers(options.headers).has('Authorization')).toBe(false)
  })

  it.each(['', '  ', 'Ca'])('no consulta la API con un término demasiado corto: %j', async query => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    expect(await searchAddresses(query)).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  it('elimina duplicados y omite resultados inválidos o que excedan el campo de 255 caracteres', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ features: [
      ...addressApiFixture.features, ...addressApiFixture.features, null, {}, { properties: {} },
      { properties: { ...addressProperties, name: 'x'.repeat(256) } },
      { properties: { street: 'Carrera 4', housenumber: '10-20', city: 'Cali', country: 'Colombia' } },
    ] })))
    const results = await searchAddresses('Cali')
    expect(results).toHaveLength(2)
    expect(results[0]).toEqual(addressFixture)
    expect(results[1].address).toBe('Carrera 4 10-20, Cali, Colombia')
  })

  it.each([429, 500])('rechaza un fallo HTTP %s', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({}, status)))
    await expect(searchAddresses('Cali')).rejects.toThrow('No pudimos buscar direcciones.')
  })

  it.each([null, {}, { features: null }])('rechaza respuestas inválidas: %j', async body => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(body)))
    await expect(searchAddresses('Cali')).rejects.toThrow('La búsqueda devolvió una respuesta inválida.')
  })

  it('cancela la petición al abortar la búsqueda', async () => {
    const fetch = vi.fn((_url, options: RequestInit) => new Promise<Response>((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Cancelada', 'AbortError')))
    }))
    vi.stubGlobal('fetch', fetch)
    const controller = new AbortController()
    const request = searchAddresses('Cali', { signal: controller.signal })
    controller.abort()
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetch.mock.calls[0][1].signal?.aborted).toBe(true)
  })
})
