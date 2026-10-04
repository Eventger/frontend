import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import { getEventSubtasks } from '@/features/events/services/subtasks.service'
import { eventFixture, subtaskFixture } from './subtask.fixtures'
import { deferred } from '../../deferred'
import type { Subtask } from '@/features/events/types/subtask.types'

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

    expect(getEventSubtasks).toHaveBeenCalledWith(
      eventFixture.id,
      expect.any(Function),
    )
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

  it('conserva la tarea confirmada al guardar si falla la recarga y permite reintentar', async () => {
    const savedTask = { ...subtaskFixture, targetDate: '2026-10-21', estimatedHours: 1 }
    vi.mocked(getEventSubtasks)
      .mockResolvedValueOnce([subtaskFixture])
      .mockRejectedValueOnce(new Error('No se pudieron cargar las subtareas'))
      .mockResolvedValueOnce([savedTask])
    const { result } = renderHook(() => useEventSubtasks(eventFixture.id))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => { await result.current.refresh(savedTask) })

    expect(result.current.subtasks).toEqual([savedTask])
    expect(result.current.error).toBe('No se pudieron cargar las subtareas')

    await act(async () => { await result.current.refresh() })
    expect(result.current.subtasks).toEqual([savedTask])
    expect(result.current.error).toBeNull()
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

  it('no presenta tareas vacías como cargadas al recibir el ID del evento', async () => {
    const pending = deferred<Subtask[]>()
    vi.mocked(getEventSubtasks).mockReturnValue(pending.promise)
    const renders: boolean[] = []
    const { result, rerender } = renderHook(({ id }: { id: number | null }) => {
      const value = useEventSubtasks(id)
      if (id !== null) renders.push(value.isLoading)
      return value
    }, { initialProps: { id: null as number | null } })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender({ id: eventFixture.id })
    await waitFor(() => expect(getEventSubtasks).toHaveBeenCalledOnce())
    expect(renders.length).toBeGreaterThan(0)
    expect(renders.every(Boolean)).toBe(true)

    await act(async () => { pending.resolve([subtaskFixture]) })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.subtasks).toEqual([subtaskFixture])
  })

  it('mantiene la carga al cambiar de evento hasta recibir sus propias tareas', async () => {
    const pending = deferred<Subtask[]>()
    vi.mocked(getEventSubtasks).mockResolvedValueOnce([subtaskFixture]).mockReturnValueOnce(pending.promise)
    const renders: boolean[] = []
    const { result, rerender } = renderHook(({ id }) => {
      const value = useEventSubtasks(id)
      if (id === 22) renders.push(value.isLoading)
      return value
    }, { initialProps: { id: eventFixture.id } })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender({ id: 22 })
    await waitFor(() => expect(getEventSubtasks).toHaveBeenCalledTimes(2))
    expect(renders.every(Boolean)).toBe(true)
    await act(async () => { pending.resolve([]) })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.subtasks).toEqual([])
  })

  it('descarta el error anterior al cambiar a un evento sin tareas', async () => {
    const previous = deferred<Subtask[]>()
    vi.mocked(getEventSubtasks)
      .mockReturnValueOnce(previous.promise)
      .mockResolvedValueOnce([])
    const { result, rerender } = renderHook(({ id }) => useEventSubtasks(id), {
      initialProps: { id: eventFixture.id },
    })
    await waitFor(() => expect(getEventSubtasks).toHaveBeenCalledOnce())
    rerender({ id: 22 })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { previous.reject(new Error('Error anterior')) })

    expect(result.current.subtasks).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('limpia el error cuando ya no hay un evento que consultar', async () => {
    vi.mocked(getEventSubtasks).mockRejectedValue(new Error('Error anterior'))
    const { result, rerender } = renderHook(({ id }: { id: number | null }) => useEventSubtasks(id), {
      initialProps: { id: eventFixture.id as number | null },
    })
    await waitFor(() => expect(result.current.error).not.toBeNull())
    rerender({ id: null })

    await waitFor(() => expect(result.current.error).toBeNull())
    expect(result.current.subtasks).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })
})
