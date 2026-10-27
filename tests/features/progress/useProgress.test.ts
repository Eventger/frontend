import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProgress } from '@/features/progress/hooks/useProgress'

const mockAuthenticatedRequest = vi.fn()

vi.mock('@/features/auth/hooks/useAuthenticatedApi', () => ({
  useAuthenticatedApi: () => ({
    authenticatedRequest: mockAuthenticatedRequest,
  }),
}))

vi.mock('@/features/events/services/event.service', () => ({
  getEvents: vi.fn(),
  getEventById: vi.fn(),
}))

import { getEventById, getEvents } from '@/features/events/services/event.service'

describe('useProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe cargar el progreso de los eventos calculados por el backend correctamente', async () => {
    vi.mocked(getEvents).mockResolvedValue({
      events: [{ id: 1, name: 'Evento 1', typeId: 1, eventDate: '', location: '', contact: '' }],
      pagination: { page: 1, pageSize: 6, total: 1, totalPages: 1 },
    })

    vi.mocked(getEventById).mockResolvedValue({
      id: 1,
      name: 'Evento 1',
      typeId: 1,
      eventDate: '',
      location: '',
      contact: '',
      progress: { completed: 3, total: 5, percentage: 60 },
    })

    const { result } = renderHook(() => useProgress())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(false)
    expect(result.current.data?.events).toHaveLength(1)
    expect(result.current.data?.events[0]).toEqual({
      event: expect.objectContaining({ id: 1, name: 'Evento 1' }),
      completedCount: 3,
      totalCount: 5,
      percentage: 60,
    })
  })

  it('debe asignar progreso por defecto (0) si el evento no tiene el campo progress', async () => {
    vi.mocked(getEvents).mockResolvedValue({
      events: [{ id: 2, name: 'Evento sin progreso', typeId: 1, eventDate: '', location: '', contact: '' }],
      pagination: { page: 1, pageSize: 6, total: 1, totalPages: 1 },
    })

    vi.mocked(getEventById).mockResolvedValue({
      id: 2,
      name: 'Evento sin progreso',
      typeId: 1,
      eventDate: '',
      location: '',
      contact: '',
      progress: undefined,
    })

    const { result } = renderHook(() => useProgress())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(false)
    expect(result.current.data?.events[0]).toEqual({
      event: expect.objectContaining({ id: 2 }),
      completedCount: 0,
      totalCount: 0,
      percentage: 0,
    })
  })

  it('debe activar el estado de error si falla la llamada al servicio', async () => {
    vi.mocked(getEvents).mockRejectedValue(new Error('Fallo de red'))

    const { result } = renderHook(() => useProgress())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(true)
    expect(result.current.data).toBeNull()
  })

  it('debe permitir reintentar la carga ejecutando la función retry', async () => {
    vi.mocked(getEvents)
      .mockRejectedValueOnce(new Error('Fallo de red'))
      .mockResolvedValue({
        events: [{ id: 3, name: 'Evento Reintentado', typeId: 1, eventDate: '', location: '', contact: '' }],
        pagination: { page: 1, pageSize: 6, total: 1, totalPages: 1 },
      })

    vi.mocked(getEventById).mockResolvedValue({
      id: 3,
      name: 'Evento Reintentado',
      typeId: 1,
      eventDate: '',
      location: '',
      contact: '',
      progress: { completed: 1, total: 1, percentage: 100 },
    })

    const { result } = renderHook(() => useProgress())

    await waitFor(() => {
      expect(result.current.error).toBe(true)
    })

    act(() => {
      result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(false)
    expect(result.current.data?.events[0].percentage).toBe(100)
  })

  it('debe utilizar directamente el progress incluido en getEvents sin llamar a getEventById', async () => {
    vi.mocked(getEvents).mockResolvedValue({
      events: [
        {
          id: 4,
          name: 'Evento con progreso directo',
          typeId: 1,
          eventDate: '',
          location: '',
          contact: '',
          progress: { completed: 4, total: 8, percentage: 50 },
        },
      ],
      pagination: { page: 1, pageSize: 6, total: 1, totalPages: 1 },
    })

    const { result } = renderHook(() => useProgress())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(false)
    expect(vi.mocked(getEventById)).not.toHaveBeenCalled()
    expect(result.current.data?.events[0].percentage).toBe(50)
  })

  it('debe tolerar el fallo individual de getEventById sin tumbar toda la página de progreso', async () => {
    vi.mocked(getEvents).mockResolvedValue({
      events: [
        { id: 5, name: 'Evento A', typeId: 1, eventDate: '', location: '', contact: '' },
        { id: 6, name: 'Evento B (falla)', typeId: 1, eventDate: '', location: '', contact: '' },
      ],
      pagination: { page: 1, pageSize: 6, total: 2, totalPages: 1 },
    })

    vi.mocked(getEventById)
      .mockResolvedValueOnce({
        id: 5,
        name: 'Evento A',
        typeId: 1,
        eventDate: '',
        location: '',
        contact: '',
        progress: { completed: 2, total: 2, percentage: 100 },
      })
      .mockRejectedValueOnce(new Error('500 Internal Server Error'))

    const { result } = renderHook(() => useProgress())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe(false)
    expect(result.current.data?.events).toHaveLength(2)
    expect(result.current.data?.events[0].percentage).toBe(100)
    expect(result.current.data?.events[1].percentage).toBe(0)
    expect(result.current.data?.events[1].event.id).toBe(6)
  })
})