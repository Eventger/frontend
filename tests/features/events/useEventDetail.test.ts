import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventDetail } from '@/features/events/hooks/useEventDetail'
import { getEventById } from '@/features/events/services/event.service'
import { eventFixture } from './subtask.fixtures'
import { ApiError } from '@/lib/api'
import { deferred } from '../../deferred'

vi.mock('@/features/events/services/event.service', () => ({
  getEventById: vi.fn(),
}))

describe('useEventDetail', () => {
  beforeEach(() => {
    vi.mocked(getEventById).mockReset()
  })

  it('carga el evento solicitado', async () => {
    vi.mocked(getEventById).mockResolvedValue(eventFixture)

    const { result } = renderHook(() =>
      useEventDetail(eventFixture.id),
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getEventById).toHaveBeenCalledWith(
      eventFixture.id,
      expect.any(Function),
    )
    expect(result.current.event).toEqual(eventFixture)
    expect(result.current.error).toBeNull()
  })

  it('no consulta el servicio cuando eventId es null', async () => {
    const { result } = renderHook(() => useEventDetail(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getEventById).not.toHaveBeenCalled()
    expect(result.current.event).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('expone el mensaje de un Error y termina la carga', async () => {
    vi.mocked(getEventById).mockRejectedValue(
      new Error('Evento no disponible'),
    )

    const { result } = renderHook(() =>
      useEventDetail(eventFixture.id),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.event).toBeNull()
    expect(result.current.error).toBe('Evento no disponible')
  })

  it('usa un mensaje predeterminado para errores desconocidos', async () => {
    vi.mocked(getEventById).mockRejectedValue('fallo inesperado')

    const { result } = renderHook(() =>
      useEventDetail(eventFixture.id),
    )

    await waitFor(() => {
      expect(result.current.error).toBe('No se pudo cargar el evento')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('retry vuelve a consultar y reemplaza un error por el evento', async () => {
    vi.mocked(getEventById)
      .mockRejectedValueOnce(new Error('Error temporal'))
      .mockResolvedValueOnce(eventFixture)

    const { result } = renderHook(() =>
      useEventDetail(eventFixture.id),
    )

    await waitFor(() => {
      expect(result.current.error).toBe('Error temporal')
    })

    await act(async () => {
      await result.current.retry()
    })

    expect(getEventById).toHaveBeenCalledTimes(2)
    expect(result.current.event).toEqual(eventFixture)
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('un 404 representa un evento inexistente y no un error de carga', async () => {
    vi.mocked(getEventById).mockRejectedValue(new ApiError(404, {
      success: false,
      message: 'El recurso solicitado no existe.',
    }))
    const { result } = renderHook(() => useEventDetail(eventFixture.id))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.event).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('no convierte un fallo del backend en evento inexistente', async () => {
    vi.mocked(getEventById).mockRejectedValue(new ApiError(500, null))
    const { result } = renderHook(() => useEventDetail(eventFixture.id))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
  })

  it('descarta una respuesta anterior al cambiar de evento', async () => {
    const previous = deferred<typeof eventFixture>()
    const next = { ...eventFixture, id: 22, name: 'Segundo evento' }
    vi.mocked(getEventById)
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce(next)
    const { result, rerender } = renderHook(({ id }) => useEventDetail(id), {
      initialProps: { id: eventFixture.id },
    })
    await waitFor(() => expect(getEventById).toHaveBeenCalledOnce())
    rerender({ id: next.id })
    await waitFor(() => expect(result.current.event).toEqual(next))
    await act(async () => { previous.reject(new Error('Error del evento anterior')) })

    expect(result.current.event).toEqual(next)
    expect(result.current.error).toBeNull()
  })
})
