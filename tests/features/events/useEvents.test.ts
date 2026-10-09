import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEvents } from '@/features/events/hooks/useEvents'
import { getEvents } from '@/features/events/services/event.service'
import type { Event, EventsPageData } from '@/features/events/types/event.types'
import { deferred } from '../../deferred'
import { ApiError } from '@/lib/api'

vi.mock('@/features/events/services/event.service', () => ({
  getEvents: vi.fn(),
}))

const event: Event = {
  id: 21,
  name: 'Boda Backend',
  typeId: 0,
  eventDate: '2099-12-31T00:00:00.000Z',
  location: 'Cali',
  contact: 'Laura 3001234567',
}

const pageData = (events: Event[], page = 1): EventsPageData => ({
  events, pagination: { page, pageSize: 6, total: events.length, totalPages: 1 },
})

describe('useEvents', () => {
  beforeEach(() => {
    vi.mocked(getEvents).mockReset()
  })

  it('carga los eventos mediante el servicio', async () => {
    vi.mocked(getEvents).mockResolvedValue(pageData([event]))

    const { result } = renderHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getEvents).toHaveBeenCalledOnce()
    expect(result.current.events).toEqual([event])
    expect(result.current.error).toBeNull()
  })

  it.each([new TypeError('Failed to fetch'), new ApiError(500, null)])('normaliza el error del servicio: %s', async (error) => {
    vi.mocked(getEvents).mockRejectedValue(
      error,
    )

    const { result } = renderHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.events).toEqual([])
    expect(result.current.error).toBe('No pudimos cargar los eventos')
  })

  it('un error anterior no reemplaza una lista vacía obtenida al reintentar', async () => {
    const previous = deferred<EventsPageData>()
    vi.mocked(getEvents)
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce(pageData([]))
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(getEvents).toHaveBeenCalledOnce())

    await act(async () => { await result.current.retry() })
    await act(async () => { previous.reject(new Error('Fallo anterior')) })

    expect(result.current.events).toEqual([])
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('una respuesta anterior no reemplaza los datos del reintento más reciente', async () => {
    const previous = deferred<EventsPageData>()
    vi.mocked(getEvents)
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce(pageData([]))
    const { result } = renderHook(() => useEvents())
    await waitFor(() => expect(getEvents).toHaveBeenCalledOnce())

    await act(async () => { await result.current.retry() })
    await act(async () => { previous.resolve(pageData([event])) })

    expect(result.current.events).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('carga la página solicitada e ignora la respuesta de la página anterior', async () => {
    const previous = deferred<EventsPageData>()
    vi.mocked(getEvents)
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce(pageData([{ ...event, id: 22 }], 2))
    const { result, rerender } = renderHook(({ page }) => useEvents(page), { initialProps: { page: 1 } })
    await waitFor(() => expect(getEvents).toHaveBeenCalledOnce())
    rerender({ page: 2 })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.pagination?.page).toBe(2))
    await act(async () => { previous.resolve(pageData([event])) })
    expect(result.current.events[0].id).toBe(22)
    expect(getEvents).toHaveBeenLastCalledWith(2, expect.any(Function), null)
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('oculta la página anterior mientras carga la siguiente y permite reintentar esa página', async () => {
    vi.mocked(getEvents).mockResolvedValueOnce(pageData([event])).mockRejectedValueOnce(new Error('Fallo de página 2')).mockResolvedValueOnce(pageData([], 2))
    const { result, rerender } = renderHook(({ page }) => useEvents(page), { initialProps: { page: 1 } })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    rerender({ page: 2 })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.error).toBe('No pudimos cargar los eventos'))
    await act(async () => { await result.current.retry() })
    expect(getEvents).toHaveBeenLastCalledWith(2, expect.any(Function), null)
    expect(result.current.pagination?.page).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('cambiar el tipo en la misma página carga el filtro y descarta respuestas anteriores', async () => {
    const previous = deferred<EventsPageData>()
    vi.mocked(getEvents).mockReturnValueOnce(previous.promise).mockResolvedValueOnce(pageData([{ ...event, id: 22, typeId: 2 }]))
    const { result, rerender } = renderHook(({ typeId }) => useEvents(1, typeId), { initialProps: { typeId: 1 } })
    await waitFor(() => expect(getEvents).toHaveBeenCalledOnce())
    rerender({ typeId: 2 })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { previous.resolve(pageData([event])) })
    expect(result.current.events[0].typeId).toBe(2)
    expect(getEvents).toHaveBeenLastCalledWith(1, expect.any(Function), 2)
  })
})
