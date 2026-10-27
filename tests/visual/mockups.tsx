/* oxlint-disable react/only-export-components */
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import {
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  X,
  Minus,
  Plus,
  CalendarClock,
  CheckSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react'

import '@/index.css'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageContent } from '@/components/layout/PageContent'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageHeaderCreateButton } from '@/components/layout/PageHeaderCreateButton'
import { PageTitle } from '@/components/layout/PageTitle'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayPriorityGuide } from '@/features/today/components/TodayPriorityGuide'
import { TodayTaskCard } from '@/features/today/components/TodayTaskCard'
import { EventInfoCard } from '@/features/events/components/detail/EventInfoCard'
import { Button } from '@/components/ui/button'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'
import type { Subtask } from '@/features/events/types/subtask.types'

const sampleSubtasks: Subtask[] = [
  {
    id: 1,
    eventId: 10,
    name: 'Contratación de catering para cena',
    targetDate: '2026-10-28',
    estimatedHours: 2,
    state: 'pending',
    details: 'Menú de 3 tiempos y degustación previa.',
  },
  {
    id: 2,
    eventId: 10,
    name: 'Confirmar lista de invitados VIP',
    targetDate: '2026-10-28',
    estimatedHours: 1.5,
    state: 'pending',
    details: 'Llamar a los 15 invitados principales.',
  },
  {
    id: 3,
    eventId: 10,
    name: 'Coordinar equipo de sonido e iluminación',
    targetDate: '2026-10-28',
    estimatedHours: 2.5,
    state: 'pending',
    details: 'Pruebas técnicas de micrófonos inalámbricos.',
  },
  {
    id: 4,
    eventId: 10,
    name: 'Diseño e impresión de minutas y acreditaciones',
    targetDate: '2026-11-05',
    estimatedHours: 3,
    state: 'in_progress',
    details: 'Revisión final de tipografía con los novios.',
  },
  {
    id: 5,
    eventId: 10,
    name: 'Montaje de floristería y centros de mesa',
    targetDate: '2026-11-10',
    estimatedHours: 4,
    state: 'pending',
    details: 'Rosas blancas y follaje eucalipto.',
  },
]

function AppShell({
  children,
  breadcrumbs = [{ label: 'Hoy' }],
}: {
  children: React.ReactNode
  breadcrumbs?: Array<{ label: string; to?: string }>
}) {
  return (
    <div className="min-h-svh bg-[#f7f8fc] xl:flex">
      <AppSidebar />
      <main id="main-content" className="min-w-0 flex-1">
        <PageContainer breadcrumbs={breadcrumbs}>
          <PageContent>{children}</PageContent>
        </PageContainer>
      </main>
    </div>
  )
}

