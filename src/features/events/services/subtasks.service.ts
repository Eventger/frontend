import { apiRequest } from '@/lib/api'

import type {
  CreateSubtaskApiRequest,
  CreateSubtaskApiResponse,
  CreateSubtaskInput,
  EventSubtasksApiResponse,
  Subtask,
  SubtaskApiData,
  UpdateSubtaskApiRequest,
  UpdateSubtaskApiResponse,
  UpdateSubtaskInput,
} from '@/features/events/types/subtask.types'

type RequestFn = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>

function mapSubtaskResponse(
  subtask: SubtaskApiData,
): Subtask {
  return {
    id: subtask.id,
    eventId: subtask.event,
    state: subtask.state,
    name: subtask.name,
    targetDate: subtask.target_date,
    estimatedHours: Number(
      subtask.estimated_hours,
    ),
    details: subtask.details,
  }
}

export function toDeadlineDateTime(
  date: string,
) {
  const localEndOfDay = new Date(
    `${date}T23:59:59-05:00`,
  )

  return localEndOfDay.toISOString()
}

export async function getEventSubtasks(
  eventId: number,
  requestFn: RequestFn = apiRequest,
): Promise<Subtask[]> {
  const response =
    await requestFn<EventSubtasksApiResponse>(
      `/events/${eventId}/subtasks/`,
    )

  if (!response.success) {
    throw new Error(
      'No se pudieron cargar las subtareas',
    )
  }

  return response.data.map(
    mapSubtaskResponse,
  )
}

export async function createSubtask(
  eventId: number,
  data: CreateSubtaskInput,
  requestFn: RequestFn = apiRequest,
): Promise<Subtask> {
  const request: CreateSubtaskApiRequest = {
    name: data.name,
    target_date: toDeadlineDateTime(
      data.targetDate,
    ),
    estimated_hours:
      data.estimatedHours.toFixed(2),
    details: data.details,
  }

  const response =
    await requestFn<CreateSubtaskApiResponse>(
      `/events/${eventId}/subtasks/`,
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

  return mapSubtaskResponse(
    response.data,
  )
}

export async function updateSubtask(
  subtaskId: number,
  data: UpdateSubtaskInput,
  requestFn: RequestFn = apiRequest,
): Promise<Subtask> {
  const request: UpdateSubtaskApiRequest = {
    ...(data.state === undefined ? {} : { state: data.state }),
    name: data.name,
    target_date: toDeadlineDateTime(
      data.targetDate,
    ),
    estimated_hours:
      data.estimatedHours.toFixed(2),
    details: data.details,
  }

  const response =
    await requestFn<UpdateSubtaskApiResponse>(
      `/subtasks/${subtaskId}/`,
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

  return mapSubtaskResponse(
    response.data,
  )
}

export async function deleteSubtask(
  subtaskId: number,
  requestFn: RequestFn = apiRequest,
): Promise<void> {
  await requestFn<void>(
    `/subtasks/${subtaskId}/`,
    {
      method: 'DELETE',
    },
  )
}
