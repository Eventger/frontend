/* oxlint-disable react/only-export-components -- Entrada aislada de auditoría visual. */
import {
  StrictMode,
  useState,
  type ReactNode,
} from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import '@/index.css'

import { OperationFeedback } from '@/components/OperationFeedback'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageContainer } from '@/components/layout/PageContainer'
import type { BreadcrumbItem } from '@/components/layout/PageBreadcrumbs'
import { PageContent } from '@/components/layout/PageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { AuthFeedbackModal } from '@/features/auth/components/AuthFeedbackModal'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { EmptyEventsState } from '@/features/events/components/EmptyEventsState'
import { EventsErrorState } from '@/features/events/components/EventsErrorState'
import { DeleteEventDialog } from '@/features/events/components/detail/DeleteEventDialog'
import { EmptyTasksState } from '@/features/events/components/detail/EmptyTasksState'
import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayPriorityGuide } from '@/features/today/components/TodayPriorityGuide'
import { TodayTaskCard } from '@/features/today/components/TodayTaskCard'
import { TodayPage } from '@/features/today/pages/TodayPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { EventsPage } from '@/features/events/pages/EventsPage'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { SecurityPage } from '@/features/settings/pages/SecurityPage'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'
import { dayPlan, schedulingTask } from '../features/events/planning.fixtures'

const eventBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Hoy', to: '/hoy' },
  { label: 'Eventos', to: '/eventos' },
  { label: 'Boda Laura & Daniel' },
]

function AppShell({
  children,
  fullPage = false,
  breadcrumbs = [{ label: 'Hoy', to: '/hoy' }, { label: 'Eventos' }],
}: {
  children: ReactNode
  fullPage?: boolean
  breadcrumbs?: BreadcrumbItem[]
}) {
  return (
    <div className="min-h-svh bg-[#f7f8fc] xl:flex">
      <AppSidebar />
      <main
        id="main-content"
        className="min-w-0 flex-1"
      >
        {fullPage ? children : <PageContainer breadcrumbs={breadcrumbs}>
          <PageContent>
            {children}
          </PageContent>
        </PageContainer>}
      </main>
    </div>
  )
}

function EventsEmptyFixture() {
  return (
    <AppShell>
      <PageHeader
        title="Eventos"
        description="Todos tus eventos y su estado de preparación."
        action={
          <PageHeaderCreateButton
            onClick={() => undefined}
          />
        }
      />
      <div className="mt-10">
        <EmptyEventsState />
      </div>
    </AppShell>
  )
}

function EventsErrorFixture() {
  return (
    <AppShell>
      <PageHeader
        title="Eventos"
        description="Todos tus eventos y su estado de preparación."
      />
      <div className="mt-10">
        <EventsErrorState onRetry={() => undefined} />
      </div>
    </AppShell>
  )
}

function FeedbackFixture({
  status = 'error',
}: {
  status?: 'success' | 'error'
}) {
  const isSuccess =
    status === 'success'

  return (
    <AppShell>
      <OperationFeedback
        pageTitle={
          isSuccess
            ? 'Evento actualizado'
            : 'Cambios no guardados'
        }
        status={status}
        title={
          isSuccess
            ? 'Los cambios se guardaron correctamente'
            : 'No pudimos actualizar el evento'
        }
        description={
          isSuccess
            ? 'La información y las tareas del evento se actualizaron correctamente.'
            : 'Ocurrió un problema al guardar los cambios. Conservamos la información y las tareas que editaste para que puedas intentarlo nuevamente.'
        }
        primaryAction={{
          label: isSuccess
            ? 'Volver al evento'
            : 'Intentar de nuevo',
          onClick: () => undefined,
        }}
        secondaryAction={{
          label: isSuccess
            ? 'Volver a editar'
            : 'Volver al evento',
          onClick: () => undefined,
        }}
      />
    </AppShell>
  )
}

type AuthFeedbackScenario =
  | 'account-created'
  | 'session-success'
  | 'email-account-not-found'
  | 'email-general-error'
  | 'email-network-error'
  | 'google-general-error'
  | 'google-network-error'

