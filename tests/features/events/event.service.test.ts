import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createEvent,
  deleteEvent,
  getEventById,
  getEventTypes,
  getEvents,
  updateEvent,
} from '@/features/events/services/event.service'
import type {
  CreateEventApiResponse,
  CreateEventInput,
  EventApiResponse,
  EventTypesApiResponse,
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

describe('service error handling', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
  })

  it('obtiene los tipos de evento', async () => {
    const response: EventTypesApiResponse = {
      success: true,
      data: [{ id: 1, name: 'Boda', description: 'Celebración' }],
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    await expect(getEventTypes()).resolves.toEqual(response.data)
    expect(apiRequest).toHaveBeenCalledWith('/event-types/')
  })

  it('rechaza una respuesta fallida de tipos de evento', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ success: false, data: [] })

    await expect(getEventTypes()).rejects.toThrow(
      'Could not retrieve event types',
    )
  })

  it('rechaza la creación sin tipo o con respuesta fallida', async () => {
    const input: CreateEventInput = {
      name: 'Evento',
      typeId: null,
      eventDate: '2099-12-31',
      location: 'Cali',
      contact: 'Laura',
    }

    await expect(createEvent(input)).rejects.toThrow('Event type is required')
    expect(apiRequest).not.toHaveBeenCalled()

    vi.mocked(apiRequest).mockResolvedValue({
      success: false,
      message: 'No se pudo crear',
    })

    await expect(createEvent({ ...input, typeId: 1 })).rejects.toThrow(
      'No se pudo crear',
    )
  })

  it('rechaza una respuesta fallida al listar eventos', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ success: false, data: [] })

    await expect(getEvents()).rejects.toThrow('Could not retrieve events')
  })

  it('obtiene y transforma un evento por id', async () => {
    const response: EventApiResponse = {
      success: true,
      data: {
        id: 21,
        user: 7,
        name: 'Boda Backend',
        type: 1,
        date: '2099-12-31T00:00:00.000Z',
        location: 'Cali',
        contact: 'Laura',
        created_at: '2099-01-01T10:00:00.000Z',
        updated_at: '2099-01-01T10:00:00.000Z',
      },
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    await expect(getEventById(21)).resolves.toEqual({
      id: 21,
      name: 'Boda Backend',
      typeId: 1,
      eventDate: '2099-12-31T00:00:00.000Z',
      location: 'Cali',
      contact: 'Laura',
    })
    expect(apiRequest).toHaveBeenCalledWith('/events/21/')
  })

  it('rechaza una respuesta fallida al consultar un evento', async () => {
    vi.mocked(apiRequest).mockResolvedValue({ success: false })

    await expect(getEventById(21)).rejects.toThrow(
      'No se pudo cargar el evento',
    )
  })

  it('rechaza la actualización sin tipo o con respuesta fallida', async () => {
    const input: UpdateEventInput = {
      name: 'Evento',
      typeId: null,
      eventDate: '2099-12-31',
      location: 'Cali',
      contact: 'Laura',
    }

    await expect(updateEvent(21, input)).rejects.toThrow(
      'Event type is required',
    )
    expect(apiRequest).not.toHaveBeenCalled()

    vi.mocked(apiRequest).mockResolvedValue({
      success: false,
      message: 'No se pudo actualizar',
    })

    await expect(updateEvent(21, { ...input, typeId: 1 })).rejects.toThrow(
      'No se pudo actualizar',
    )
  })
})
