/* oxlint-disable react/only-export-components -- Entrada aislada de auditoría visual. */
import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import '@/index.css'

import { OperationFeedback } from '@/components/OperationFeedback'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { EmptyEventsState } from '@/features/events/components/EmptyEventsState'
import { EventsErrorState } from '@/features/events/components/EventsErrorState'
import { DeleteEventDialog } from '@/features/events/components/detail/DeleteEventDialog'
import { EmptyTasksState } from '@/features/events/components/detail/EmptyTasksState'
import { EventTaskCard } from '@/features/events/components/detail/EventTaskCard'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayTaskCard } from '@/features/today/components/TodayTaskCard'

function AppShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-svh bg-[#f7f8fc] xl:flex">
      <AppSidebar />
      <main
        id="main-content"
        className="min-w-0 flex-1"
      >
        <PageContainer>
          {children}
        </PageContainer>
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

function FeedbackFixture() {
  return (
    <AppShell>
      <OperationFeedback
        pageTitle="Cambios no guardados"
        status="error"
        title="No pudimos actualizar el evento"
        description="Ocurrió un problema al guardar los cambios. Conservamos la información y las tareas que editaste para que puedas intentarlo nuevamente."
        primaryAction={{
          label: 'Intentar de nuevo',
          onClick: () => undefined,
        }}
        secondaryAction={{
          label: 'Volver al evento',
          onClick: () => undefined,
        }}
      />
    </AppShell>
  )
}

function EmptyTasksFixture() {
  return (
    <AppShell>
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
    <AppShell>
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
          onEdit={() => undefined}
          onDelete={() => undefined}
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
    <AppShell>
      <PageHeader
        title="Hoy"
        description="Miércoles, 30 de septiembre · Organiza primero lo que requiere atención"
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
      <div className="mt-8 max-w-[790px] space-y-3">
        <TodayTaskCard
          task={task}
          group="today"
          onOpenTask={() => undefined}
        />
        <TodayTaskCard
          task={{ ...task, id: 2 }}
          group="upcoming"
          onOpenTask={() => undefined}
        />
      </div>
    </AppShell>
  )
}

function DeleteDialogFixture() {
  return (
    <AppShell>
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

const fixtures: Record<string, ReactNode> = {
  login: <LoginPage />,
  signup: <SignUpPage />,
  'events-empty': <EventsEmptyFixture />,
  'events-error': <EventsErrorFixture />,
  feedback: <FeedbackFixture />,
  'empty-tasks': <EmptyTasksFixture />,
  'event-task': <EventTaskFixture />,
  today: <TodayFixture />,
  'delete-dialog': <DeleteDialogFixture />,
}

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <BrowserRouter>
      {fixtures[view ?? 'events-empty'] ?? fixtures['events-empty']}
    </BrowserRouter>
  </StrictMode>,
)
