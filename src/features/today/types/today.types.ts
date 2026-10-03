import type {
  SubtaskApiData,
} from '@/features/events/types/subtask.types'

export type TodayTaskGroup =
  | 'overdue'
  | 'today'
  | 'upcoming'

export interface TodayApiData {
  overdue: TodaySubtaskApiData[]
  today: TodaySubtaskApiData[]
  upcoming: TodaySubtaskApiData[]
  completed: TodaySubtaskApiData[]
}

export interface TodaySubtaskApiData extends SubtaskApiData {
  event_name: string
}

export interface TodayApiResponse {
  success: boolean
  data: TodayApiData
}

export interface TodayTaskItem {
  id: number
  eventId: number
  eventName: string
  name: string
  targetDate: string
  estimatedHours: number
}

export interface TodayData {
  overdue: TodayTaskItem[]
  today: TodayTaskItem[]
  upcoming: TodayTaskItem[]
  completed: TodayTaskItem[]
}
