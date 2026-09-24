import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getEvents } from '@/features/events/services/event.service'
import { getToday } from '@/features/today/services/today.service'
import type { TodayApiResponse } from '@/features/today/types/today.types'
import { apiRequest } from '@/lib/api'
import {
  buildTodayApiTask,
  todayEvents,
} from './today.fixtures'

vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('@/features/events/services/event.service', () => ({
  getEvents: vi.fn(),
}))

describe('getToday', () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset()
    vi.mocked(getEvents).mockReset()
    vi.mocked(getEvents).mockResolvedValue(todayEvents)
  })

  it('consulta GET /hoy y transforma todos los grupos', async () => {
    const response: TodayApiResponse = {
      success: true,
      data: {
        overdue: [
          buildTodayApiTask({
            id: 31,
            event: todayEvents[0].id,
            name: 'Tarea vencida',
            estimated_hours: '2.50',
          }),
        ],
        today: [
          buildTodayApiTask({
            id: 32,
            event: todayEvents[1].id,
            name: 'Tarea para hoy',
            estimated_hours: '1.25',
          }),
        ],
        upcoming: [
          buildTodayApiTask({
            id: 33,
            event: todayEvents[0].id,
            name: 'Tarea próxima',
            estimated_hours: '3.00',
          }),
        ],
        completed: [
          buildTodayApiTask({
            id: 34,
            event: todayEvents[1].id,
            state: 'completed',
            name: 'Tarea completada',
            estimated_hours: '4.75',
          }),
        ],
      },
    }
    vi.mocked(apiRequest).mockResolvedValue(response)

    const result = await getToday()

    expect(apiRequest).toHaveBeenCalledOnce()
    expect(apiRequest).toHaveBeenCalledWith('/hoy')
    expect(getEvents).toHaveBeenCalledOnce()
    expect(result).toEqual({
      overdue: [
        {
          id: 31,
          eventId: todayEvents[0].id,
          eventName: todayEvents[0].name,
          name: 'Tarea vencida',
          targetDate: response.data.overdue[0].target_date,
          estimatedHours: 2.5,
        },
      ],
      today: [
        {
          id: 32,
          eventId: todayEvents[1].id,
          eventName: todayEvents[1].name,
          name: 'Tarea para hoy',
          targetDate: response.data.today[0].target_date,
          estimatedHours: 1.25,
        },
      ],
      upcoming: [
        {
          id: 33,
          eventId: todayEvents[0].id,
          eventName: todayEvents[0].name,
          name: 'Tarea próxima',
          targetDate: response.data.upcoming[0].target_date,
          estimatedHours: 3,
        },
      ],
      completed: [
        {
          id: 34,
          eventId: todayEvents[1].id,
          eventName: todayEvents[1].name,
          name: 'Tarea completada',
          targetDate: response.data.completed[0].target_date,
          estimatedHours: 4.75,
        },
      ],
    })
  })

  it('ordena por fecha ascendente y desempata por menos horas', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      success: true,
      data: {
        overdue: [
          buildTodayApiTask({
            id: 3,
            target_date: '2026-09-23T23:59:59.000Z',
            estimated_hours: '4.00',
          }),
          buildTodayApiTask({
            id: 1,
            target_date: '2026-09-22T23:59:59.000Z',
            estimated_hours: '3.00',
          }),
          buildTodayApiTask({
            id: 2,
            target_date: '2026-09-23T08:00:00.000Z',
            estimated_hours: '1.00',
          }),
        ],
        today: [
          buildTodayApiTask({ id: 5, estimated_hours: '2.50' }),
          buildTodayApiTask({ id: 4, estimated_hours: '0.50' }),
        ],
        upcoming: [
          buildTodayApiTask({
            id: 8,
            target_date: '2026-09-28T23:59:59.000Z',
            estimated_hours: '1.00',
          }),
          buildTodayApiTask({
            id: 7,
            target_date: '2026-09-26T23:59:59.000Z',
            estimated_hours: '3.00',
          }),
          buildTodayApiTask({
            id: 6,
            target_date: '2026-09-26T08:00:00.000Z',
            estimated_hours: '1.50',
          }),
        ],
        completed: [],
      },
    } satisfies TodayApiResponse)

    const result = await getToday()

    expect(result.overdue.map((task) => task.id)).toEqual([1, 2, 3])
    expect(result.today.map((task) => task.id)).toEqual([4, 5])
    expect(result.upcoming.map((task) => task.id)).toEqual([6, 7, 8])
  })
})
