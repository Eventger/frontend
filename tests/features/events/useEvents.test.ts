import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEvents } from '@/features/events/hooks/useEvents'
import { getEvents } from '@/features/events/services/event.service'
import type { Event } from '@/features/events/types/event.types'

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

describe('useEvents', () => {
  beforeEach(() => {
    vi.mocked(getEvents).mockReset()
  })

  it('carga los eventos mediante el servicio', async () => {
    vi.mocked(getEvents).mockResolvedValue([event])

    const { result } = renderHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getEvents).toHaveBeenCalledOnce()
    expect(result.current.events).toEqual([event])
    expect(result.current.error).toBeNull()
  })

  it('expone el error del servicio', async () => {
    vi.mocked(getEvents).mockRejectedValue(
      new Error('No pudimos cargar los eventos'),
    )

    const { result } = renderHook(() => useEvents())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.events).toEqual([])
    expect(result.current.error).toBe('No pudimos cargar los eventos')
  })
})
