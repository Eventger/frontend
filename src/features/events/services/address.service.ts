export type AddressSuggestion = {
  id: string
  title: string
  description: string
  address: string
}

type SearchOptions = { signal?: AbortSignal }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function mapSuggestion(feature: unknown): AddressSuggestion | null {
  if (!isRecord(feature) || !isRecord(feature.properties)) return null
  const place = feature.properties
  const street = [text(place.street), text(place.housenumber)].filter(Boolean).join(' ')
  const title = text(place.name) || street || text(place.city)
  const parts = [...new Set([
    title, street, text(place.district), text(place.city), text(place.state), text(place.country),
  ].filter(Boolean))]
  const address = parts.join(', ')
  // location es un CharField de 255 caracteres en el contrato de eventos.
  if (!title || address.length > 255) return null
  return { id: address, title, description: parts.slice(1).join(', '), address }
}

export async function searchAddresses(query: string, { signal }: SearchOptions = {}): Promise<AddressSuggestion[]> {
  const search = query.trim()
  if (search.length < 3) return []
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', search)
  url.searchParams.set('limit', '5')

  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) controller.abort()
  const timeout = setTimeout(abort, 8000)
  try {
    // La búsqueda pública no recibe el token de Clerk ni cookies de la aplicación.
    const response = await fetch(url, {
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error('No pudimos buscar direcciones.')
    const body: unknown = await response.json()
    if (!isRecord(body) || !Array.isArray(body.features)) throw new Error('La búsqueda devolvió una respuesta inválida.')
    const suggestions = body.features.map(mapSuggestion).filter((place): place is AddressSuggestion => place !== null)
    return [...new Map(suggestions.map(place => [place.address, place])).values()].slice(0, 5)
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}
