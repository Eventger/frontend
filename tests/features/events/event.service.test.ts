import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from '@/features/events/services/event.service'
import type {
  CreateEventApiResponse,
  CreateEventInput,
  EventsApiResponse,
  UpdateEventApiResponse,
  UpdateEventInput,
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
      contact: 'Laura 3001234567',
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
        contact: 'Laura 3001234567',
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
        contact: 'Laura 3001234567',
      }),
    })
    expect(result).toEqual({
      id: 21,
      name: 'Boda Backend',
      typeId: 0,
      eventDate: '2099-12-31T00:00:00.000Z',
      location: 'Cali',
      contact: 'Laura 3001234567',
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
          contact: 'Laura 3001234567',
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
        contact: 'Laura 3001234567',
      },
    ])
  })
})

describe('updateEvent', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('envía y devuelve el contacto actualizado', async () => {
    const input: UpdateEventInput = {
      name: 'Boda actualizada',
      typeId: 0,
      eventDate: '2099-12-31',
      location: 'Cali',
      contact: 'Daniel 3109876543',
    }
    const response: UpdateEventApiResponse = {
      success: true,
      message: 'Evento actualizado correctamente',
      data: {
        id: 21,
        user: 7,
        name: input.name,
        type: 0,
        date: '2099-12-31T00:00:00.000Z',
        location: input.location,
        contact: input.contact,
        created_at: '2099-01-01T10:00:00.000Z',
        updated_at: '2099-02-01T10:00:00.000Z',
      },
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    const result = await updateEvent(21, input)

    expect(apiRequest).toHaveBeenCalledWith('/events/21/', {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        type: input.typeId,
        date: '2099-12-31T00:00:00.000Z',
        location: input.location,
        contact: input.contact,
      }),
    })
    expect(result).toEqual({
      id: response.data.id,
      name: input.name,
      typeId: input.typeId,
      eventDate: response.data.date,
      location: input.location,
      contact: input.contact,
    })
  })
})

describe('deleteEvent', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('elimina el evento mediante su endpoint', async () => {
    vi.mocked(apiRequest).mockResolvedValue(undefined)

    await expect(deleteEvent(21)).resolves.toBeUndefined()

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith('/events/21/', {
      method: 'DELETE',
    })
  })
})
