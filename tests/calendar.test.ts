import { describe, expect, it } from 'vitest'

import { formatDateInput, parseDateInput } from '@/lib/calendar'

describe('formato de entrada de fechas', () => {
  it('organiza una fecha ISO como día, mes y año', () => {
    expect(formatDateInput('2026-10-22')).toBe('22/10/2026')
  })

  it('convierte una fecha día/mes/año a ISO', () => {
    expect(parseDateInput('22/10/2026')).toBe('2026-10-22')
  })

  it('valida los días reales de cada mes y los años bisiestos', () => {
    expect(parseDateInput('31/02/2026')).toBeNull()
    expect(parseDateInput('29/02/2026')).toBeNull()
    expect(parseDateInput('29/02/2028')).toBe('2028-02-29')
  })
})
