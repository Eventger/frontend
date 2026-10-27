import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EventDetailContent } from '@/features/events/components/detail/EventDetailContent'
import { eventFixture, subtaskFixture } from './subtask.fixtures'

describe('EventDetailContent', () => {
  it('presenta el nombre y el teléfono del contacto sin la descripción del tipo de evento', () => {
    render(
      <EventDetailContent
        event={{ ...eventFixture, contact: 'María Fernanda López 300 123 4567' }}
        subtasks={[]}
        eventTypeName="Cumpleaños"
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    expect(screen.getByText('Contacto del cliente')).toBeTruthy()
    expect(screen.getByText('María Fernanda López')).toBeTruthy()
    expect(screen.getByText('300 123 4567')).toBeTruthy()
    expect(screen.queryByText('Descripción')).toBeNull()
  })

  it('conserva como nombre un contacto antiguo que no incluye teléfono', () => {
    render(
      <EventDetailContent
        event={{ ...eventFixture, contact: 'Contacto ficticio para QA local' }}
        subtasks={[]}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    expect(screen.getByText('Contacto ficticio para QA local')).toBeTruthy()
    expect(screen.getByText('Teléfono no registrado')).toBeTruthy()
  })

  it('separa un teléfono internacional y conserva contactos sin teléfono válido', () => {
    const props = {
      subtasks: [],
      onAddTask: vi.fn(),
      onEditEvent: vi.fn(),
    }
    const { rerender } = render(
      <EventDetailContent
        {...props}
        event={{ ...eventFixture, contact: 'Ana Pérez +57 (300) 123-4567' }}
      />,
    )

    expect(screen.getByText('Ana Pérez')).toBeTruthy()
    expect(screen.getByText('+57 (300) 123-4567')).toBeTruthy()

    rerender(
      <EventDetailContent
        {...props}
        event={{ ...eventFixture, contact: 'Ana Pérez 12345' }}
      />,
    )
    expect(screen.getByText('Ana Pérez 12345')).toBeTruthy()
    expect(screen.getByText('Teléfono no registrado')).toBeTruthy()
  })

  it('muestra el estado vacío y permite agregar una tarea', async () => {
    const user = userEvent.setup()
    const onAddTask = vi.fn()
    const onEditEvent = vi.fn()

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={[]}
        onAddTask={onAddTask}
        onEditEvent={onEditEvent}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Aún no tienes tareas para este evento',
      }),
    ).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Gestionar tareas del evento' }))
    expect(onEditEvent).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))
    expect(onAddTask).toHaveBeenCalledOnce()
  })

  it('renderiza una tarjeta por subtarea y el progreso real', () => {
    const onAddTask = vi.fn()
    const onEditEvent = vi.fn()
    const subtasks = [
      {
        ...subtaskFixture,
        id: 31,
        name: 'Coordinar transporte',
        state: 'completed' as const,
      },
      {
        ...subtaskFixture,
        id: 32,
        name: 'Confirmar invitados',
        state: 'pending' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={onAddTask}
        onEditEvent={onEditEvent}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Coordinar transporte' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Confirmar invitados' }),
    ).toBeTruthy()
    expect(screen.getByText('50%')).toBeTruthy()
    expect(screen.getByText('1 de 2 tareas completadas.')).toBeTruthy()

    const taskList = screen.getByRole('region', {
      name: 'Lista de tareas del evento',
    })

    expect(taskList.classList.contains('event-task-list')).toBe(true)
    expect(taskList.getAttribute('tabindex')).toBeNull()

    expect(
      within(taskList).queryByRole('button', {
        name: 'Editar',
      }),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Agregar tarea' })).toBeNull()
    expect(
      within(taskList).queryByRole('button', {
        name: 'Eliminar',
      }),
    ).toBeNull()
  })

  it('renderiza las tareas en orden cronológico ascendente y completadas al final (CA-01, CA-03)', () => {
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        name: 'Instalar decoración',
        targetDate: '2026-10-30',
        state: 'pending' as const,
      },
      {
        ...subtaskFixture,
        id: 2,
        name: 'Comprar materiales',
        targetDate: '2026-10-25',
        state: 'pending' as const,
      },
      {
        ...subtaskFixture,
        id: 3,
        name: 'Preparar centros de mesa',
        targetDate: '2026-10-27',
        state: 'pending' as const,
      },
      {
        ...subtaskFixture,
        id: 4,
        name: 'Tarea ya completada',
        targetDate: '2026-10-20',
        state: 'completed' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    const headings = screen.getAllByRole('heading', { level: 3 })
    const headingTexts = headings.map(h => h.textContent)

    expect(headingTexts).toEqual([
      'Comprar materiales',
      'Preparar centros de mesa',
      'Instalar decoración',
      'Tarea ya completada',
    ])
  })

  it('muestra acciones visibles directamente en la tarjeta de tarea pendiente (CA-01)', () => {
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        name: 'Contratar fotógrafo',
        state: 'pending' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Registrar avance de Contratar fotógrafo' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Más acciones para Contratar fotógrafo' })).toBeTruthy()
  })

  it('permite volver a registrar avance en tareas completadas sin reprogramarlas', async () => {
    const user = userEvent.setup()
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        name: 'Música seleccionada',
        state: 'completed' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Registrar avance de Música seleccionada' })).toBeTruthy()
    const actionsBtn = screen.getByRole('button', { name: 'Más acciones para Música seleccionada' })
    expect(actionsBtn).toBeTruthy()

    await user.click(actionsBtn)
    expect(screen.getByRole('menuitem', { name: 'Ver detalle de Música seleccionada' })).toBeTruthy()
    expect(screen.queryByRole('menuitem', { name: 'Editar tarea Música seleccionada' })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Registrar avance de Música seleccionada' })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: 'Reprogramar Música seleccionada' })).toBeNull()
  })

  it('abre el diálogo de Registrar avance directamente al hacer clic en su acción (CA-02)', async () => {
    const user = userEvent.setup()
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        name: 'Degustar menú',
        state: 'pending' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Registrar avance de Degustar menú' }))
    expect(screen.getByRole('heading', { name: 'Registrar avance' })).toBeTruthy()
  })

  it('abre el diálogo de Reprogramar desde el menú de acciones (CA-03)', async () => {
    const user = userEvent.setup()
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        name: 'Comprar anillos',
        state: 'pending' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Más acciones para Comprar anillos' }))
    await user.click(screen.getByRole('menuitem', { name: 'Reprogramar Comprar anillos' }))
    expect(screen.getByRole('heading', { name: 'Reprogramar tarea' })).toBeTruthy()
  })

  it('no incluye las acciones de Editar tarea ni Eliminar tarea en el menú de acciones del detalle del evento', async () => {
    const user = userEvent.setup()
    const onSubtaskUpdated = vi.fn()
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        name: 'Elegir flores',
        targetDate: '2026-10-20',
        estimatedHours: 2,
        details: 'Orquídeas y rosas',
        state: 'pending' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
        onSubtaskUpdated={onSubtaskUpdated}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Más acciones para Elegir flores' }))
    expect(screen.queryByRole('menuitem', { name: /Editar tarea/i })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: /Eliminar tarea/i })).toBeNull()
    expect(screen.getByRole('menuitem', { name: 'Reprogramar Elegir flores' })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: 'Ver detalle de Elegir flores' })).toBeTruthy()
  })

  it('permite ver los detalles de la tarea al hacer clic en su título interactivo (CA-01, CA-08)', async () => {
    const user = userEvent.setup()
    const subtasks = [
      {
        ...subtaskFixture,
        id: 1,
        name: 'Prueba de sonido',
        details: 'Verificar micrófono y altavoces en salón principal',
        state: 'pending' as const,
      },
    ]

    render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    expect(screen.queryByText('Detalles de la tarea')).toBeNull()
    const titleButton = screen.getByRole('button', { name: 'Prueba de sonido' })
    await user.click(titleButton)

    expect(screen.getByText('Detalles de la tarea')).toBeTruthy()
    expect(screen.getByText('Verificar micrófono y altavoces en salón principal')).toBeTruthy()

    await user.click(titleButton)
    expect(screen.queryByText('Detalles de la tarea')).toBeNull()
  })

  it('cambia el señalizador a otra tarea cuando el usuario se posiciona sobre ella (hover o focus)', async () => {
    const subtasks = [
      {
        ...subtaskFixture,
        id: 104,
        name: 'Base decimal: salón',
        state: 'in_progress' as const,
      },
      {
        ...subtaskFixture,
        id: 105,
        name: 'Carga del día recomendado',
        state: 'postponed' as const,
      },
    ]

    const { container } = render(
      <EventDetailContent
        event={eventFixture}
        subtasks={subtasks}
        highlightedSubtaskId={104}
        onAddTask={vi.fn()}
        onEditEvent={vi.fn()}
      />,
    )

    const card1 = container.querySelector('#task-104')
    const card2 = container.querySelector('#task-105')
    const taskList = screen.getByRole('region', { name: 'Lista de tareas del evento' })

    expect(card1).toBeTruthy()
    expect(card2).toBeTruthy()

    // Inicialmente card 1 tiene el señalizador de tarea destacada
    expect(card1?.classList.contains('border-[#4f46e5]')).toBe(true)
    expect(card2?.classList.contains('border-[#4f46e5]')).toBe(false)

    // El usuario se posiciona en card 2
    fireEvent.pointerEnter(card2!)
    expect(card1?.classList.contains('border-[#4f46e5]')).toBe(false)
    expect(card2?.classList.contains('border-[#4f46e5]')).toBe(true)

    // El usuario se posiciona de nuevo en card 1
    fireEvent.pointerEnter(card1!)
    expect(card1?.classList.contains('border-[#4f46e5]')).toBe(true)
    expect(card2?.classList.contains('border-[#4f46e5]')).toBe(false)

    // Al salir de la lista, conserva el foco o retorna a la tarea destacada inicial
    fireEvent.pointerEnter(card2!)
    fireEvent.mouseLeave(taskList)
    expect(card1?.classList.contains('border-[#4f46e5]')).toBe(true)
    expect(card2?.classList.contains('border-[#4f46e5]')).toBe(false)
  })
})
