import { apiRequest, ApiError } from '@/lib/api'
import type { DayPlan } from '../types/planning.types'
import type { SubtaskApiData, UpdateSubtaskInput } from '../types/subtask.types'
import type { PlanningRequest } from '@/features/settings/services/planningPreferences.service'
import { toDeadlineDateTime } from './subtasks.service'

export function getSchedulingConflict(error: unknown): DayPlan | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null
  const body = error.body
  if (typeof body !== 'object' || body === null || !('data' in body)) return null
  const data = body.data
  if (typeof data !== 'object' || data === null || !('has_conflict' in data) || data.has_conflict !== true || !('tasks' in data) || !Array.isArray(data.tasks)) return null
  return data as DayPlan
}

export async function previewReschedule(id: number, date: string, hours: number, request: PlanningRequest = apiRequest, state?: UpdateSubtaskInput['state'], signal?: AbortSignal) {
  const response = await request<{ success: boolean; data: DayPlan }>(`/subtasks/${id}/reschedule-preview/`, {
    method: 'POST', signal,
    body: JSON.stringify({ target_date: date, estimated_hours: hours.toFixed(2), ...(state ? { state } : {}) }),
  })
  if (!response.success) throw new Error('No pudimos consultar la carga de ese día.')
  return response.data
}

export async function saveReschedule(id: number, date: string, hours: number, request: PlanningRequest = apiRequest, input?: UpdateSubtaskInput) {
  const response = await request<{ success: boolean; data: SubtaskApiData; planning: DayPlan }>(`/subtasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(input ? { name: input.name, details: input.details, ...(input.state ? { state: input.state } : {}) } : {}),
      target_date: toDeadlineDateTime(date), estimated_hours: hours.toFixed(2),
    }),
  })
  if (!response.success) throw new Error('No pudimos reprogramar la tarea.')
  return response.planning
}
