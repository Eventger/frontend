import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventDetail } from '@/features/events/hooks/useEventDetail'
import { getEventById } from '@/features/events/services/event.service'
import { eventFixture } from './subtask.fixtures'

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

    expect(getEventById).toHaveBeenCalledWith(eventFixture.id)
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
})
