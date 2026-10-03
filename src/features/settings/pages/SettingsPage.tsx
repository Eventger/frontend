import { useState, type ReactNode } from 'react'
import { useUser } from '@clerk/react'
import type { UserResource } from '@clerk/react/types'
import { Link } from 'react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { InlineFeedback } from '@/components/feedback/InlineFeedback'
import { SettingsLoadingState } from '../components/SettingsLoadingState'
import googleIcon from '@/assets/auth/google.svg'
import { SettingsCard } from '../components/SettingsCard'
import { ProfileDialog } from '../components/ProfileDialog'
import { EmailDialog } from '../components/EmailDialog'
import { PreferencesForm } from '../components/PreferencesForm'
import { settingsSecondaryButton } from '../settings.styles'

function AccountRow({ title, description, children, action }: { title: string; description: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="grid min-h-[84px] items-center gap-4 border-t border-[#dde2ea] py-5 sm:grid-cols-[138px_minmax(0,1fr)] md:grid-cols-[138px_minmax(0,1fr)_auto]">
      <div>
        <h3 className="text-[13px] font-semibold text-[#17212b]">{title}</h3>
        <p className="mt-1 text-[11px] leading-4 text-[#667085]">{description}</p>
      </div>
      <div className="min-w-0 text-[13px] text-[#17212b]">{children}</div>
      {action && <div className="sm:col-start-2 md:col-auto">{action}</div>}
    </div>
  )
}

function AccountSettings({ user }: { user: UserResource }) {
  const [dialog, setDialog] = useState<'profile' | 'email' | null>(null)
  const [saved, setSaved] = useState('')
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
  return (
    <>
      <SettingsCard title="Cuenta, perfil y seguridad" description="Estos datos se gestionan de forma segura con Clerk.">
        <div className="flex flex-wrap items-center gap-4 pb-6 pt-6">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#4f46e5] text-base font-bold text-white">
            {user.hasImage ? <img src={user.imageUrl} alt="" className="size-full object-cover" /> : initials}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-semibold text-[#17212b]">{user.fullName || 'Usuario'}</h3>
            <p className="mt-1 text-xs text-[#667085]">Perfil administrado por Clerk</p>
          </div>
          <Button type="button" className={`${settingsSecondaryButton} w-full sm:w-auto sm:min-w-[177px]`} onClick={() => { setSaved(''); setDialog('profile') }}>Actualizar perfil</Button>
        </div>
        <AccountRow title="Correo principal" description="Inicio de sesión y avisos" action={<Button type="button" className={`${settingsSecondaryButton} w-full sm:w-auto sm:min-w-[177px]`} onClick={() => { setSaved(''); setDialog('email') }}>Administrar</Button>}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="break-all">{user.primaryEmailAddress?.emailAddress ?? 'Sin correo principal'}</span>
            {user.primaryEmailAddress && <span className="rounded-lg bg-[#eef2ff] px-3 py-1.5 text-[11px] font-medium text-[#4f46e5]">Principal</span>}
          </div>
        </AccountRow>
        <AccountRow title="Cuenta conectada" description="Acceso social">
          {user.externalAccounts.length === 0 ? <p className="text-[#667085]">No tienes cuentas conectadas.</p> : (
            <ul className="space-y-3">
              {user.externalAccounts.map((account) => (
                <li key={account.id} className="flex flex-wrap items-center gap-3">
                  {account.provider === 'google' && <img src={googleIcon} alt="" className="size-5 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold capitalize">{account.provider === 'google' ? 'Google' : account.provider.replaceAll('_', ' ')}</p>
                    <p className="mt-1 break-all text-[11px] text-[#667085]">{account.emailAddress || account.username || 'Cuenta vinculada'}</p>
                  </div>
                  <span className="text-xs font-medium text-[#027a48]">Conectada</span>
                </li>
              ))}
            </ul>
          )}
        </AccountRow>
        <AccountRow title="Seguridad" description="Contraseña y sesiones" action={<Button asChild className={`${settingsSecondaryButton} w-full sm:w-auto sm:min-w-[177px]`}><Link to="/configuracion/seguridad" viewTransition>Administrar seguridad</Link></Button>}>
          <p>Protección de la cuenta</p>
          <p className="mt-1 text-[11px] leading-4 text-[#667085]">Revisa contraseña, dispositivos y sesiones activas.</p>
        </AccountRow>
        {saved && <InlineFeedback variant="success">{saved}</InlineFeedback>}
      </SettingsCard>
      <PreferencesForm />
      {dialog === 'profile' && <ProfileDialog user={user} onClose={() => setDialog(null)} onSaved={() => setSaved('Tu perfil se actualizó correctamente.')} />}
      {dialog === 'email' && <EmailDialog user={user} onClose={() => setDialog(null)} onSaved={() => setSaved('Tu correo principal se actualizó correctamente.')} />}
    </>
  )
}

export function SettingsPage() {
  const { user, isLoaded } = useUser()
  return (
    <PageContainer breadcrumbs={[{ label: 'Hoy', to: '/hoy' }, { label: 'Configuración' }]}>
      <PageHeader title="Configuración de cuenta" description="Gestiona tu cuenta de Clerk y las preferencias de Eventger desde un solo lugar." />
      {!isLoaded ? <SettingsLoadingState /> : user && (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17.25rem]">
          <div className="min-w-0 space-y-6"><AccountSettings key={user.id} user={user} /></div>
          <aside aria-label="Acerca de tu configuración" className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <SettingsCard title="Gestionado por Clerk" tone="brand" compact className="[&_h2]:text-[#4f46e5]">
              <p className="mt-3 text-[13px] leading-[19px] text-[#17212b]">Perfil, correo, acceso con Google y seguridad permanecen sincronizados con tu cuenta real.</p>
            </SettingsCard>
            <SettingsCard title="¿Dónde se aplica Eventger?" tone="success" compact className="[&_h2]:text-[#027a48]">
              <p className="mt-3 text-[13px] leading-[19px] text-[#17212b]">El límite diario se aplica a tu capacidad de trabajo y a las alertas de sobrecarga en Hoy.</p>
            </SettingsCard>
            <SettingsCard title="Una sola experiencia" description="Clerk conserva la seguridad; Eventger presenta los ajustes dentro del mismo flujo." compact />
          </aside>
        </div>
      )}
    </PageContainer>
  )
}
