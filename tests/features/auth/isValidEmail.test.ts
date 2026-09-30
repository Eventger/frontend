import { describe, expect, it } from 'vitest'

import { isValidEmail } from '@/features/auth/utils/isValidEmail'

describe('isValidEmail', () => {
  it.each([
    'ana@example.com',
    'nombre.apellido@subdominio.example.co',
    ' usuario@example.com ',
  ])('acepta el correo válido %s', (email) => {
    expect(isValidEmail(email)).toBe(true)
  })

  it.each([
    '',
    'usuario',
    '@example.com',
    'usuario@example',
    'usuario@.com',
    'usuario@example.',
    'usuario@@example.com',
    'usuario @example.com',
  ])('rechaza el correo inválido %s', (email) => {
    expect(isValidEmail(email)).toBe(false)
  })
})
