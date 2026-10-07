import { describe, expect, it } from 'vitest'
import { formatHoursDuration } from '@/lib/duration'

describe('formatHoursDuration', () => {
  it.each([
    ['3.75', '3 h 45 min'],
    ['2.75', '2 h 45 min'],
    [1.5, '1 h 30 min'],
    [1.25, '1 h 15 min'],
    [1, '1 h'],
    [0.25, '15 min'],
    [0, '0 min'],
    [0.01, '1 min'],
    [1.999, '2 h'],
  ])('presenta %s horas como %s', (value, expected) => {
    expect(formatHoursDuration(value)).toBe(expected)
  })
})