const authFeedbackScenarios: Record<
  AuthFeedbackScenario,
  {
    source: 'Correo' | 'Google'
    label: string
    variant: 'error' | 'success'
    title: string
    description: string
    primaryLabel: string
  }
> = {
  'account-created': {
    source: 'Correo',
    label: 'Cuenta creada',
    variant: 'success',
    title: 'Cuenta creada correctamente',
    description: 'Tu cuenta está lista. Ya puedes iniciar sesión con tu correo y contraseña.',
    primaryLabel: 'Iniciar sesión',
  },
  'session-success': {
    source: 'Correo',
    label: 'Sesión iniciada',
    variant: 'success',
    title: 'Sesión iniciada correctamente',
    description: 'Todo está listo. Puedes continuar al organizador de eventos.',
    primaryLabel: 'Continuar',
  },
  'email-account-not-found': {
    source: 'Correo',
    label: 'Cuenta no encontrada',
    variant: 'error',
    title: 'No encontramos tu cuenta',
    description: 'Verifica tu correo electrónico o crea una cuenta nueva.',
    primaryLabel: 'Crear cuenta',
  },
  'email-general-error': {
    source: 'Correo',
    label: 'Error general',
    variant: 'error',
    title: 'No pudimos iniciar sesión',
    description: 'Ocurrió un problema al iniciar sesión. Conservamos tus datos para que puedas revisarlos e intentarlo nuevamente.',
    primaryLabel: 'Intentar de nuevo',
  },
  'email-network-error': {
    source: 'Correo',
    label: 'Sin conexión',
    variant: 'error',
    title: 'Sin conexión',
    description: 'Revisa tu conexión a internet e inténtalo nuevamente.',
    primaryLabel: 'Reintentar',
  },
  'google-general-error': {
    source: 'Google',
    label: 'Error de Google',
    variant: 'error',
    title: 'No pudimos iniciar sesión',
    description: 'Ocurrió un problema al iniciar sesión. Conservamos tus datos para que puedas revisarlos e intentarlo nuevamente.',
    primaryLabel: 'Intentar de nuevo',
  },
  'google-network-error': {
    source: 'Google',
    label: 'Google sin conexión',
    variant: 'error',
    title: 'Sin conexión',
    description: 'Revisa tu conexión a internet e inténtalo nuevamente.',
    primaryLabel: 'Reintentar',
  },
}

function AuthFeedbackReviewFixture() {
  const [
    activeScenario,
    setActiveScenario,
  ] = useState<AuthFeedbackScenario | null>(
    null,
  )
  const [lastAction, setLastAction] =
    useState(
      'Selecciona un estado para verlo en acción.',
    )

  const activeFeedback =
    activeScenario
      ? authFeedbackScenarios[
          activeScenario
        ]
      : null

  return (
    <main className="min-h-svh bg-[#f7f8fc] px-4 py-10 sm:px-8">
      <section className="mx-auto max-w-[920px] rounded-[18px] border border-[#dde2ea] bg-white p-6 shadow-[0_10px_28px_rgba(23,33,43,0.08)] sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4f46e5]">
          Revisión local
        </p>
        <h1 className="mt-2 text-[28px] font-bold text-[#17212b]">
          Mensajes de acceso
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-[#667085]">
          Abre cada escenario para revisar su contenido y sus acciones. Los errores de Google reutilizan el diseño general, pero su botón de reintento vuelve a ejecutar Google.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {(['Correo', 'Google'] as const).map(
            (source) => (
              <div key={source}>
                <h2 className="text-[16px] font-semibold text-[#17212b]">
                  {source}
                </h2>
                <div className="mt-3 grid gap-3">
                  {Object.entries(
                    authFeedbackScenarios,
                  )
                    .filter(
                      ([, scenario]) =>
                        scenario.source ===
                        source,
                    )
                    .map(
                      ([key, scenario]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setLastAction(
                              `Abierto: ${scenario.label}`,
                            )
                            setActiveScenario(
                              key as AuthFeedbackScenario,
                            )
                          }}
                          className="flex min-h-11 items-center justify-between rounded-[10px] border border-[#dde2ea] px-4 text-left text-[13px] font-semibold text-[#17212b] transition-colors hover:border-[#a5b4fc] hover:bg-[#f8faff]"
                        >
                          {scenario.label}
                          <span className="text-[#4f46e5]">
                            Ver →
                          </span>
                        </button>
                      ),
                    )}
                </div>
              </div>
            ),
          )}
        </div>

        <output className="mt-8 block rounded-[10px] bg-[#eef2ff] px-4 py-3 text-[13px] text-[#3730a3]">
          {lastAction}
        </output>
      </section>

      {activeFeedback && (
        <AuthFeedbackModal
          open
          variant={
            activeFeedback.variant
          }
          title={activeFeedback.title}
          description={
            activeFeedback.description
          }
          secondaryLabel="Cerrar"
          primaryLabel={
            activeFeedback.primaryLabel
          }
          onSecondary={() => {
            setLastAction(
              `Cerrado: ${activeFeedback.label}`,
            )
            setActiveScenario(null)
          }}
          onPrimary={() => {
            setLastAction(
              `Acción ejecutada: ${activeFeedback.primaryLabel} (${activeFeedback.source})`,
            )
            setActiveScenario(null)
          }}
        />
      )}
    </main>
  )
}

