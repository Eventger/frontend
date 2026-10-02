import { describe, expect, it } from 'vitest'
import { getDailyLimitHours } from '@/features/settings/utils/preferences'

describe('preferencias de cuenta', () => {
  it.each([undefined, {}, { eventger: null }, { eventger: 'invalid' }, { eventger: { dailyLimitHours: '8' } }, { eventger: { dailyLimitHours: -1 } }, { eventger: { dailyLimitHours: 100 } }, { eventger: { dailyLimitHours: 2.3 } }])('usa el límite predeterminado ante metadatos ausentes o inválidos: %j', (metadata) => {
    expect(getDailyLimitHours(metadata)).toBe(6)
  })
  it.each([0.5, 6, 7.5, 24])('lee una preferencia válida de %s horas', (value) => {
    expect(getDailyLimitHours({ eventger: { dailyLimitHours: value } })).toBe(value)
  })
})