// -------------------------------------------------------------
// Componente de fondo del Detalle de Evento Real
// -------------------------------------------------------------
function EventDetailViewReal({
  selectedIds,
  onToggle,
  onSelectAll,
  onOpenBatchDialog,
  isSelectionMode,
  onToggleSelectionMode,
}: {
  selectedIds: number[]
  onToggle: (id: number) => void
  onSelectAll: () => void
  onOpenBatchDialog?: () => void
  isSelectionMode: boolean
  onToggleSelectionMode: () => void
}) {
  const selectedCount = selectedIds.length
  const totalSelectedHours = sampleSubtasks
    .filter((t) => selectedIds.includes(t.id))
    .reduce((sum, t) => sum + t.estimatedHours, 0)

  return (
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-5 sm:min-h-16 sm:flex-row sm:items-start">
        <PageTitle>Boda Laura & Daniel</PageTitle>
        <div className="flex shrink-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-lg border-[#dde2ea] bg-white px-5 font-semibold text-[#17212b] hover:bg-[#f8fafc]"
          >
            Editar evento
          </Button>
          <Button
            type="button"
            className="h-11 rounded-lg bg-[#c1241b] px-5 font-semibold text-white hover:bg-[#a81f18]"
          >
            Eliminar
          </Button>
        </div>
      </header>

      <EventInfoCard
        eventDate="2026-11-14T18:00:00-05:00"
        location="Jardín Botánico Central, Cali"
        contact="Laura Restrepo 3001234567"
        subtasks={sampleSubtasks}
        eventTypeName="Boda"
      />

      <section className="w-full mt-7 pb-28">
        <div className="flex min-h-12 w-full flex-col justify-between gap-4 sm:flex-row sm:items-start border-b border-[#dde2ea] pb-4">
          <div>
            <h2 className="type-section-title text-[#17212b]">Plan logístico</h2>
            <p className="mt-0.5 text-xs text-[#667085]">
              Actividades y tareas programadas para este evento.
            </p>
          </div>

          {/* ACCIONES DE CABECERA: Mutuamente Excluyentes para Cero Sobresaturación */}
          <div className="flex flex-wrap items-center gap-2">
            {!isSelectionMode ? (
              /* MODO NORMAL: Tus acciones actuales exactas + botón para entrar a selección */
              <>
                <button
                  type="button"
                  onClick={onToggleSelectionMode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#dde2ea] bg-white px-3.5 py-2 text-xs font-semibold text-[#344054] shadow-xs hover:bg-[#f9fafb] transition-colors"
                >
                  <CheckSquare className="size-4 text-[#4f46e5]" />
                  <span>Seleccionar tareas</span>
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-[#eef2ff] px-3.5 py-2 text-xs font-semibold text-[#3730a3] hover:bg-[#e0e7ff]"
                >
                  Ver progreso detallado
                </button>
              </>
            ) : (
              /* MODO SELECCIÓN EN LOTE: Se ocultan los botones normales para evitar sobrecarga */
              <>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#4f46e5] bg-[#eef2ff] px-3 py-1.5 text-xs font-semibold text-[#4338ca]">
                  <CheckSquare className="size-4" />
                  <span>{selectedCount} seleccionadas</span>
                </span>
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-xs font-medium text-[#667085] hover:text-[#17212b] px-2 py-1"
                >
                  Seleccionar todas
                </button>
                <button
                  type="button"
                  onClick={onToggleSelectionMode}
                  className="rounded-lg border border-[#dde2ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] hover:bg-[#f2f4f7]"
                >
                  Salir de selección
                </button>
              </>
            )}
          </div>
        </div>

        {/* LISTA DE TARJETAS: En modo selección las acciones individuales se repliegan */}
        <div className="mt-4 space-y-3">
          {sampleSubtasks.map((task) => {
            const isSelected = selectedIds.includes(task.id)
            return (
              <div
                key={task.id}
                onClick={() => isSelectionMode && onToggle(task.id)}
                className={`group relative flex items-center gap-4 rounded-2xl border bg-white p-4 transition-all duration-150 ${
                  isSelectionMode ? 'cursor-pointer' : ''
                } ${
                  isSelectionMode && isSelected
                    ? 'border-[#4f46e5] ring-2 ring-[#4f46e5]/15 shadow-sm'
                    : 'border-[#dde2ea] hover:border-[#cbd5e1] hover:shadow-xs'
                }`}
              >
                {/* Checkbox solo visible en Modo Selección */}
                {isSelectionMode && (
                  <div
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isSelected
                        ? 'border-[#4f46e5] bg-[#4f46e5] text-white'
                        : 'border-[#d0d5dd] bg-white group-hover:border-[#98a2b3]'
                    }`}
                  >
                    {isSelected && <Check className="size-3.5 stroke-[3]" />}
                  </div>
                )}

                <div
                  className={`h-10 w-1 shrink-0 rounded-full ${
                    task.state === 'in_progress'
                      ? 'bg-[#4338ca]'
                      : task.targetDate === '2026-10-28'
                        ? 'bg-[#c2410c]'
                        : 'bg-[#175cd3]'
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        task.state === 'in_progress'
                          ? 'bg-[#eef2ff] text-[#4338ca]'
                          : task.targetDate === '2026-10-28'
                            ? 'bg-[#fff7e6] text-[#c2410c]'
                            : 'bg-[#eff8ff] text-[#175cd3]'
                      }`}
                    >
                      {task.state === 'in_progress'
                        ? 'En progreso'
                        : task.targetDate === '2026-10-28'
                          ? 'Hoy'
                          : 'Próxima'}
                    </span>
                    <h4 className="text-sm font-semibold text-[#17212b] truncate">
                      {task.name}
                    </h4>
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-xs text-[#667085]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {task.targetDate}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {task.estimatedHours} h
                    </span>
                  </div>
                </div>

                {/* ACCIONES DE LA TARJETA:
                    En Modo Normal: Muestra tus botones habituales (Registrar avance + Acciones v)
                    En Modo Selección: Se ocultan para que no haya 20 botones compitiendo en pantalla
                */}
                {!isSelectionMode ? (
                  <div className="hidden sm:flex items-center gap-2">
                    {task.state === 'in_progress' && (
                      <button
                        type="button"
                        className="rounded-lg bg-[#4f46e5] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#4338ca]"
                      >
                        Registrar avance
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-lg border border-[#dde2ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] hover:bg-[#f9fafb] shadow-xs"
                    >
                      Acciones ▾
                    </button>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                      isSelected ? 'text-[#4338ca] font-semibold' : 'text-[#98a2b3]'
                    }`}>
                      {isSelected ? '✓ Marcada' : 'Hacer clic para marcar'}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* BARRA FLOTANTE DE ACCIONES POR LOTES:
          Solo visible en Modo Selección cuando hay al menos 1 tarea marcada
      */}
      {isSelectionMode && selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-[840px] -translate-x-1/2 rounded-2xl border border-[#dde2ea] bg-white/95 px-5 py-3.5 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-6 duration-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-7 items-center justify-center rounded-full bg-[#4f46e5] text-white">
                <Check className="size-4 stroke-[3]" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#17212b]">
                  {selectedCount} tareas seleccionadas
                </span>
                <span className="ml-2 rounded-md bg-[#f2f4f7] px-2 py-0.5 text-xs font-semibold text-[#475467]">
                  {totalSelectedHours} h en total
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenBatchDialog}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#4f46e5] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#4338ca] transition-colors"
              >
                <CalendarClock className="size-4" />
                <span>Mover a otra fecha</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#dde2ea] bg-white px-3.5 py-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
              >
                Posponer
              </button>
              <button
                type="button"
                onClick={onToggleSelectionMode}
                className="rounded-xl px-3 py-2 text-xs font-medium text-[#667085] hover:text-[#17212b]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// MOCKUP 1: Cambio de Capacidad Diaria (Protección contra Deformación con N Tareas)
// -------------------------------------------------------------
function MockupCapacityDialog() {
  const [hours, setHours] = useState(4)
  const [conflictType, setConflictType] = useState<'single' | 'many'>('many')

  const todayTasks = [
    {
      id: 101,
      eventId: 10,
      eventName: 'Boda Laura & Daniel',
      name: 'Contratación de catering para cena',
      targetDate: '2026-10-28',
      estimatedHours: 2,
      state: 'pending' as const,
      details: '',
    },
    {
      id: 102,
      eventId: 10,
      eventName: 'Boda Laura & Daniel',
      name: 'Confirmar lista de invitados VIP',
      targetDate: '2026-10-28',
      estimatedHours: 2,
      state: 'pending' as const,
      details: '',
    },
  ]

  const manyConflictDates = [
    { date: 'Miércoles, 28 oct', planned: '6 h', excess: '+2 h', tasksCount: 3, solution: 'Mover 1 tarea al Jue 29 oct' },
    { date: 'Viernes, 30 oct', planned: '5 h', excess: '+1 h', tasksCount: 2, solution: 'Mover 1 tarea al Sáb 31 oct' },
    { date: 'Lunes, 02 nov', planned: '6.5 h', excess: '+2.5 h', tasksCount: 4, solution: 'Mover 2 tareas al Mar 03 nov' },
    { date: 'Miércoles, 04 nov', planned: '5.5 h', excess: '+1.5 h', tasksCount: 3, solution: 'Mover 1 tarea al Jue 05 nov' },
  ]

  return (
    <AppShell breadcrumbs={[{ label: 'Hoy' }]}>
      <PageHeader
        title="Hoy"
        description="Miércoles, 28 de octubre · Organiza primero lo que requiere atención"
        action={<PageHeaderCreateButton onClick={() => undefined} />}
      />

      <div className="mt-7">
        <TodaySummary
          overdueCount={1}
          todayCount={3}
          upcomingCount={4}
          plannedHours={6}
          dailyLimitHours={6}
        />
      </div>

      <div className="mt-3">
        <TodayPriorityGuide />
      </div>

      <div className="mt-6 space-y-3">
        {todayTasks.map((t) => (
          <TodayTaskCard
            key={t.id}
            task={t}
            group="today"
            onOpenTask={() => undefined}
            onRegisterProgress={() => undefined}
            onRescheduleTask={() => undefined}
          />
        ))}
      </div>

      {/* Modal Protegido contra Deformación de Cards */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
        <div className="relative w-full max-w-[520px] rounded-3xl border border-[#dde2ea] bg-white p-6 shadow-2xl sm:p-7 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100svh-2rem)]">
          <button
            type="button"
            className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-xl border border-[#dde2ea] text-[#667085] hover:bg-[#f9fafb]"
          >
            <X className="size-4" />
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-[#17212b]">
              Tus horas disponibles
            </h2>
            <p className="mt-1 text-xs text-[#667085]">
              Establece cuántas horas al día quieres dedicar a tus tareas.
            </p>
          </div>

          {/* Stepper numérico */}
          <div className="mx-auto mt-4 flex w-full max-w-[240px] items-center justify-between rounded-2xl border border-[#dde2ea] bg-[#fcfcfd] p-1.5">
            <button
              type="button"
              onClick={() => setHours(Math.max(1, hours - 1))}
              className="flex size-10 items-center justify-center rounded-full bg-[#f2f4f7] text-[#475467] hover:bg-[#e4e7ec]"
            >
              <Minus className="size-4 stroke-[3]" />
            </button>
            <div className="flex flex-col items-center px-3">
              <span className="text-2xl font-extrabold text-[#17212b]">{hours}</span>
              <span className="text-[10px] font-medium text-[#667085]">horas / día</span>
            </div>
            <button
              type="button"
              onClick={() => setHours(hours + 1)}
              className="flex size-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5] hover:bg-[#e0e7ff]"
            >
              <Plus className="size-4 stroke-[3]" />
            </button>
          </div>

          {/* Toggle de simulación para comprobar que no hay deformación */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setConflictType('single')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                conflictType === 'single'
                  ? 'bg-[#eef2ff] text-[#4338ca] font-bold'
                  : 'text-[#667085] hover:bg-[#f2f4f7]'
              }`}
            >
              Ver: 1 fecha (3 tareas)
            </button>
            <span className="text-xs text-[#d0d5dd]">|</span>
            <button
              type="button"
              onClick={() => setConflictType('many')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                conflictType === 'many'
                  ? 'bg-[#eef2ff] text-[#4338ca] font-bold'
                  : 'text-[#667085] hover:bg-[#f2f4f7]'
              }`}
            >
              Ver: 4 fechas (12 tareas)
            </button>
          </div>

          {/* CONTENEDOR DE DIAGNÓSTICO ESTABLE (NUNCA SE DEFORMA) */}
          <div className="mt-3.5 rounded-2xl border border-[#fedf89] bg-[#fffcf5] p-4 text-left overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fef0c7] text-[#b54708]">
                <AlertTriangle className="size-3" />
              </div>
              <h4 className="text-xs font-bold text-[#b54708]">
                {conflictType === 'single'
                  ? '1 fecha supera tu nuevo límite de 4 h/día'
                  : '4 fechas superan tu nuevo límite de 4 h/día (12 tareas involucradas)'}
              </h4>
            </div>

            {/* CASO A: 1 sola fecha con conflicto */}
            {conflictType === 'single' ? (
              <div className="mt-3">
                <div className="flex items-center justify-between rounded-xl border border-[#fef0c7] bg-white p-3 text-xs shadow-xs">
                  <div>
                    <span className="text-[11px] text-[#667085] block">Miércoles 28 oct (6 h):</span>
                    <span className="font-semibold text-[#17212b]">Mover 1 tarea (2 h)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#667085] block">Hacia:</span>
                    <span className="font-bold text-[#027a48]">Jueves 29 oct ✓</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4f46e5] py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#4338ca] transition-colors"
                >
                  <Sparkles className="size-3.5" />
                  <span>Rebalancear 1 tarea y guardar {hours} h/día</span>
                </button>
              </div>
            ) : (
              /* CASO B: Múltiples fechas con 12+ tareas (LISTADO COMPACTO CON SCROLL CONTROLADO) */
              <div className="mt-3">
                {/* Contenedor con altura fija y scroll interno con overscroll-contain */}
                <div className="max-h-[170px] space-y-2 overflow-y-auto pr-1">
                  {manyConflictDates.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-[#fedf89]/70 bg-white px-3 py-2 text-xs shadow-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-bold text-[#17212b] block truncate">
                          {item.date}
                        </span>
                        <span className="text-[11px] text-[#667085]">
                          {item.planned} ({item.tasksCount} tareas) → {item.solution}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-md bg-[#feeeec] px-2 py-0.5 text-[11px] font-bold text-[#b42318]">
                        {item.excess}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Acción Maestra Global en 1 Clic para N tareas */}
                <button
                  type="button"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#4f46e5] py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#4338ca] transition-colors"
                >
                  <Sparkles className="size-3.5" />
                  <span>Rebalancear las 4 fechas en 1 clic y guardar</span>
                </button>
              </div>
            )}

            <button
              type="button"
              className="mt-2.5 w-full text-center text-[11px] font-medium text-[#667085] hover:text-[#17212b]"
            >
              O gestionar manualmente en el planificador
            </button>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#f2f4f7] pt-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-xl border-[#dde2ea] px-4 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

// -------------------------------------------------------------
// Componente Modal de Confirmación Masiva Reutilizable
// -------------------------------------------------------------
function BatchConfirmModalContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-[500px] rounded-3xl border border-[#dde2ea] bg-white p-6 shadow-2xl sm:p-7 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-xl border border-[#dde2ea] text-[#667085] hover:bg-[#f9fafb]"
        >
          <X className="size-4" />
        </button>

        <div className="text-left">
          <h2 className="text-xl font-bold tracking-tight text-[#17212b]">
            Mover 3 tareas al Jueves, 29 de oct
          </h2>
          <p className="mt-1 text-xs text-[#667085]">
            Revisa el cambio antes de aplicar la nueva fecha a las tareas seleccionadas.
          </p>
        </div>

        {/* 1. NARRATIVA VISUAL: ¿QUÉ VA A PASAR? (Antes -> Después claro en 2 columnas) */}
        <div className="mt-5 rounded-2xl border border-[#dde2ea] bg-[#f8f9fc] p-4">
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
            {/* Origen */}
            <div className="rounded-xl border border-[#dde2ea] bg-white p-3 text-center">
              <span className="text-[11px] font-semibold text-[#667085] block">Fecha actual</span>
              <span className="mt-0.5 text-xs font-bold text-[#17212b] block">Mié, 28 oct</span>
              <span className="mt-1 inline-block rounded-md bg-[#feeeec] px-2 py-0.5 text-[10px] font-bold text-[#b42318]">
                Sobrecargado
              </span>
            </div>

            {/* Flecha conectora */}
            <div className="flex flex-col items-center justify-center text-[#4f46e5]">
              <ArrowRight className="size-5 stroke-[2.5]" />
            </div>

            {/* Destino */}
            <div className="rounded-xl border border-[#c7d2fe] bg-[#eef2ff] p-3 text-center">
              <span className="text-[11px] font-semibold text-[#4338ca] block">Nueva fecha</span>
              <span className="mt-0.5 text-xs font-bold text-[#312e81] block">Jue, 29 oct</span>
              <span className="mt-1 inline-block rounded-md bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
                Capacidad OK ✓
              </span>
            </div>
          </div>

          {/* Consecuencia directa en 1 frase */}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-2.5 text-xs text-[#344054] border border-[#eaecf0]">
            <Sparkles className="size-4 shrink-0 text-[#027a48]" />
            <span>
              El 28 de oct queda libre (0 h) y el 29 de oct queda en <strong>3.5 h</strong> (dentro de tu límite de 4 h).
            </span>
          </div>
        </div>

        {/* 2. CHIPS RESUMIDOS DE TAREAS (Sin tablas pesadas) */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-[#667085] block mb-2">
            Tareas que se moverán (6 h en total):
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#dde2ea] bg-[#f8f9fc] px-2.5 py-1 text-xs text-[#344054]">
              • Catering <strong className="text-[#667085]">(2 h)</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#dde2ea] bg-[#f8f9fc] px-2.5 py-1 text-xs text-[#344054]">
              • Invitados VIP <strong className="text-[#667085]">(1.5 h)</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#dde2ea] bg-[#f8f9fc] px-2.5 py-1 text-xs text-[#344054]">
              • Sonido e iluminación <strong className="text-[#667085]">(2.5 h)</strong>
            </span>
          </div>
        </div>

        {/* 3. MENSAJE DE TRANQUILIDAD (Elimina miedo al error) */}
        <div className="mt-4 flex items-center gap-2 text-[11px] text-[#667085]">
          <ShieldCheck className="size-4 text-[#027a48] shrink-0" />
          <span>Las notas y el avance de las tareas se mantendrán intactos.</span>
        </div>

        {/* 4. BOTÓN DE ACCIÓN EXPLÍCITO */}
        <div className="mt-5 flex items-center justify-end gap-3 border-t border-[#f2f4f7] pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl border-[#dde2ea] px-4 text-xs font-medium text-[#344054] hover:bg-[#f9fafb]"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-[#4f46e5] px-5 text-xs font-semibold text-white hover:bg-[#4338ca]"
          >
            Confirmar y mover al 29 de oct
          </Button>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// MOCKUP 2: Modo de Selección en Detalle de Evento
// -------------------------------------------------------------
function MockupBatchSelection() {
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3])
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false)

  function toggle(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  function handleToggleMode() {
    setIsSelectionMode((prev) => {
      const next = !prev
      if (!next) setSelectedIds([])
      else setSelectedIds([1, 2, 3])
      return next
    })
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Hoy', to: '/hoy' },
        { label: 'Eventos', to: '/eventos' },
        { label: 'Boda Laura & Daniel' },
      ]}
    >
      {/* EXPLICADOR INTERACTIVO DE CONVIVENCIA DE ACCIONES */}
      <div className="mb-6 rounded-2xl border border-[#dde2ea] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#eef2ff] px-2 py-0.5 text-xs font-bold text-[#4338ca]">
                <Sparkles className="size-3.5" />
                Interacción Libre de Sobresaturación
              </span>
              <h3 className="text-sm font-bold text-[#17212b]">
                Convivencia entre Acciones Individuales y Acciones en Lote
              </h3>
            </div>
            <p className="text-xs text-[#667085] max-w-2xl">
              Para evitar 20 botones compitiendo en pantalla, el sistema utiliza dos estados claramente diferenciados:
            </p>
          </div>

          {/* Selector de Estado en vivo para alternar inmediatamente */}
          <div className="flex items-center rounded-xl bg-[#f2f4f7] p-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(false)
                setSelectedIds([])
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                !isSelectionMode
                  ? 'bg-white text-[#17212b] shadow-xs'
                  : 'text-[#667085] hover:text-[#17212b]'
              }`}
            >
              <span>1. Modo Normal (Tus acciones actuales)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(true)
                setSelectedIds([1, 2, 3])
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isSelectionMode
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#17212b]'
              }`}
            >
              <span>2. Modo Selección en Lote</span>
            </button>
          </div>
        </div>

        {/* Indicador contextual de qué ocurre en el estado actual */}
        <div className="mt-3.5 pt-3 border-t border-[#f2f4f7] flex items-center gap-2 text-xs">
          <Info className="size-4 shrink-0 text-[#4f46e5]" />
          {!isSelectionMode ? (
            <span className="text-[#344054]">
              <strong>Modo Normal activo:</strong> Las tarjetas muestran intactos sus botones habituales (<strong>Registrar avance</strong> y <strong>Acciones ▾</strong>). En cabecera tienes <strong>Ver progreso detallado</strong>. Cero checkboxes por doquier y cero botones masivos estorbando.
            </span>
          ) : (
            <span className="text-[#344054]">
              <strong>Modo Selección activo:</strong> Las acciones individuales de las tarjetas se repliegan temporalmente para evitar saturación y clics erróneos. Cada tarjeta es un selector amplio. La barra flotante inferior aloja <strong>Mover a otra fecha</strong>, <strong>Posponer</strong> y <strong>Cancelar</strong>.
            </span>
          )}
        </div>
      </div>

      <EventDetailViewReal
        selectedIds={selectedIds}
        onToggle={toggle}
        onSelectAll={() => setSelectedIds([1, 2, 3, 4, 5])}
        onOpenBatchDialog={() => setIsBatchModalOpen(true)}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={handleToggleMode}
      />

      {/* Modal abierto condicionalmente al hacer clic en "Mover a otra fecha" */}
      {isBatchModalOpen && (
        <BatchConfirmModalContent onClose={() => setIsBatchModalOpen(false)} />
      )}
    </AppShell>
  )
}

// -------------------------------------------------------------
// MOCKUP 3: Tu RescheduleTaskDialog Actual Preservado al 100%
// -------------------------------------------------------------
function MockupProactiveSchedule() {
  const [open, setOpen] = useState(true)

  const conflictPlan = {
    date: '2026-10-28',
    event_date: '2026-11-14',
    existing_hours: '4',
    added_hours: '2.5',
    planned_hours: '6.5',
    daily_limit_hours: '4',
    overload_hours: '2.5',
    has_conflict: true,
    tasks: [
      { id: 1, name: 'Hoy: Contratación de catering para cena', event_name: 'Boda Laura & Daniel', estimated_hours: '2' },
      { id: 2, name: 'Hoy: Confirmar lista de invitados VIP', event_name: 'Boda Laura & Daniel', estimated_hours: '2' },
    ],
    suggestion: { date: '2026-10-29', planned_hours: '2.5' },
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Hoy', to: '/hoy' },
        { label: 'Eventos', to: '/eventos' },
        { label: 'Boda Laura & Daniel' },
      ]}
    >
      <EventDetailViewReal
        selectedIds={[]}
        onToggle={() => undefined}
        onSelectAll={() => undefined}
        isSelectionMode={false}
        onToggleSelectionMode={() => undefined}
      />

      {open && (
        <RescheduleTaskDialog
          task={{
            id: 3,
            eventId: 10,
            name: 'Coordinar equipo de sonido e iluminación',
            targetDate: '2026-10-28',
            estimatedHours: 2.5,
          }}
          eventDate="2026-11-14T18:00:00-05:00"
          initialConflict={conflictPlan}
          onClose={() => setOpen(false)}
          onSaved={() => undefined}
        />
      )}
    </AppShell>
  )
}

// -------------------------------------------------------------
// MOCKUP 4: Modal de Confirmación Masiva (Baja Carga Cognitiva - Flujo Antes -> Después)
// -------------------------------------------------------------
function MockupBatchConfirm() {
  const selectedIds = [1, 2, 3]

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Hoy', to: '/hoy' },
        { label: 'Eventos', to: '/eventos' },
        { label: 'Boda Laura & Daniel' },
      ]}
    >
      <EventDetailViewReal
        selectedIds={selectedIds}
        onToggle={() => undefined}
        onSelectAll={() => undefined}
        isSelectionMode={true}
        onToggleSelectionMode={() => (window.location.search = '?view=batch')}
      />

      <BatchConfirmModalContent
        onClose={() => (window.location.search = '?view=batch')}
      />
    </AppShell>
  )
}

// -------------------------------------------------------------
// Barra de Navegación Superior entre Mockups
// -------------------------------------------------------------
function MockupNavigationBar({ currentView }: { currentView: string }) {
  const views = [
    { id: 'batch', label: '1. Detalle: Normal vs Selección Lote' },
    { id: 'batch-confirm', label: '2. Modal: Confirmación Mover Lote' },
    { id: 'capacity', label: '3. Modal: Capacidad Multifecha' },
    { id: 'proactive', label: '4. Modal: Reprogramar Tarea Individual' },
  ]

  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between border-b border-[#dde2ea] bg-white/95 px-5 py-2.5 backdrop-blur-md shadow-xs">
      <div className="flex items-center gap-2.5">
        <span className="rounded-md bg-[#4f46e5] px-2.5 py-0.5 text-[11px] font-bold text-white tracking-wide">
          EVENTGER UX
        </span>
        <span className="text-xs font-semibold text-[#17212b]">
          Mockups Interactivos de Solución
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {views.map((v) => (
          <a
            key={v.id}
            href={`?view=${v.id}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentView === v.id
                ? 'bg-[#eef2ff] text-[#4338ca] shadow-xs ring-1 ring-[#4f46e5]/25'
                : 'text-[#475467] hover:bg-[#f2f4f7] hover:text-[#17212b]'
            }`}
          >
            {v.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

const rawView = new URLSearchParams(window.location.search).get('view')
const activeView = rawView || 'batch'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <MockupNavigationBar currentView={activeView} />
      <div className="flex-1">
        {(() => {
          switch (activeView) {
            case 'capacity':
              return <MockupCapacityDialog />
            case 'batch':
              return <MockupBatchSelection />
            case 'proactive':
              return <MockupProactiveSchedule />
            case 'batch-confirm':
              return <MockupBatchConfirm />
            default:
              return <MockupBatchSelection />
          }
        })()}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
