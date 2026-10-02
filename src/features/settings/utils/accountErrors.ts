import { isClerkAPIResponseError, isReverificationCancelledError } from '@clerk/react/errors'

export function getAccountError(error: unknown, fallback: string) {
  if (isReverificationCancelledError(error)) return 'La verificación se canceló. No se realizó el cambio.'
  if (!isClerkAPIResponseError(error)) return fallback
  const codes = error.errors.map((item) => item.code)
  if (codes.some((code) => ['form_identifier_exists', 'form_email_address_exists'].includes(code))) {
    return 'Este correo electrónico ya está asociado a otra cuenta.'
  }
  if (codes.some((code) => ['form_code_incorrect', 'verification_expired', 'verification_failed'].includes(code))) {
    return 'El código no es válido o ya expiró.'
  }
  if (codes.includes('form_password_incorrect')) return 'La contraseña actual no es correcta.'
  if (codes.some((code) => ['form_password_pwned', 'form_password_compromised'].includes(code))) {
    return 'Esta contraseña aparece en una filtración de datos. Elige otra.'
  }
  if (codes.includes('too_many_requests')) return 'Demasiados intentos. Espera un momento antes de volver a intentarlo.'
  return fallback
}
