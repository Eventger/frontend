import { apiRequest } from '@/lib/api'

import type {
  Event,
  CreateEventInput,
  CreateEventApiRequest,
  EventType,
  EventTypesApiResponse,
  EventApiData,
  CreateEventApiResponse,
  EventsApiResponse,
  EventsPageData,
  EventApiResponse,
  UpdateEventApiResponse,
  UpdateEventApiRequest,
  UpdateEventInput,
} from '@/features/events/types/event.types'

type RequestFn = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>

function mapEventResponse(
  event: EventApiData,
): Event {
  return {
    id: event.id,
    name: event.name,
    typeId: event.type,
    eventDate: event.date,
    location: event.location,
    contact: event.contact,
  }
}

export async function getEventTypes(): Promise<EventType[]> {
  const response =
    await apiRequest<EventTypesApiResponse>(
      '/event-types/',
    )

  if (!response.success) {
    throw new Error(
      'Could not retrieve event types',
    )
  }

  return response.data
}

export async function createEvent(
  data: CreateEventInput,
  requestFn: RequestFn = apiRequest,
): Promise<Event> {
  if (data.typeId === null) {
    throw new Error(
      'Event type is required',
    )
  }

  const request: CreateEventApiRequest = {
    name: data.name,
    type: data.typeId,
    date: toEventDateTime(
      data.eventDate,
    ),
    location: data.location,
    contact: data.contact,
  }

  const response =
    await requestFn<CreateEventApiResponse>(
      '/events/',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )

  if (!response.success) {
    throw new Error(
      response.message,
    )
  }

  return mapEventResponse(
    response.data,
  )
}

export async function getEvents(
  page: number = 1,
  requestFn: RequestFn = apiRequest,
  typeId: number | null = null,
): Promise<EventsPageData> {
  const query = new URLSearchParams({ page: String(page) })
  if (typeId !== null) query.set('type', String(typeId))
  const response =
    await requestFn<EventsApiResponse>(
      `/events/?${query}`,
    )

  if (response?.success !== true || !Array.isArray(response.data)) {
    throw new Error(
      'Could not retrieve events',
    )
  }

  // El contrato anterior devuelve la lista completa sin metadatos.
  // Conservamos filtro y páginas mientras el backend adopta la paginación.
  if (response.pagination === undefined) {
    const events = typeId === null
      ? response.data
      : response.data.filter(event => event.type === typeId)
    const pageSize = 6
    const total = events.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const start = (currentPage - 1) * pageSize

    return {
      events: events.slice(start, start + pageSize).map(mapEventResponse),
      pagination: { page: currentPage, pageSize, total, totalPages },
    }
  }

  return {
    events: response.data.map(mapEventResponse),
    pagination: {
      page: response.pagination.page,
      pageSize: response.pagination.page_size,
      total: response.pagination.total,
      totalPages: response.pagination.total_pages,
    },
  }
}

export async function getEventById(
  eventId: number,
  requestFn: RequestFn = apiRequest,
): Promise<Event> {
  const response =
    await requestFn<EventApiResponse>(
      `/events/${eventId}/`,
    )

  if (!response.success) {
    throw new Error(
      'No se pudo cargar el evento',
    )
  }

  return mapEventResponse(
    response.data,
  )
}

export async function updateEvent(
  eventId: number,
  data: UpdateEventInput,
  requestFn: RequestFn = apiRequest,
): Promise<Event> {
  if (data.typeId === null) {
    throw new Error(
      'Event type is required',
    )
  }

  const request: UpdateEventApiRequest = {
    name: data.name,
    type: data.typeId,
    date: toEventDateTime(
      data.eventDate,
    ),
    location: data.location,
    contact: data.contact,
  }

  const response =
    await requestFn<UpdateEventApiResponse>(
      `/events/${eventId}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      },
    )

  if (!response.success) {
    throw new Error(
      response.message,
    )
  }

  return mapEventResponse(
    response.data,
  )
}

export async function deleteEvent(
  eventId: number,
  requestFn: RequestFn = apiRequest,
): Promise<void> {
  await requestFn<void>(
    `/events/${eventId}/`,
    {
      method: 'DELETE',
    },
  )
}

function toEventDateTime(
  date: string,
) {
  // El formulario captura un día, no una hora. Usar medianoche
  // hacía que un evento programado para hoy quedara en el pasado
  // apenas comenzaba el día y el API rechazara la actualización.
  return `${date}T23:59:59.999-05:00`
}