function EmptyTasksFixture() {
  return (
    <AppShell breadcrumbs={eventBreadcrumbs}>
      <PageHeader
        title="Boda Laura & Daniel"
        description="Detalle y planificación del evento"
      />
      <div className="mt-16">
        <EmptyTasksState
          onAddTask={() => undefined}
          onEditEvent={() => undefined}
        />
      </div>
    </AppShell>
  )
}

function EventTaskFixture() {
  return (
    <AppShell breadcrumbs={eventBreadcrumbs}>
      <PageHeader
        title="Plan logístico"
        description="Comprobación con contenido largo y acciones disponibles"
      />
      <div className="mt-10 max-w-[1022px]">
        <EventTaskCard
          subtask={{
            id: 1,
            eventId: 1,
            state: 'in_progress',
            name: 'Coordinar transporte para invitados internacionales y confirmar todos los horarios de llegada',
            targetDate: '2026-10-21',
            estimatedHours: 12.5,
            details: 'Confirmar conductores, rutas, teléfonos de contacto y alternativas ante retrasos.',
          }}
        />
      </div>
    </AppShell>
  )
}

function TodayFixture() {
  const task = {
    id: 1,
    eventId: 1,
    eventName: 'Boda Laura & Daniel',
    name: 'Confirmar disponibilidad definitiva de proveedores internacionales',
    targetDate: '2026-10-21',
    estimatedHours: 4.5,
  }

  return (
    <AppShell breadcrumbs={[{ label: 'Hoy' }]}>
      <PageHeader
        title="Hoy"
        description="Miércoles, 30 de septiembre · Organiza primero lo que requiere atención"
        action={
          <PageHeaderCreateButton
            onClick={() => undefined}
          />
        }
      />
      <div className="mt-7">
        <TodaySummary
          overdueCount={2}
          todayCount={4}
          upcomingCount={7}
          plannedHours={12.5}
          dailyLimitHours={16}
        />
      </div>
      <div className="mt-3">
        <TodayPriorityGuide />
      </div>
      <div className="mt-6 max-w-[790px] space-y-3">
        <TodayTaskCard
          task={task}
          group="today"
          onOpenTask={() => undefined}
          onRescheduleTask={() => undefined}
        />
        <TodayTaskCard
          task={{ ...task, id: 2 }}
          group="upcoming"
          onOpenTask={() => undefined}
          onRescheduleTask={() => undefined}
        />
      </div>
    </AppShell>
  )
}

function DeleteDialogFixture() {
  return (
    <AppShell breadcrumbs={eventBreadcrumbs}>
      <PageHeader
        title="Boda Laura & Daniel"
        description="Detalle del evento"
      />
      <DeleteEventDialog
        open
        isDeleting={false}
        onOpenChange={() => undefined}
        onConfirm={() => undefined}
      />
    </AppShell>
  )
}

