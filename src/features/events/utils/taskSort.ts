import { getCalendarDate } from '@/lib/calendar'
import type { Subtask } from '@/features/events/types/subtask.types'

function isValidDateString(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false
  const trimmed = dateStr.trim()
  if (!trimmed) return false
  return !Number.isNaN(new Date(trimmed).getTime())
}

/**
 * Ordena las tareas para la vista de detalle de un evento siguiendo los criterios UX:
 * 1. Tareas pendientes / activas primero; tareas completadas al final para no ocultar el trabajo pendiente.
 * 2. Entre tareas pendientes, aquellas con fecha válida van antes que tareas sin fecha.
 * 3. Orden cronológico ascendente estricto (fechas más antiguas/urgentes primero, fechas más lejanas después).
 * 4. Desempate en misma fecha: menor tiempo estimado primero (coherente con el modelo de Eventger).
 * 5. Desempate determinista: orden alfabético por nombre y luego ID.
 */
export function sortSubtasksForEventDetail(subtasks: readonly Subtask[]): Subtask[] {
  return [...subtasks].sort((left, right) => {
    // 1. Grupo principal: Tareas no completadas primero, completadas al final
    const isLeftCompleted = left.state === 'completed'
    const isRightCompleted = right.state === 'completed'

    if (isLeftCompleted !== isRightCompleted) {
      return isLeftCompleted ? 1 : -1
    }

    // 2. Tareas con fecha válida primero, tareas sin fecha después
    // Una tarea pospuesta no tiene fecha operativa, aunque el backend conserve
    // la última fecha para poder recuperarla cuando vuelva a programarse.
    const leftHasDate = left.state !== 'postponed' && isValidDateString(left.targetDate)
    const rightHasDate = right.state !== 'postponed' && isValidDateString(right.targetDate)

    if (leftHasDate !== rightHasDate) {
      return leftHasDate ? -1 : 1
    }

    if (leftHasDate && rightHasDate) {
      // 3. Comparación cronológica usando la fecha de calendario de Bogotá (YYYY-MM-DD)
      const leftCalDate = getCalendarDate(left.targetDate)
      const rightCalDate = getCalendarDate(right.targetDate)

      if (leftCalDate !== rightCalDate) {
        return leftCalDate.localeCompare(rightCalDate)
      }

      // Si comparten la misma fecha de calendario, comparar marcas de tiempo por si tienen horas explícitas
      const leftTime = new Date(left.targetDate).getTime()
      const rightTime = new Date(right.targetDate).getTime()
      if (leftTime !== rightTime) {
        return leftTime - rightTime
      }
    }

    // 4. Criterio secundario para empate en fecha (o sin fecha): menor tiempo estimado primero
    if (left.estimatedHours !== right.estimatedHours) {
      return left.estimatedHours - right.estimatedHours
    }

    // 5. Criterio terciario determinista: nombre alfabético y luego ID
    const nameDiff = left.name.localeCompare(right.name, 'es', { sensitivity: 'base' })
    if (nameDiff !== 0) {
      return nameDiff
    }

    return left.id - right.id
  })
}
