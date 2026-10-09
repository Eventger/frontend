import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSignIn } from '@clerk/react'

import { FieldError } from '@/components/feedback/FieldError'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type VerificationMethod = 'email_code' | 'phone_code' | 'totp' | 'backup_code'

const METHOD_LABELS: Record<VerificationMethod, string> = {
  email_code: 'Código por correo',
  phone_code: 'Código por SMS',
  totp: 'Aplicación de autenticación',
  backup_code: 'Código de respaldo',
}

function isSupportedMethod(method: string): method is VerificationMethod {
  return Object.hasOwn(METHOD_LABELS, method)
}

function isInvalidCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('errors' in error) ||
    !Array.isArray(error.errors)) return false

  return error.errors.some((item: unknown) =>
    item && typeof item === 'object' && 'code' in item &&
    ['form_code_incorrect', 'verification_expired', 'verification_failed']
      .includes(String(item.code)),
  )
}

type SignInVerificationFormProps = {
  onVerified: () => Promise<void>
  onBack: () => void
}

export function SignInVerificationForm({ onVerified, onBack }: SignInVerificationFormProps) {
  const { signIn, fetchStatus } = useSignIn()
  const methods = [...new Set(signIn.supportedSecondFactors
    ?.map(factor => factor.strategy).filter(isSupportedMethod) ?? [])]
  const [method, setMethod] = useState<VerificationMethod | undefined>(methods[0])
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [busy, setBusy] = useState(false)
  const codeRef = useRef<HTMLInputElement>(null)
  const isLoading = busy || fetchStatus === 'fetching'
  const requiresSending = method === 'email_code' || method === 'phone_code'

  useEffect(() => {
    if (!isLoading && method && (!requiresSending || codeSent)) {
      codeRef.current?.focus()
    }
  }, [codeSent, isLoading, method, requiresSending])

  const sendCode = async () => {
    if (isLoading || !requiresSending) return
    setBusy(true)
    setGeneralError('')
    setCodeError('')
    setCode('')
    try {
      const result = method === 'email_code'
        ? await signIn.mfa.sendEmailCode()
        : await signIn.mfa.sendPhoneCode()
      if (result.error) {
        setGeneralError('No pudimos enviar el código. Inténtalo de nuevo.')
        return
      }
      setCodeSent(true)
    } catch {
      setGeneralError('No pudimos conectarnos para enviar el código. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading || !method || (requiresSending && !codeSent)) return
    setCodeError('')
    setGeneralError('')
    const value = code.trim()
    if (method === 'backup_code' ? !value : !/^\d{6}$/.test(value)) {
      setCodeError(method === 'backup_code'
        ? 'Ingresa un código de respaldo.'
        : 'Ingresa el código de 6 dígitos.')
      codeRef.current?.focus()
      return
    }
    setBusy(true)
    try {
      const result = method === 'email_code' ? await signIn.mfa.verifyEmailCode({ code: value })
        : method === 'phone_code' ? await signIn.mfa.verifyPhoneCode({ code: value })
          : method === 'totp' ? await signIn.mfa.verifyTOTP({ code: value })
            : await signIn.mfa.verifyBackupCode({ code: value })
      if (result.error) {
        if (isInvalidCode(result.error)) {
          setCodeError('El código no es válido o ya expiró.')
          codeRef.current?.focus()
        } else {
          setGeneralError('No pudimos verificar el código. Inténtalo de nuevo.')
        }
        return
      }
      if (signIn.status !== 'complete') {
        setGeneralError('La verificación aún no está completa. Inténtalo de nuevo.')
        return
      }
      await onVerified()
    } catch {
      setGeneralError('No pudimos conectarnos para verificar el código. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  const goBack = async () => {
    if (isLoading) return
    setBusy(true)
    setGeneralError('')
    try {
      const result = await signIn.reset()
      if (result.error) {
        setGeneralError('No pudimos reiniciar el acceso. Inténtalo de nuevo.')
        return
      }
      onBack()
    } catch {
      setGeneralError('No pudimos reiniciar el acceso. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={verifyCode} className="auth-card__form mt-10" noValidate>
      {!method ? (
        <InlineFeedback>Esta cuenta requiere un método de verificación que no está disponible en este formulario. Vuelve al inicio de sesión para usar otro método de acceso.</InlineFeedback>
      ) : (
        <>
          {methods.length > 1 && (
            <div className="mb-5">
              <label htmlFor="login-verification-method" className="text-[12px] font-medium text-[#17212b]">Método de verificación</label>
              <select id="login-verification-method" value={method} disabled={isLoading}
                onChange={event => {
                  const next = event.target.value
                  if (!isSupportedMethod(next)) return
                  setMethod(next)
                  setCode('')
                  setCodeSent(false)
                  setCodeError('')
                  setGeneralError('')
                }}
                className="mt-2 h-11 w-full rounded-lg border border-border-subtle bg-white px-3 text-[13px] focus-visible:outline-2 focus-visible:outline-[#4f46e5]">
                {methods.map(value => <option key={value} value={value}>{METHOD_LABELS[value]}</option>)}
              </select>
            </div>
          )}
          <p id="login-verification-instructions" className="mb-5 text-[13px] text-[#667085]" role="status">
            {method === 'email_code' ? (codeSent ? 'Escribe el código enviado al correo de tu cuenta.' : 'Enviaremos un código al correo de tu cuenta para confirmar este navegador.')
              : method === 'phone_code' ? (codeSent ? 'Escribe el código enviado al teléfono de tu cuenta.' : 'Envía un código al teléfono de tu cuenta para continuar.')
                : method === 'totp' ? 'Escribe el código de tu aplicación de autenticación.' : 'Escribe uno de tus códigos de respaldo.'}
          </p>
          <label htmlFor="login-verification-code" className="text-[12px] font-medium text-[#17212b]">
            {method === 'backup_code' ? 'Código de respaldo' : 'Código de verificación'}
          </label>
          <Input ref={codeRef} id="login-verification-code" name="code" type="text"
            inputMode={method === 'backup_code' ? 'text' : 'numeric'} autoComplete="one-time-code"
            maxLength={method === 'backup_code' ? undefined : 6} value={code}
            disabled={isLoading || (requiresSending && !codeSent)} autoFocus={!requiresSending}
            aria-invalid={Boolean(codeError)} aria-describedby={`login-verification-instructions${codeError ? ' login-verification-code-error' : ''}`}
            onChange={event => {
              setCode(method === 'backup_code' ? event.target.value : event.target.value.replace(/\D/g, ''))
              setCodeError('')
              setGeneralError('')
            }} className="mt-2 h-11 rounded-lg px-3 text-[13px]" />
          {codeError && <FieldError id="login-verification-code-error">{codeError}</FieldError>}
          {requiresSending && (
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => void sendCode()}
              className="mt-5 h-11 w-full rounded-lg border-border-subtle text-[13px] font-semibold text-[#4f46e5]">
              {codeSent ? 'Reenviar código' : 'Enviar código'}
            </Button>
          )}
          <Button type="submit" disabled={isLoading || (requiresSending && !codeSent)}
            className="mt-5 h-11 w-full rounded-lg bg-[#4f46e5] text-[13px] font-semibold text-white hover:bg-[#4338ca]">
            {isLoading ? 'Verificando…' : 'Verificar y continuar'}
          </Button>
        </>
      )}
      {generalError && <InlineFeedback className="mt-4">{generalError}</InlineFeedback>}
      <Button type="button" variant="ghost" disabled={isLoading} onClick={() => void goBack()}
        className="mt-5 h-11 w-full rounded-lg text-[12px] font-semibold text-[#4f46e5]">
        Volver al inicio de sesión
      </Button>
    </form>
  )
}
