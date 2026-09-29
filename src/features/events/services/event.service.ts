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
  requestFn: RequestFn,
  data: CreateEventInput,
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
  requestFn: RequestFn,
): Promise<Event[]> {
  const response =
    await requestFn<EventsApiResponse>(
      '/events/',
    )

  if (!response.success) {
    throw new Error(
      'Could not retrieve events',
    )
  }

  return response.data.map(
    mapEventResponse,
  )
}

export async function getEventById(
  requestFn: RequestFn,
  eventId: number,
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
  requestFn: RequestFn,
  eventId: number,
  data: UpdateEventInput,
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
  requestFn: RequestFn,
  eventId: number,
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
  return `${date}T00:00:00.000Z`
}