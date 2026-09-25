import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TodayEmptyState } from '@/features/today/components/TodayEmptyState'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayTaskCard } from '@/features/today/components/TodayTaskCard'
import { TodayTaskSection } from '@/features/today/components/TodayTaskSection'
import { buildTodayTask } from './today.fixtures'

describe('TodaySummary', () => {
  it('muestra horas y capacidad sin un límite diario configurado', () => {
    render(
      <TodaySummary
        overdueCount={1}
        todayCount={2}
        upcomingCount={3}
        plannedHours={3}
      />,
    )

    expect(screen.getAllByText('3 h planificadas').length).toBeGreaterThan(0)
    expect(
      screen.getByText('Capacidad diaria pendiente de configuración'),
    ).toBeTruthy()
    expect(screen.getByText('horas planificadas hoy')).toBeTruthy()
  })

  it('calcula la capacidad disponible y conserva decimales significativos', () => {
    render(
      <TodaySummary
        overdueCount={0}
        todayCount={1}
        upcomingCount={0}
        plannedHours={2.2}
        dailyLimitHours={6.5}
      />,
    )

    expect(screen.getByText('2.2 h / 6.5 h')).toBeTruthy()
    expect(screen.getByText('2.2 h de 6.5 h planificadas')).toBeTruthy()
    expect(screen.getAllByText('4.3 h disponibles')).toHaveLength(2)
  })

  it('nunca muestra capacidad disponible negativa', () => {
    render(
      <TodaySummary
        overdueCount={0}
        todayCount={1}
        upcomingCount={0}
        plannedHours={3}
        dailyLimitHours={2}
      />,
    )

    expect(screen.getAllByText('0 h disponibles')).toHaveLength(2)
  })
})

describe('TodayTaskCard', () => {
  it.each([
    ['overdue', 'Vencida'],
    ['today', 'Hoy'],
    ['upcoming', 'Próxima'],
  ] as const)('muestra el grupo %s y abre la tarea', async (group, label) => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const task = buildTodayTask({ estimatedHours: 1.2 })

    render(
      <TodayTaskCard
        task={task}
        group={group}
        actionLabel="Abrir detalle"
        onOpen={onOpen}
      />,
    )

    expect(screen.getByText(label)).toBeTruthy()
    expect(screen.getByText('Abrir detalle')).toBeTruthy()
    expect(screen.getByText(/1.2 h/)).toBeTruthy()

    await user.click(screen.getByRole('button'))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('usa la etiqueta predeterminada y formatea horas enteras', () => {
    render(
      <TodayTaskCard
        task={buildTodayTask({ estimatedHours: 2 })}
        group="today"
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByText('Ver tarea')).toBeTruthy()
    expect(screen.getByText(/2 h/)).toBeTruthy()
  })
})

describe('TodayTaskSection', () => {
  it('no renderiza una sección vacía', () => {
    const { container } = render(
      <TodayTaskSection
        title="Sin tareas"
        description="No debe mostrarse"
        tasks={[]}
        group="today"
        onOpenTask={vi.fn()}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('entrega la tarea seleccionada al callback', async () => {
    const user = userEvent.setup()
    const onOpenTask = vi.fn()
    const task = buildTodayTask()

    render(
      <TodayTaskSection
        title="Para hoy"
        description="Prioridad"
        tasks={[task]}
        group="today"
        onOpenTask={onOpenTask}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onOpenTask).toHaveBeenCalledWith(task)
  })
})

describe('TodayEmptyState', () => {
  it('ejecuta sus dos acciones', async () => {
    const user = userEvent.setup()
    const onSeeUpcoming = vi.fn()
    const onCreateEvent = vi.fn()

    render(
      <TodayEmptyState
        onSeeUpcoming={onSeeUpcoming}
        onCreateEvent={onCreateEvent}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Ver próximos días' }))
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(onSeeUpcoming).toHaveBeenCalledOnce()
    expect(onCreateEvent).toHaveBeenCalledOnce()
  })
})
