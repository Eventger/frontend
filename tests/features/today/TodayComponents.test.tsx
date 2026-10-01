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

  it('muestra el resumen definido en Figma cuando los filtros no coinciden', () => {
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
      screen.getAllByText(
        'Sin coincidencias',
      ),
    ).toHaveLength(3)
    expect(
      screen.getAllByText(
        '0 h con estos filtros',
      ),
    ).toHaveLength(2)
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
    expect(screen.getByText('Ver tarea')).toBeTruthy()
    expect(screen.getByText(/1.2 h/)).toBeTruthy()

    const taskButtons =
      screen.getAllByRole('button', {
        name: `Ver tarea: ${task.name}`,
      })

    await user.click(taskButtons[0])
    await user.click(taskButtons[1])

    expect(onOpen).toHaveBeenCalledTimes(2)
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
})
