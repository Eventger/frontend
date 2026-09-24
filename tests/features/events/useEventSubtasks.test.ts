import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import { getEventSubtasks } from '@/features/events/services/subtasks.service'
import { eventFixture, subtaskFixture } from './subtask.fixtures'

vi.mock('@/features/events/services/subtasks.service', () => ({
  getEventSubtasks: vi.fn(),
}))

describe('useEventSubtasks', () => {
  beforeEach(() => {
    vi.mocked(getEventSubtasks).mockReset()
  })

  it('comienza cargando y termina con las subtareas del evento', async () => {
    vi.mocked(getEventSubtasks).mockResolvedValue([subtaskFixture])

    const { result } = renderHook(() =>
      useEventSubtasks(eventFixture.id),
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(getEventSubtasks).toHaveBeenCalledWith(eventFixture.id)
    expect(result.current.subtasks).toEqual([subtaskFixture])
    expect(result.current.error).toBeNull()
  })

  it('expone el error del servicio y termina la carga', async () => {
    vi.mocked(getEventSubtasks).mockRejectedValue(
      new Error('No se pudieron cargar las subtareas'),
    )

    const { result } = renderHook(() =>
      useEventSubtasks(eventFixture.id),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.subtasks).toEqual([])
    expect(result.current.error).toBe('No se pudieron cargar las subtareas')
  })

  it('refresh vuelve a consultar las subtareas', async () => {
    vi.mocked(getEventSubtasks).mockResolvedValue([subtaskFixture])

    const { result } = renderHook(() =>
      useEventSubtasks(eventFixture.id),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.refresh()
    })

    expect(getEventSubtasks).toHaveBeenCalledTimes(2)
  })

  it('no consulta el servicio cuando eventId es null', async () => {
    const { result } = renderHook(() =>
      useEventSubtasks(null),
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.subtasks).toEqual([])
    expect(result.current.error).toBeNull()
    expect(getEventSubtasks).not.toHaveBeenCalled()
  })
})
