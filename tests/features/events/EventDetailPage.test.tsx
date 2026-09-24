import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useEventDetail } from '@/features/events/hooks/useEventDetail'
import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { createSubtask } from '@/features/events/services/subtasks.service'
import {
  createSubtaskInputFixture,
  eventFixture,
  subtaskFixture,
} from './subtask.fixtures'

vi.mock('@/components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}))

vi.mock('@/features/events/hooks/useEventDetail', () => ({
  useEventDetail: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventSubtasks', () => ({
  useEventSubtasks: vi.fn(),
}))

vi.mock('@/features/events/services/subtasks.service', () => ({
  createSubtask: vi.fn(),
}))

const retryEvent = vi.fn().mockResolvedValue(undefined)
const refreshSubtasks = vi.fn().mockResolvedValue(undefined)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/evento/${eventFixture.id}`]}>
      <Routes>
        <Route path="/evento/:id" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function openAndSubmitForm() {
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

  const dialog = await screen.findByRole('dialog')
  await user.type(
    within(dialog).getByLabelText('Nombre de la tarea *'),
    createSubtaskInputFixture.name,
  )
  await user.type(
    within(dialog).getByLabelText('Fecha límite *'),
    createSubtaskInputFixture.targetDate,
  )
  await user.type(
    within(dialog).getByLabelText('Tiempo estimado *'),
    String(createSubtaskInputFixture.estimatedHours),
  )
  await user.type(
    within(dialog).getByLabelText('Nota (opcional)'),
    createSubtaskInputFixture.details,
  )
  await user.click(
    within(dialog).getByRole('button', { name: 'Agregar tarea' }),
  )

  return user
}

describe('EventDetailPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'))

    vi.mocked(createSubtask).mockReset()
    vi.mocked(useEventDetail).mockReset()
    vi.mocked(useEventSubtasks).mockReset()
    retryEvent.mockClear()
    refreshSubtasks.mockClear()

    vi.mocked(useEventDetail).mockReturnValue({
      event: eventFixture,
      isLoading: false,
      error: null,
      retry: retryEvent,
    })
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: null,
      refresh: refreshSubtasks,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el estado de carga', () => {
    vi.mocked(useEventDetail).mockReturnValue({
      event: null,
      isLoading: true,
      error: null,
      retry: retryEvent,
    })

    renderPage()

    expect(screen.getByLabelText('Cargando evento')).toBeTruthy()
  })

  it('muestra el estado de error', () => {
    vi.mocked(useEventDetail).mockReturnValue({
      event: null,
      isLoading: false,
      error: 'No se pudo cargar el evento',
      retry: retryEvent,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'No pudimos cargar el evento' }),
    ).toBeTruthy()
  })

  it('muestra el estado de evento inexistente', () => {
    vi.mocked(useEventDetail).mockReturnValue({
      event: null,
      isLoading: false,
      error: null,
      retry: retryEvent,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Evento no encontrado' }),
    ).toBeTruthy()
  })

  it('muestra el detalle y el estado vacío de subtareas', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: eventFixture.name }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: 'Aún no tienes tareas para este evento',
      }),
    ).toBeTruthy()
  })

  it('abre el formulario al agregar una tarea', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(
      await screen.findByRole('heading', { name: 'Agregar tarea' }),
    ).toBeTruthy()
  })

  it('crea una subtarea, refresca y permite volver al evento', async () => {
    vi.mocked(createSubtask).mockResolvedValue(subtaskFixture)
    renderPage()

    const user = await openAndSubmitForm()

    expect(
      await screen.findByRole('heading', { name: 'Tarea agregada' }),
    ).toBeTruthy()
    expect(createSubtask).toHaveBeenCalledWith(
      eventFixture.id,
      createSubtaskInputFixture,
    )
    expect(refreshSubtasks).toHaveBeenCalledOnce()

    await user.click(
      screen.getByRole('button', { name: 'Volver al evento' }),
    )

    expect(
      screen.getByRole('heading', { name: eventFixture.name }),
    ).toBeTruthy()
    expect(refreshSubtasks).toHaveBeenCalledTimes(2)
  })

  it('permite abrir un formulario limpio para agregar otra tarea', async () => {
    vi.mocked(createSubtask).mockResolvedValue(subtaskFixture)
    renderPage()

    const user = await openAndSubmitForm()
    await screen.findByRole('heading', { name: 'Tarea agregada' })

    await user.click(
      screen.getByRole('button', { name: 'Agregar otra tarea' }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('heading', { name: 'Agregar tarea' }),
    ).toBeTruthy()
    expect(
      (within(dialog).getByLabelText('Nombre de la tarea *') as HTMLInputElement)
        .value,
    ).toBe('')
  })

  it('muestra el error y reintenta con los mismos datos', async () => {
    vi.mocked(createSubtask).mockRejectedValue(
      new Error('No se pudo crear la subtarea'),
    )
    renderPage()

    const user = await openAndSubmitForm()

    expect(
      await screen.findByRole('heading', { name: 'Tarea no agregada' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('heading', {
        name: `No pudimos agregar ${createSubtaskInputFixture.name}`,
      }),
    ).toBeTruthy()

    await user.click(
      screen.getByRole('button', { name: 'Intentar de nuevo' }),
    )

    expect(createSubtask).toHaveBeenCalledTimes(2)
    expect(createSubtask).toHaveBeenNthCalledWith(
      1,
      eventFixture.id,
      createSubtaskInputFixture,
    )
    expect(createSubtask).toHaveBeenNthCalledWith(
      2,
      eventFixture.id,
      createSubtaskInputFixture,
    )
  })
})
