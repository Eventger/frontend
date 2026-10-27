import { apiRequest } from '@/lib/api'

import type {
  TodayApiResponse,
  TodayData,
  TodayTaskItem,
  TodaySubtaskApiData,
} from '@/features/today/types/today.types'

type RequestFn = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>

function mapTodayTask(
  task: TodaySubtaskApiData,
): TodayTaskItem {
  return {
    id: task.id,
    eventId: task.event,
    eventName: task.event_name,
    name: task.name,
    targetDate: task.target_date,
    estimatedHours: Number(
      task.estimated_hours,
    ),
    state: task.state ?? task.status ?? 'pending',
    details: task.details ?? task.note ?? '',
  }
}

function sortByPriority(
  tasks: TodayTaskItem[],
) {
  return [...tasks].sort(
    (first, second) => {
      const dateComparison =
        first.targetDate
          .slice(0, 10)
          .localeCompare(
            second.targetDate.slice(
              0,
              10,
            ),
          )

      if (dateComparison !== 0) {
        return dateComparison
      }

      return (
        first.estimatedHours -
        second.estimatedHours
      )
    },
  )
}

export async function getToday(
  requestFn: RequestFn = apiRequest,
  date?: string,
): Promise<TodayData> {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  const todayResponse =
    await requestFn<TodayApiResponse>(
      `/hoy/${query}`,
    )

  if (!todayResponse.success) {
    throw new Error('No pudimos cargar tus tareas.')
  }

  const groups = todayResponse.data

  if (
    groups.overdue.length === 0 &&
    groups.today.length === 0 &&
    groups.upcoming.length === 0 &&
    groups.completed.length === 0
  ) {
    return {
      overdue: [],
      today: [],
      upcoming: [],
      completed: [],
    }
  }

  return {
    overdue: sortByPriority(
      todayResponse.data.overdue.map(
        (task) =>
          mapTodayTask(
            task,
          ),
      ),
    ),

    today: sortByPriority(
      todayResponse.data.today.map(
        (task) =>
          mapTodayTask(
            task,
          ),
      ),
    ),

    upcoming: sortByPriority(
      todayResponse.data.upcoming.map(
        (task) =>
          mapTodayTask(
            task,
          ),
      ),
    ),

    completed:
      todayResponse.data.completed.map(
        (task) =>
          mapTodayTask(
            task,
          ),
      ),
  }
}
