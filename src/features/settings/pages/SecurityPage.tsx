import { useState } from 'react'
import { useSession, useUser } from '@clerk/react'
import type { SessionWithActivitiesResource, UserResource } from '@clerk/react/types'
import { CircleCheck, KeyRound, Monitor, ShieldCheck, Smartphone, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { SettingsLoadingState } from '../components/SettingsLoadingState'
import { SettingsCard } from '../components/SettingsCard'
import { PasswordDialog } from '../components/PasswordDialog'
import { DeleteAccountDialog } from '../components/DeleteAccountDialog'
import { useAccountSessions } from '../hooks/useAccountSessions'
import { settingsSecondaryButton } from '../settings.styles'

function activityDate(value: Date) {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(value)
}

function deviceDetails(session: SessionWithActivitiesResource) {
  const activity = session.latestActivity
  return {
    device: activity.deviceType || 'Dispositivo',
    browser: [activity.browserName, activity.browserVersion].filter(Boolean).join(' ') || 'Navegador no disponible',
    location: [activity.city, activity.country].filter(Boolean).join(', '),
  }
}

function SecuritySettings({ user, currentSessionId }: { user: UserResource; currentSessionId: string | undefined }) {
  const [dialog, setDialog] = useState<'password' | 'delete' | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const { sessions, loading, error, revokingId, notice, needsPageReload, reload, revokeSession, confirmOtherSessionsClosed } = useAccountSessions(user, currentSessionId)
  const current = sessions.find((session) => session.id === currentSessionId)
  const googleAccount = user.externalAccounts.find((account) => account.provider === 'google')

  return (
    <>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17.25rem]">
        <div className="min-w-0 space-y-6">
          <SettingsCard title="Acceso y contraseña" description={user.passwordEnabled ? 'Tienes una contraseña configurada para esta cuenta.' : 'No tienes una contraseña configurada para esta cuenta.'} headerIcon={<KeyRound size={21} aria-hidden="true" />} className="py-8 sm:py-8" action={<Button type="button" className={`${settingsSecondaryButton} w-full sm:w-auto`} onClick={() => { setPasswordSaved(false); setDialog('password') }}>{user.passwordEnabled ? 'Cambiar contraseña' : 'Establecer contraseña'}</Button>}>
            <InlineFeedback variant="info" className="mt-5 border-transparent py-4 text-[#17212b]">
              {googleAccount ? 'Tu cuenta usa Google. La contraseña es opcional, pero añade una alternativa de acceso.' : 'Una contraseña segura te permite proteger el acceso a tu cuenta.'}
            </InlineFeedback>
            {passwordSaved && <InlineFeedback variant="success" className="mt-3">Tu contraseña se guardó correctamente.</InlineFeedback>}
          </SettingsCard>
          <SettingsCard title="Dispositivos activos" description="Revisa dónde está abierta tu cuenta y cierra sesiones que no reconozcas." action={!loading && !error && <span className="inline-flex rounded-full bg-[#eef2ff] px-4 py-1 text-xs text-[#4f46e5]">{sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}</span>}>
            {loading && <div role="status" aria-label="Cargando dispositivos activos" className="mt-6 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>}
            {error && <div className="mt-5 space-y-3"><InlineFeedback>{error}</InlineFeedback><Button type="button" disabled={Boolean(revokingId) || loading} className={settingsSecondaryButton} onClick={() => needsPageReload ? window.location.reload() : void reload()}>{needsPageReload ? 'Recargar página' : 'Reintentar'}</Button></div>}
            {!loading && !error && sessions.length === 0 && <p className="mt-6 text-sm text-[#667085]">No hay dispositivos activos para mostrar.</p>}
            {!loading && <ul className="mt-5 divide-y divide-[#dde2ea]">
              {sessions.map((session) => {
                const isCurrent = session.id === currentSessionId
                const details = deviceDetails(session)
                const Icon = session.latestActivity.isMobile ? Smartphone : Monitor
                return (
                  <li key={session.id} className="flex flex-wrap items-center gap-4 py-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#17212b]"><Icon size={21} aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1 space-y-1.5 text-[13px] text-[#667085]">
                      <div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold text-[#17212b]">{details.device}</h3>{isCurrent && <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-xs text-[#027a48]">Este dispositivo</span>}</div>
                      <p className="break-words">{details.browser}</p>
                      {(session.latestActivity.ipAddress || details.location) && <p className="break-words">{[session.latestActivity.ipAddress, details.location].filter(Boolean).join(' · ')}</p>}
                      <p className="text-xs">{activityDate(session.lastActiveAt)}</p>
                    </div>
                    {isCurrent ? <span className="flex items-center gap-2 text-xs font-medium text-[#027a48]"><CircleCheck size={15} aria-hidden="true" />Sesión actual</span> : <Button type="button" variant="ghost" className="min-h-11 h-auto whitespace-normal px-2 py-3 text-xs text-[#4f46e5] hover:bg-[#eef2ff]" disabled={Boolean(revokingId) || !currentSessionId} onClick={() => void revokeSession(session.id)} aria-label={`Cerrar sesión: ${details.device} · ${details.browser} · ${activityDate(session.lastActiveAt)}`}><CircleCheck size={15} aria-hidden="true" />{revokingId === session.id ? 'Cerrando…' : 'Cerrar sesión'}</Button>}
                  </li>
                )
              })}
            </ul>}
            {notice && <InlineFeedback variant="success" className="mt-3">{notice}</InlineFeedback>}
          </SettingsCard>
          <SettingsCard title="Eliminar cuenta" description="Se eliminarán tu perfil y acceso en Clerk. Esta acción no se puede deshacer." tone="danger" headerIcon={<Trash2 size={20} aria-hidden="true" />} className="py-8 sm:py-8" action={<Button type="button" disabled={!user.deleteSelfEnabled} className="min-h-11 h-auto w-full whitespace-normal rounded-[10px] bg-[#b42318] px-4 py-3 font-semibold text-white hover:bg-[#912018] focus-visible:ring-[#b42318] sm:w-auto sm:min-w-[177px]" onClick={() => setDialog('delete')}>Eliminar cuenta</Button>}>
            <p className="mt-6 text-xs leading-[18px] text-[#b42318]">{user.deleteSelfEnabled ? 'Solicitaremos una confirmación adicional antes de eliminar tu cuenta.' : 'La eliminación de cuenta no está habilitada para tu cuenta.'}</p>
          </SettingsCard>
        </div>
        <aside aria-label="Acerca de la seguridad de tu cuenta" className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <SettingsCard title="Protegido por Clerk" description="Clerk gestiona el acceso, las sesiones y las acciones sensibles de tu cuenta." tone="brand" compact icon={<ShieldCheck size={22} aria-hidden="true" />} />
          <SettingsCard title="Recomendación" description="Configura una contraseña como método alternativo y revisa periódicamente tus sesiones abiertas." compact>
            {googleAccount && <p className="mt-5 flex items-center gap-2 text-xs text-[#027a48]"><CircleCheck size={16} aria-hidden="true" />Cuenta vinculada con Google</p>}
          </SettingsCard>
          {current && <SettingsCard title="Sesión actual" tone="success" compact>
            <span className="mt-3 inline-flex rounded-full bg-white px-4 py-1 text-xs text-[#027a48]">Protegida</span>
            <p className="mt-3 break-words text-[13px] text-[#17212b]">{deviceDetails(current).device} · {deviceDetails(current).browser}</p>
            <p className="mt-3 text-xs leading-4 text-[#667085]">{deviceDetails(current).location}<br />Actividad reciente: {activityDate(current.lastActiveAt)}</p>
          </SettingsCard>}
          <SettingsCard title="Acción irreversible" tone="danger" compact icon={<Trash2 size={20} className="text-[#b42318]" aria-hidden="true" />}>
            <p className="mt-3 text-xs leading-[18px] text-[#17212b]">Eliminar tu cuenta revoca tu acceso. Los eventos y tareas de Eventger no se eliminan con esta acción.</p>
          </SettingsCard>
        </aside>
      </div>
      {dialog === 'password' && <PasswordDialog user={user} onClose={() => setDialog(null)} onSaved={(otherSessionsClosed) => { setPasswordSaved(true); if (otherSessionsClosed) confirmOtherSessionsClosed() }} />}
      {dialog === 'delete' && <DeleteAccountDialog user={user} onClose={() => setDialog(null)} />}
    </>
  )
}

export function SecurityPage() {
  const { user, isLoaded } = useUser()
  const { session } = useSession()
  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Seguridad de la cuenta" description="Administra tu contraseña, revisa los dispositivos activos y controla las acciones sensibles." />
        <Button asChild className={`${settingsSecondaryButton} self-start sm:mt-3`}><Link to="/configuracion" viewTransition>Volver a configuración</Link></Button>
      </div>
      {!isLoaded ? <SettingsLoadingState /> : user && <SecuritySettings key={user.id} user={user} currentSessionId={session?.id} />}
    </PageContainer>
  )
}