const view = new URLSearchParams(
  window.location.search,
).get('view')

function RescheduleFixture({ conflict = false, manyTasks = false, noSuggestion = false }: { conflict?: boolean; manyTasks?: boolean; noSuggestion?: boolean }) {
  const [open, setOpen] = useState(true)
  const conflictPlan = conflict ? {
    ...dayPlan(),
    ...(noSuggestion ? { suggestion: null } : {}),
    tasks: manyTasks ? Array.from({ length: 10 }, (_, index) => ({
      id: 71 + index, name: `Tarea planificada ${index + 1}`, event_name: 'Jornada y estados', estimated_hours: '0.5',
    })) : [
      { id: 71, name: 'Hoy: revisar logística', event_name: 'Jornada y estados', estimated_hours: '2.5' },
      { id: 72, name: 'Hoy: coordinar equipo', event_name: 'Jornada y estados', estimated_hours: '2.5' },
    ],
  } : undefined
  return <AppShell breadcrumbs={eventBreadcrumbs}><PageHeader title="Boda Laura & Daniel" description="Plan logístico" /><button type="button" className="mt-5 min-h-11 rounded-lg bg-[#4f46e5] px-4 text-white" onClick={() => setOpen(true)}>Abrir reprogramación</button>{open && <RescheduleTaskDialog task={schedulingTask} initialConflict={conflictPlan} initialInput={conflict ? { name: schedulingTask.name, targetDate: '2026-10-12', estimatedHours: 2, details: '' } : undefined} onClose={() => setOpen(false)} onSaved={() => undefined} />}</AppShell>
}

function BreadcrumbsFixture() {
  return (
    <AppShell breadcrumbs={[
      { label: 'Hoy', to: '/hoy' },
      { label: 'Eventos', to: '/eventos' },
      { label: 'Celebración internacional de graduación con proveedores e invitados de varias ciudades y un nombre muy largo sin espacios: InvitadosInternacionalesInvitadosInternacionalesInvitadosInternacionales', to: '/evento/21' },
      { label: 'Editar evento' },
    ]}>
      <PageHeader title="Editar evento" description="Comprueba la navegación con nombres largos y poco espacio disponible." />
    </AppShell>
  )
}

const fixtures: Record<string, ReactNode> = {
  login: <LoginPage />,
  signup: <SignUpPage />,
  'events-empty': <EventsEmptyFixture />,
  'events-error': <EventsErrorFixture />,
  feedback: <FeedbackFixture />,
  'feedback-success': (
    <FeedbackFixture status="success" />
  ),
  'auth-feedback-review': <AuthFeedbackReviewFixture />,
  'empty-tasks': <EmptyTasksFixture />,
  'event-task': <EventTaskFixture />,
  today: <TodayFixture />,
  'delete-dialog': <DeleteDialogFixture />,
  settings: <AppShell fullPage><SettingsPage /></AppShell>,
  security: <AppShell fullPage><SecurityPage /></AppShell>,
  reschedule: <RescheduleFixture />,
  conflict: <RescheduleFixture conflict />,
  'conflict-many': <RescheduleFixture conflict manyTasks />,
  'conflict-no-suggestion': <RescheduleFixture conflict noSuggestion />,
  breadcrumbs: <BreadcrumbsFixture />,
}

const navigationRouter = view === 'today-navigation' || view === 'layout-navigation' || view === 'events-pagination' ? createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/tests/visual/index.html', element: view === 'events-pagination' ? <EventsPage /> : <TodayPage /> },
      { path: '/hoy', element: <TodayPage /> },
      { path: '/eventos', element: <EventsPage /> },
      { path: '/crear', element: <CreateEventPage /> },
      { path: '/evento/:id', element: <EventDetailPage /> },
      { path: '/configuracion', element: <SettingsPage /> },
      { path: '/configuracion/seguridad', element: <SecurityPage /> },
    ],
  },
]) : null

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    {navigationRouter ? <RouterProvider router={navigationRouter} /> : <BrowserRouter>
      {fixtures[view ?? 'events-empty'] ?? fixtures['events-empty']}
    </BrowserRouter>}
  </StrictMode>,
)
