import { describe, expect, it } from 'vitest'
import { sortSubtasksForEventDetail } from '@/features/events/utils/taskSort'
import type { Subtask } from '@/features/events/types/subtask.types'

function makeTask(overrides: Partial<Subtask> = {}): Subtask {
  return {
    id: 1,
    eventId: 10,
    name: 'Tarea',
    targetDate: '2026-10-25',
    estimatedHours: 2,
    details: '',
    state: 'pending',
    ...overrides,
  }
}

describe('sortSubtasksForEventDetail', () => {
  it('ordena tareas pendientes ascendentemente por fecha (ejemplo del requerimiento)', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Instalar decoración', targetDate: '2026-10-30' }),
      makeTask({ id: 2, name: 'Comprar materiales', targetDate: '2026-10-25' }),
      makeTask({ id: 3, name: 'Preparar centros de mesa', targetDate: '2026-10-27' }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual([
      'Comprar materiales',
      'Preparar centros de mesa',
      'Instalar decoración',
    ])
  })

  it('ubica tareas vencidas antes que tareas de hoy y tareas futuras', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Futura (28 oct)', targetDate: '2026-10-28' }),
      makeTask({ id: 2, name: 'Vencida (15 oct)', targetDate: '2026-10-15' }),
      makeTask({ id: 3, name: 'Hoy (22 oct)', targetDate: '2026-10-22' }),
      makeTask({ id: 4, name: 'Próxima (24 oct)', targetDate: '2026-10-24' }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual([
      'Vencida (15 oct)',
      'Hoy (22 oct)',
      'Próxima (24 oct)',
      'Futura (28 oct)',
    ])
  })

  it('ubica las tareas completadas al final para no ocultar el trabajo pendiente (CA-03)', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Completada antigua', targetDate: '2026-10-10', state: 'completed' }),
      makeTask({ id: 2, name: 'Pendiente urgente', targetDate: '2026-10-15', state: 'pending' }),
      makeTask({ id: 3, name: 'Completada reciente', targetDate: '2026-10-20', state: 'completed' }),
      makeTask({ id: 4, name: 'En progreso futura', targetDate: '2026-10-25', state: 'in_progress' }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual([
      'Pendiente urgente',
      'En progreso futura',
      'Completada antigua',
      'Completada reciente',
    ])
  })

  it('ubica tareas sin fecha después de las tareas pendientes con fecha', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Sin fecha A', targetDate: '', state: 'pending' }),
      makeTask({ id: 2, name: 'Con fecha', targetDate: '2026-10-25', state: 'pending' }),
      makeTask({ id: 3, name: 'Sin fecha B', targetDate: '   ', state: 'in_progress' }),
      makeTask({ id: 4, name: 'Completada', targetDate: '2026-10-20', state: 'completed' }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual([
      'Con fecha',
      'Sin fecha A',
      'Sin fecha B',
      'Completada',
    ])
  })

  it('ubica las tareas pospuestas al final aunque conserven una fecha anterior', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Pospuesta', targetDate: '2026-10-15', state: 'postponed' }),
      makeTask({ id: 2, name: 'Vencida', targetDate: '2026-10-17' }),
      makeTask({ id: 3, name: 'Hoy', targetDate: '2026-10-22' }),
      makeTask({ id: 4, name: 'Próxima', targetDate: '2026-10-24' }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual(['Vencida', 'Hoy', 'Próxima', 'Pospuesta'])
  })

  it('desempata tareas en la misma fecha por menor tiempo estimado primero', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Tarea 4 horas', targetDate: '2026-10-25', estimatedHours: 4 }),
      makeTask({ id: 2, name: 'Tarea 1 hora', targetDate: '2026-10-25', estimatedHours: 1 }),
      makeTask({ id: 3, name: 'Tarea 2.5 horas', targetDate: '2026-10-25', estimatedHours: 2.5 }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual([
      'Tarea 1 hora',
      'Tarea 2.5 horas',
      'Tarea 4 horas',
    ])
  })

  it('desempata por horario explícito cuando comparten la misma fecha de calendario', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Tarde', targetDate: '2026-10-25T16:00:00-05:00', estimatedHours: 2 }),
      makeTask({ id: 2, name: 'Mañana', targetDate: '2026-10-25T09:00:00-05:00', estimatedHours: 2 }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual(['Mañana', 'Tarde'])
  })

  it('desempata alfabéticamente de forma determinista si fecha y horas son idénticas', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, name: 'Z - Tarea', targetDate: '2026-10-25', estimatedHours: 2 }),
      makeTask({ id: 2, name: 'A - Tarea', targetDate: '2026-10-25', estimatedHours: 2 }),
    ]

    const sorted = sortSubtasksForEventDetail(tasks)

    expect(sorted.map(t => t.name)).toEqual(['A - Tarea', 'Z - Tarea'])
  })

  it('no muta el arreglo original', () => {
    const tasks: Subtask[] = [
      makeTask({ id: 1, targetDate: '2026-10-30' }),
      makeTask({ id: 2, targetDate: '2026-10-20' }),
    ]
    const copy = [...tasks]

    sortSubtasksForEventDetail(tasks)

    expect(tasks[0].id).toBe(copy[0].id)
    expect(tasks[1].id).toBe(copy[1].id)
  })
})
