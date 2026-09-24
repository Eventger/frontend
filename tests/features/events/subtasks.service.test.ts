import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createSubtask,
  deleteSubtask,
  getEventSubtasks,
  updateSubtask,
} from '@/features/events/services/subtasks.service'
import type {
  CreateSubtaskApiResponse,
  EventSubtasksApiResponse,
  UpdateSubtaskApiResponse,
} from '@/features/events/types/subtask.types'
import { apiRequest } from '@/lib/api'
import {
  createSubtaskInputFixture,
  eventFixture,
  subtaskApiFixture,
} from './subtask.fixtures'

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(apiRequest).mockReset()
})

describe('getEventSubtasks', () => {
  it('consulta el endpoint y transforma los datos de la API', async () => {
    const response: EventSubtasksApiResponse = {
      success: true,
      data: [subtaskApiFixture],
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    const result = await getEventSubtasks(eventFixture.id)

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith(
      `/events/${eventFixture.id}/subtasks/`,
    )
    expect(result).toEqual([
      {
        id: subtaskApiFixture.id,
        eventId: subtaskApiFixture.event,
        state: subtaskApiFixture.state,
        name: subtaskApiFixture.name,
        targetDate: subtaskApiFixture.target_date,
        estimatedHours: 2.5,
        details: subtaskApiFixture.details,
      },
    ])
  })

  it('devuelve una lista vacía cuando la API no tiene subtareas', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      success: true,
      data: [],
    } satisfies EventSubtasksApiResponse)

    await expect(getEventSubtasks(eventFixture.id)).resolves.toEqual([])
  })

  it('lanza error cuando la respuesta no es exitosa', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      success: false,
      data: [],
    } satisfies EventSubtasksApiResponse)

    await expect(getEventSubtasks(eventFixture.id)).rejects.toThrow(
      'No se pudieron cargar las subtareas',
    )
  })
})

describe('createSubtask', () => {
  it('serializa el payload y mapea response.data', async () => {
    const response: CreateSubtaskApiResponse & { name: string } = {
      success: true,
      message: 'Subtarea creada',
      name: 'Nombre incorrecto del nivel superior',
      data: subtaskApiFixture,
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    const result = await createSubtask(
      eventFixture.id,
      createSubtaskInputFixture,
    )
    const expectedTargetDate = new Date(
      `${createSubtaskInputFixture.targetDate}T23:59:59`,
    ).toISOString()

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith(
      `/events/${eventFixture.id}/subtasks/`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: createSubtaskInputFixture.name,
          target_date: expectedTargetDate,
          estimated_hours: '2.50',
          details: createSubtaskInputFixture.details,
        }),
      },
    )
    expect(result).toEqual({
      id: subtaskApiFixture.id,
      eventId: subtaskApiFixture.event,
      state: subtaskApiFixture.state,
      name: subtaskApiFixture.name,
      targetDate: subtaskApiFixture.target_date,
      estimatedHours: 2.5,
      details: subtaskApiFixture.details,
    })
    expect(result.name).toBe(subtaskApiFixture.name)
    expect(result.name).not.toBe(response.name)
  })

  it('formatea horas decimales con dos posiciones', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      success: true,
      message: 'Subtarea creada',
      data: subtaskApiFixture,
    } satisfies CreateSubtaskApiResponse)

    await createSubtask(eventFixture.id, {
      ...createSubtaskInputFixture,
      estimatedHours: 2.5,
    })

    const options = vi.mocked(apiRequest).mock.calls[0][1]
    expect(JSON.parse(String(options?.body))).toMatchObject({
      estimated_hours: '2.50',
    })
  })

  it('lanza el mensaje de error de una respuesta fallida', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      success: false,
      message: 'No se pudo crear la subtarea',
      data: subtaskApiFixture,
    } satisfies CreateSubtaskApiResponse)

    await expect(
      createSubtask(eventFixture.id, createSubtaskInputFixture),
    ).rejects.toThrow('No se pudo crear la subtarea')
  })
})

describe('updateSubtask', () => {
  it('actualiza la subtarea y transforma la respuesta', async () => {
    const input = {
      ...createSubtaskInputFixture,
      name: 'Coordinar transporte actualizado',
      estimatedHours: 3.5,
    }
    const response: UpdateSubtaskApiResponse = {
      success: true,
      message: 'Subtarea actualizada',
      data: {
        ...subtaskApiFixture,
        name: input.name,
        estimated_hours: '3.50',
      },
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    const result = await updateSubtask(subtaskApiFixture.id, input)
    const expectedTargetDate = new Date(
      `${input.targetDate}T23:59:59`,
    ).toISOString()

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith(
      `/subtasks/${subtaskApiFixture.id}/`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name: input.name,
          target_date: expectedTargetDate,
          estimated_hours: '3.50',
          details: input.details,
        }),
      },
    )
    expect(result).toEqual({
      id: response.data.id,
      eventId: response.data.event,
      state: response.data.state,
      name: response.data.name,
      targetDate: response.data.target_date,
      estimatedHours: 3.5,
      details: response.data.details,
    })
  })
})

describe('deleteSubtask', () => {
  it('elimina la subtarea mediante su endpoint', async () => {
    vi.mocked(apiRequest).mockResolvedValue(undefined)

    await expect(
      deleteSubtask(subtaskApiFixture.id),
    ).resolves.toBeUndefined()

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith(
      `/subtasks/${subtaskApiFixture.id}/`,
      { method: 'DELETE' },
    )
  })
})
