import type { Event } from '@/features/events/types/event.types'
import type { SubtaskApiData } from '@/features/events/types/subtask.types'
import type {
  TodayData,
  TodayTaskItem,
} from '@/features/today/types/today.types'

export const todayEvents: Event[] = [
  {
    id: 21,
    name: 'Boda Backend',
    typeId: 0,
    eventDate: '2026-10-24T00:00:00.000Z',
    location: 'Cali',
    contact: 'Laura 3001234567',
  },
  {
    id: 22,
    name: 'Conferencia Frontend',
    typeId: 1,
    eventDate: '2026-11-15T00:00:00.000Z',
    location: 'Bogotá',
    contact: 'Daniel 3109876543',
  },
]

export function buildTodayApiTask(
  overrides: Partial<SubtaskApiData> = {},
): SubtaskApiData {
  return {
    id: 31,
    event: todayEvents[0].id,
    state: 'pending',
    name: 'Confirmar proveedores',
    target_date: '2026-10-20T23:59:59.000Z',
    estimated_hours: '2.50',
    details: 'Llamar por la mañana.',
    created_at: '2026-09-24T12:00:00.000Z',
    updated_at: '2026-09-24T12:00:00.000Z',
    ...overrides,
  }
}

export function buildTodayTask(
  overrides: Partial<TodayTaskItem> = {},
): TodayTaskItem {
  return {
    id: 31,
    eventId: todayEvents[0].id,
    eventName: todayEvents[0].name,
    name: 'Confirmar proveedores',
    targetDate: '2026-10-20T23:59:59.000Z',
    estimatedHours: 2.5,
    ...overrides,
  }
}

export const todayDataFixture: TodayData = {
  overdue: [
    buildTodayTask({
      id: 31,
      name: 'Reservar transporte vencido',
      targetDate: '2026-09-22T23:59:59.000Z',
      estimatedHours: 1,
    }),
  ],
  today: [
    buildTodayTask({
      id: 32,
      name: 'Confirmar invitados hoy',
      targetDate: '2026-09-24T23:59:59.000Z',
      estimatedHours: 1.5,
    }),
    buildTodayTask({
      id: 33,
      eventId: todayEvents[1].id,
      eventName: todayEvents[1].name,
      name: 'Revisar presentación hoy',
      targetDate: '2026-09-24T23:59:59.000Z',
      estimatedHours: 2.25,
    }),
  ],
  upcoming: [
    buildTodayTask({
      id: 34,
      name: 'Confirmar menú próximo',
      targetDate: '2026-09-26T23:59:59.000Z',
      estimatedHours: 2,
    }),
  ],
  completed: [
    buildTodayTask({
      id: 35,
      name: 'Tarea completada oculta',
      targetDate: '2026-09-20T23:59:59.000Z',
      estimatedHours: 4,
    }),
  ],
}
