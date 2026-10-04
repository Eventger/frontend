import type { DayPlan } from '@/features/events/types/planning.types'

export const schedulingTask = {
  id: 70, name: 'Buscar proveedores', targetDate: '2026-10-10', estimatedHours: 2,
}

export function dayPlan(date = '2026-10-12', hours = 2): DayPlan {
  const existing = date === '2026-10-12' ? 5 : 0
  return {
    date, event_date: '2026-10-24', existing_hours: String(existing), added_hours: String(hours),
    planned_hours: String(existing + hours), daily_limit_hours: '6',
    overload_hours: String(Math.max(existing + hours - 6, 0)), has_conflict: existing + hours > 6,
    tasks: existing ? [{ id: 71, name: 'Confirmar catering', event_name: 'Otro evento', estimated_hours: '5' }] : [],
    suggestion: existing + hours > 6 ? { date: '2026-10-13', planned_hours: String(hours) } : null,
  }
}
