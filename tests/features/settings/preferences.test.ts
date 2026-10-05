import { describe, expect, it } from 'vitest'
import { getDailyLimitHours } from '@/features/settings/utils/preferences'

describe('preferencias de cuenta', () => {
  it.each([undefined, {}, { eventger: null }, { eventger: 'invalid' }, { eventger: { dailyLimitHours: '8' } }, { eventger: { dailyLimitHours: -1 } }, { eventger: { dailyLimitHours: 100 } }, { eventger: { dailyLimitHours: 0.5 } }, { eventger: { dailyLimitHours: 24 } }, { eventger: { dailyLimitHours: 2.001 } }])('usa el límite predeterminado ante metadatos ausentes o inválidos: %j', (metadata) => {
    expect(getDailyLimitHours(metadata)).toBe(6)
  })
  it.each([1, 2.3, 6, 7.5, 16])('lee una preferencia válida de %s horas', (value) => {
    expect(getDailyLimitHours({ eventger: { dailyLimitHours: value } })).toBe(value)
  })
})
