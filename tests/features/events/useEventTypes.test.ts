import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventTypes } from '@/features/events/hooks/useEventTypes'
import { getEventTypes } from '@/features/events/services/event.service'

vi.mock('@/features/events/services/event.service', () => ({
  getEventTypes: vi.fn(),
}))

const eventTypes = [
  {
    id: 0,
    name: 'Boda',
    description: 'Evento de boda.',
  },
]

describe('useEventTypes', () => {
  beforeEach(() => {
    vi.mocked(getEventTypes).mockReset()
  })

  it('comienza cargando y expone los tipos obtenidos', async () => {
    vi.mocked(getEventTypes).mockResolvedValue(eventTypes)

    const { result } = renderHook(() => useEventTypes())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getEventTypes).toHaveBeenCalledOnce()
    expect(result.current.eventTypes).toEqual(eventTypes)
    expect(result.current.error).toBeNull()
  })

  it('expone un error cuando la carga falla', async () => {
    vi.mocked(getEventTypes).mockRejectedValue(new Error('Error de red'))

    const { result } = renderHook(() => useEventTypes())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.eventTypes).toEqual([])
    expect(result.current.error).toBe(
      'No pudimos cargar los tipos de evento.',
    )
  })

  it('retry vuelve a cargar, limpia el error y actualiza los tipos', async () => {
    vi.mocked(getEventTypes)
      .mockRejectedValueOnce(new Error('Error de red'))
      .mockResolvedValueOnce(eventTypes)

    const { result } = renderHook(() => useEventTypes())

    await waitFor(() => {
      expect(result.current.error).toBe(
        'No pudimos cargar los tipos de evento.',
      )
    })

    await act(async () => {
      await result.current.retry()
    })

    expect(getEventTypes).toHaveBeenCalledTimes(2)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.eventTypes).toEqual(eventTypes)
  })
})
