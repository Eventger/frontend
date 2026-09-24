import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEvent,
  getEvents,
} from '@/features/events/services/event.service'
import type {
  CreateEventApiResponse,
  CreateEventInput,
  EventsApiResponse,
} from '@/features/events/types/event.types'
import { apiRequest } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}))

describe('createEvent', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('transforma el input y mapea response.data al modelo Event', async () => {
    const input: CreateEventInput = {
      name: 'Boda Backend',
      typeId: 0,
      eventDate: '2099-12-31',
      location: 'Cali',
    }
    const response: CreateEventApiResponse & { name: string } = {
      success: true,
      message: 'Evento creado correctamente',
      name: 'Nombre incorrecto del nivel superior',
      data: {
        id: 21,
        user: 7,
        name: 'Boda Backend',
        type: 0,
        date: '2099-12-31T00:00:00.000Z',
        location: 'Cali',
        created_at: '2099-01-01T10:00:00.000Z',
        updated_at: '2099-01-01T10:00:00.000Z',
      },
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    const result = await createEvent(input)

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith('/events/', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Boda Backend',
        type: 0,
        date: '2099-12-31T00:00:00.000Z',
        location: 'Cali',
      }),
    })
    expect(result).toEqual({
      id: 21,
      name: 'Boda Backend',
      typeId: 0,
      eventDate: '2099-12-31T00:00:00.000Z',
      location: 'Cali',
    })
  })
})

describe('getEvents', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('obtiene y transforma la lista de eventos del backend', async () => {
    const response: EventsApiResponse = {
      success: true,
      data: [
        {
          id: 21,
          user: 7,
          name: 'Boda Backend',
          type: 0,
          date: '2099-12-31T00:00:00.000Z',
          location: 'Cali',
          created_at: '2099-01-01T10:00:00.000Z',
          updated_at: '2099-01-01T10:00:00.000Z',
        },
      ],
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    const result = await getEvents()

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith('/events/')
    expect(result).toEqual([
      {
        id: 21,
        name: 'Boda Backend',
        typeId: 0,
        eventDate: '2099-12-31T00:00:00.000Z',
        location: 'Cali',
      },
    ])
  })
})
