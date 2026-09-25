import { apiRequest } from '@/lib/api'

import {
  getEvents,
} from '@/features/events/services/event.service'

import type {
  SubtaskApiData,
} from '@/features/events/types/subtask.types'

import type {
  TodayApiResponse,
  TodayData,
  TodayTaskItem,
} from '@/features/today/types/today.types'

function mapTodayTask(
  task: SubtaskApiData,
  eventNames: Map<number, string>,
): TodayTaskItem {
  return {
    id: task.id,
    eventId: task.event,
    eventName:
      eventNames.get(task.event) ?? '',
    name: task.name,
    targetDate: task.target_date,
    estimatedHours: Number(
      task.estimated_hours,
    ),
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

export async function getToday():
  Promise<TodayData> {
  const [todayResponse, events] =
    await Promise.all([
      apiRequest<TodayApiResponse>(
        '/hoy',
      ),
      getEvents(),
    ])

  const eventNames = new Map(
    events.map((event) => [
      event.id,
      event.name,
    ]),
  )

  return {
    overdue: sortByPriority(
      todayResponse.data.overdue.map(
        (task) =>
          mapTodayTask(
            task,
            eventNames,
          ),
      ),
    ),

    today: sortByPriority(
      todayResponse.data.today.map(
        (task) =>
          mapTodayTask(
            task,
            eventNames,
          ),
      ),
    ),

    upcoming: sortByPriority(
      todayResponse.data.upcoming.map(
        (task) =>
          mapTodayTask(
            task,
            eventNames,
          ),
      ),
    ),

    completed:
      todayResponse.data.completed.map(
        (task) =>
          mapTodayTask(
            task,
            eventNames,
          ),
      ),
  }
}
