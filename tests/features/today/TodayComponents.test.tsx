import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TodayEmptyState } from '@/features/today/components/TodayEmptyState'
import { TodayPriorityGuide } from '@/features/today/components/TodayPriorityGuide'
import { TodaySummary } from '@/features/today/components/TodaySummary'
import { TodayTaskCard } from '@/features/today/components/TodayTaskCard'
import { TodayTaskSection } from '@/features/today/components/TodayTaskSection'
import { buildTodayTask } from './today.fixtures'

describe('TodaySummary', () => {
  it('muestra tus horas disponibles y estado pendiente si no está configurado', () => {
    render(
      <TodaySummary
        overdueCount={1}
        todayCount={2}
        upcomingCount={3}
        plannedHours={3}
      />,
    )

    expect(screen.getAllByText('3 h planificadas').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tus horas disponibles').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Para organizar las tareas de tus eventos').length).toBeGreaterThan(0)
  })

  it('muestra las horas configuradas y ejecuta onEditDailyLimit al pulsar Cambiar horas', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(
      <TodaySummary
        overdueCount={0}
        todayCount={1}
        upcomingCount={0}
        plannedHours={2.2}
        dailyLimitHours={6.5}
        onEditDailyLimit={onEdit}
      />,
    )

    expect(screen.getAllByText('6.5 h/día')).toHaveLength(2)
    const changeButtons = screen.getAllByRole('button', { name: 'Cambiar horas' })
    expect(changeButtons.length).toBeGreaterThan(0)
    await user.click(changeButtons[0])
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('muestra el icono de ayuda accesible con la explicación secundaria', async () => {
    const user = userEvent.setup()

    render(
      <TodaySummary
        overdueCount={0}
        todayCount={1}
        upcomingCount={0}
        plannedHours={2}
        dailyLimitHours={6}
      />,
    )

    const helpButtons = screen.getAllByRole('button', { name: 'Más información sobre horas disponibles' })
    expect(helpButtons.length).toBeGreaterThan(0)
    await user.click(helpButtons[0])
    expect(
      await screen.findByText('Estas horas nos ayudan a identificar cuándo tienes más trabajo programado del que puedes realizar.'),
    ).toBeTruthy()
  })

  it('muestra el resumen cuando los filtros no coinciden', () => {
    render(
      <TodaySummary
        overdueCount={0}
        todayCount={0}
        upcomingCount={0}
        plannedHours={0}
        dailyLimitHours={6}
        isFiltered
      />,
    )

    expect(
      screen.getAllByText('Sin coincidencias'),
    ).toHaveLength(3)
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
        onOpenTask={onOpen}
      />,
    )

    expect(screen.getByText(label)).toBeTruthy()
    expect(screen.getByRole('button', { name: /Ver tarea: Confirmar proveedores/i })).toBeTruthy()
    expect(screen.getByText(/1.2 h/)).toBeTruthy()

    const taskButton =
      screen.getByRole('button', {
        name: `Ver tarea: ${task.name}`,
      })

    await user.click(taskButton)

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith(task)
  })

  it('usa la etiqueta predeterminada y formatea horas enteras', () => {
    render(
      <TodayTaskCard
        task={buildTodayTask({ estimatedHours: 2 })}
        group="today"
        onOpenTask={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /Ver tarea: Confirmar proveedores/i })).toBeTruthy()
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

    await user.click(
      screen.getAllByRole('button', {
        name: `Ver tarea: ${task.name}`,
      })[0],
    )
    expect(onOpenTask).toHaveBeenCalledWith(task)
  })
})

describe('TodayPriorityGuide', () => {
  it('muestra y oculta la regla de prioridad de forma accesible', async () => {
    const user = userEvent.setup()

    render(<TodayPriorityGuide />)

    const trigger = screen.getByRole(
      'button',
      {
        name: '¿Cómo funciona?',
      },
    )

    expect(
      trigger.getAttribute(
        'aria-expanded',
      ),
    ).toBe('false')

    await user.click(trigger)

    expect(
      screen.getByRole('dialog', {
        name: 'Regla de prioridad',
      }),
    ).toBeTruthy()
    expect(
      trigger.getAttribute(
        'aria-expanded',
      ),
    ).toBe('true')

    await user.click(trigger)

    expect(
      screen.queryByRole('dialog'),
    ).toBeNull()

    // También puede cerrarse con el botón de cerrar dedicado
    await user.click(trigger)
    expect(
      screen.getByRole('dialog', {
        name: 'Regla de prioridad',
      }),
    ).toBeTruthy()
    await user.click(
      screen.getByRole('button', {
        name: 'Cerrar regla de prioridad',
      }),
    )
    expect(
      screen.queryByRole('dialog'),
    ).toBeNull()
  })
})

describe('TodayEmptyState', () => {
  it('ejecuta las acciones del estado vacío', async () => {
    const user = userEvent.setup()
    const onCreateEvent = vi.fn()
    const onViewUpcoming = vi.fn()

    render(
      <TodayEmptyState
        onViewUpcoming={onViewUpcoming}
        onCreateEvent={onCreateEvent}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Ver próximos días',
      }),
    )
    await user.click(
      screen.getByRole('button', {
        name: '+ Crear evento',
      }),
    )

    expect(onViewUpcoming).toHaveBeenCalledOnce()
    expect(onCreateEvent).toHaveBeenCalledOnce()
  })

  it('muestra mensaje de bienvenida de onboarding para usuarios nuevos', () => {
    render(
      <TodayEmptyState
        onViewUpcoming={vi.fn()}
        onCreateEvent={vi.fn()}
        isFirstTime={true}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'No tienes gestiones pendientes para hoy',
      }),
    ).toBeTruthy()
    expect(
      screen.getByText(/Te damos la bienvenida a Eventger/),
    ).toBeTruthy()
    expect(
      screen.queryByText(/Buen trabajo/),
    ).toBeNull()
  })
})
