import { describe, expect, it } from 'vitest'
import { DailyLimitConflictError, getDailyLimitHours, validateDailyLimitForTasks } from '@/features/settings/utils/preferences'
import type { TodayData } from '@/features/today/types/today.types'
import { buildTodayTask } from '../today/today.fixtures'

describe('preferencias de cuenta', () => {
  it.each([undefined, {}, { eventger: null }, { eventger: 'invalid' }, { eventger: { dailyLimitHours: '8' } }, { eventger: { dailyLimitHours: -1 } }, { eventger: { dailyLimitHours: 100 } }, { eventger: { dailyLimitHours: 0.5 } }, { eventger: { dailyLimitHours: 24 } }, { eventger: { dailyLimitHours: 2.001 } }])('usa el límite predeterminado ante metadatos ausentes o inválidos: %j', (metadata) => {
    expect(getDailyLimitHours(metadata)).toBe(6)
  })
  it.each([1, 2.3, 6, 7.5, 16])('lee una preferencia válida de %s horas', (value) => {
    expect(getDailyLimitHours({ eventger: { dailyLimitHours: value } })).toBe(value)
  })
})

describe('carga diaria para reducir el límite', () => {
  function tasksForDay(durations: number[]): TodayData {
    return { overdue: [], today: [], completed: [], upcoming: durations.map((estimatedHours, id) => buildTodayTask({ id, estimatedHours })) }
  }

  it.each([
    { limit: 1, durations: [1, 1] },
    { limit: 3.5, durations: [2, 1.51] },
    { limit: 6, durations: [7] },
    { limit: 16, durations: [9, 9] },
  ])('rechaza $limit h cuando las tareas del día suman $durations', ({ limit, durations }) => {
    expect(() => validateDailyLimitForTasks(limit, tasksForDay(durations))).toThrow(DailyLimitConflictError)
  })

  it.each([
    { limit: 1, durations: [] },
    { limit: 1, durations: [0.5, 0.5] },
    { limit: 3.3, durations: [1.1, 2.2] },
    { limit: 6, durations: [2, 3] },
    { limit: 16, durations: [8, 8] },
  ])('permite $limit h cuando alcanzan para $durations', ({ limit, durations }) => {
    expect(() => validateDailyLimitForTasks(limit, tasksForDay(durations))).not.toThrow()
  })

  it('no suma días distintos ni tareas completadas y contempla tareas vencidas', () => {
    const tasks = tasksForDay([1])
    tasks.today = [buildTodayTask({ id: 10, targetDate: '2026-10-19', estimatedHours: 1 })]
    tasks.overdue = [buildTodayTask({ id: 11, targetDate: '2026-10-01', estimatedHours: 1 })]
    tasks.completed = [buildTodayTask({ id: 12, estimatedHours: 10 })]
    expect(() => validateDailyLimitForTasks(1, tasks)).not.toThrow()
    tasks.overdue[0].estimatedHours = 1.01
    expect(() => validateDailyLimitForTasks(1, tasks)).toThrow(DailyLimitConflictError)
  })

  it('indica el día de mayor carga y el mínimo para todas las fechas', () => {
    const tasks = tasksForDay([2])
    tasks.today = [buildTodayTask({ targetDate: '2026-10-19', estimatedHours: 4.5 })]
    expect(() => validateDailyLimitForTasks(1, tasks)).toThrow('Tienes 4,5 h programadas para el 19 de octubre de 2026. Usa al menos 4,5 h o reprograma.')
  })

  it.each([NaN, Infinity, -1])('no permite comprobar una carga inválida: %s', (hours) => {
    expect(() => validateDailyLimitForTasks(1, tasksForDay([hours]))).toThrow('No pudimos comprobar la carga de tus tareas.')
  })
})
