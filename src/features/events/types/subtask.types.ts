export type SubtaskState = 'pending' | 'completed' | "in_progress"

export interface SubtaskApiData {
  id: number
  event: number
  state: SubtaskState
  name: string
  target_date: string
  estimated_hours: string
  details: string
  created_at: string
  updated_at: string
}

export interface Subtask {
  id: number
  eventId: number
  state: SubtaskState
  name: string
  targetDate: string
  estimatedHours: number
  details: string
}

export interface CreateSubtaskInput {
  name: string
  targetDate: string
  estimatedHours: number
  details: string
}

export interface CreateSubtaskApiRequest {
  name: string
  target_date: string
  estimated_hours: string
  details: string
}

export interface EventSubtasksApiResponse {
  success: boolean
  data: SubtaskApiData[]
}

export interface CreateSubtaskApiResponse {
  success: boolean
  message: string
  data: SubtaskApiData
}

export type UpdateSubtaskInput =
  CreateSubtaskInput

export type UpdateSubtaskApiRequest =
  CreateSubtaskApiRequest

export interface UpdateSubtaskApiResponse {
  success: boolean
  message: string
  data: SubtaskApiData
}