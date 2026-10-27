import { render, screen, within, waitFor } from '@testing-library/react'
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useToday } from '@/features/today/hooks/useToday'
import { TodayPage } from '@/features/today/pages/TodayPage'
import type { TodayData } from '@/features/today/types/today.types'
import { todayDataFixture } from './today.fixtures'

vi.mock('@/features/today/hooks/useToday', () => ({
  useToday: vi.fn(),
}))

vi.mock('@/features/settings/hooks/usePlanningPreferences', () => ({
  usePlanningPreferences: vi.fn(),
}))

vi.mock('@/features/auth/hooks/useAuthenticatedApi', () => ({
  useAuthenticatedApi: () => ({
    authenticatedRequest: vi.fn(),
  }),
}))

vi.mock('@/features/events/services/event.service', () => ({
  getEventById: vi.fn().mockResolvedValue({ id: 1, eventDate: '2026-10-25' }),
}))

const retry = vi.fn().mockResolvedValue(undefined)

function LocationProbe() {
  const location = useLocation()

  return <output data-testid="location">{location.pathname}</output>
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/hoy']}>
      <LocationProbe />
      <Routes>
        <Route path="/hoy" element={<TodayPage />} />
        <Route path="/crear" element={<h1>Crear evento destino</h1>} />
        <Route
          path="/evento/:id"
          element={<h1>Detalle del evento destino</h1>}
        />
        <Route path="/eventos" element={<h1>Eventos destino</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

function emptyTodayData(): TodayData {
  return {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
  }
}

function expectBefore(first: HTMLElement, second: HTMLElement) {
  expect(
    first.compareDocumentPosition(second) &
    Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
}

describe('TodayPage', () => {
  afterEach(() => { vi.useRealTimers() })
  beforeEach(() => {
    vi.mocked(usePlanningPreferences).mockReturnValue({ dailyLimitHours: 6, isLoading: false, error: '', save: vi.fn(), refresh: vi.fn() })
    retry.mockClear()
    vi.mocked(useToday).mockReset()
    vi.mocked(useToday).mockReturnValue({
      data: todayDataFixture,
      setData: vi.fn(),
      isLoading: false,
      isRefetching: false,
      error: null,
      retry,
    })
  })

  it('calcula la capacidad con la preferencia de la cuenta y avisa si hay sobrecarga', () => {
    vi.mocked(usePlanningPreferences).mockReturnValue({ dailyLimitHours: 2, isLoading: false, error: '', save: vi.fn(), refresh: vi.fn() })
    renderPage()
    expect(screen.getAllByText('2 h/día').length).toBeGreaterThan(0)
    expect(screen.getByText(/Tu planificación de hoy supera tus 2 horas disponibles/)).toBeTruthy()
  })

  it('muestra la fecha de Bogotá y una región de tareas sin un main anidado', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-25T02:00:00Z'))
    renderPage()
    expect(screen.getByText('Jueves, 24 de septiembre de 2026')).toBeTruthy()
    expect(screen.queryByRole('main')).toBeNull()
    expect(screen.getByRole('region', { name: 'Tareas priorizadas' })).toBeTruthy()
  })

  it('reconcilia un evento que desaparece del filtro y usa el singular para una tarea', async () => {
    const { rerender } = render(<MemoryRouter><TodayPage /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox', { name: 'Evento' }))
    await user.click(await screen.findByRole('option', { name: 'Conferencia Frontend' }))
    expect(screen.getByText(/1 subtarea coincide con los filtros aplicados/)).toBeTruthy()
    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Para hoy' }))
    vi.mocked(useToday).mockReturnValue({ data: { ...todayDataFixture, today: [todayDataFixture.today[0]] }, isLoading: false, error: null, retry })
    rerender(<MemoryRouter><TodayPage /></MemoryRouter>)
    expect(screen.getByRole('combobox', { name: 'Evento' }).textContent).toBe('Todos los eventos')
    expect(screen.getByRole('combobox', { name: 'Estado' }).textContent).toBe('Para hoy')
    expect(screen.getAllByRole('button', { name: 'Ver tarea: Confirmar invitados hoy' }).length).toBeGreaterThan(0)
    expect(screen.getByText(/1 subtarea coincide con los filtros aplicados/)).toBeTruthy()
  })

  it('permite reintentar la carga del límite diario desde la advertencia', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined)
    vi.mocked(usePlanningPreferences).mockReturnValue({
      dailyLimitHours: 6,
      isLoading: false,
      error: 'No pudimos cargar tu límite diario. Inténtalo de nuevo.',
      save: vi.fn(),
      refresh,
    })

    renderPage()

    const warning = screen.getByText('No pudimos cargar tu límite diario. Inténtalo de nuevo.').closest<HTMLElement>('[role="status"]')!
    expect(within(warning).getByText('No pudimos cargar tu límite diario. Inténtalo de nuevo.')).toBeTruthy()
    await userEvent.setup().click(within(warning).getByRole('button', { name: 'Reintentar' }))
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('filtra por evento y estado con los selectores compartidos y permite limpiar ambos', async () => {
    renderPage()
    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox', { name: 'Evento' }))
    await user.keyboard('{ArrowDown}')
    await user.click(await screen.findByRole('option', { name: 'Conferencia Frontend' }))
    expect(screen.queryByRole('button', { name: 'Ver tarea: Confirmar invitados hoy' })).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Ver tarea: Revisar presentación hoy' }).length).toBeGreaterThan(0)
    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.keyboard('{ArrowDown}')
    await user.click(await screen.findByRole('option', { name: 'Para hoy' }))
    expect(screen.getByRole('combobox', { name: 'Estado' }).textContent).toBe('Para hoy')
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getByRole('combobox', { name: 'Evento' }).textContent).toBe('Todos los eventos')
    expect(screen.getByRole('combobox', { name: 'Estado' }).textContent).toBe('Todos')
    expect(screen.getAllByRole('button', { name: 'Ver tarea: Confirmar invitados hoy' }).length).toBeGreaterThan(0)
  })

  it('muestra el estado de carga', () => {
    vi.mocked(useToday).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      retry,
    })

    renderPage()

    expect(
      screen.getByRole('status', {
        name: 'Cargando prioridades de hoy',
      }),
    ).toBeTruthy()
  })

  it('renderiza prioridades, contenido y resumen en el orden correcto', () => {
    renderPage()

    const overdueHeading = screen.getByRole('heading', { name: 'Vencidas' })
    const todayHeading = screen.getByRole('heading', { name: 'Para hoy' })
    const upcomingHeading = screen.getByRole('heading', { name: 'Próximas' })

    expectBefore(overdueHeading, todayHeading)
    expectBefore(todayHeading, upcomingHeading)
    expect(screen.queryByRole('heading', { name: 'Completadas hoy' })).toBeNull()

    const overdueSection = overdueHeading.closest('section')
    const todaySection = todayHeading.closest('section')
    const upcomingSection = upcomingHeading.closest('section')

    expect(overdueSection).not.toBeNull()
    expect(todaySection).not.toBeNull()
    expect(upcomingSection).not.toBeNull()

    expect(
      within(overdueSection!).getByText(
        todayDataFixture.overdue[0].name,
      ),
    ).toBeTruthy()
    expect(
      within(todaySection!).getByText(todayDataFixture.today[0].name),
    ).toBeTruthy()
    expect(
      within(upcomingSection!).getByText(
        todayDataFixture.upcoming[0].name,
      ),
    ).toBeTruthy()
    expect(
      screen.queryByText(todayDataFixture.completed[0].name),
    ).toBeNull()

    const todayTask = screen.getAllByRole('button', {
      name: `Ver tarea: ${todayDataFixture.today[1].name}`,
    })[0]
    expect(todayTask).toBeTruthy()
    expect(
      within(todaySection!).getByText('Conferencia Frontend'),
    ).toBeTruthy()
    expect(
      within(todaySection!).getByText(/2\.25 h/),
    ).toBeTruthy()

    expect(
      screen.getByText(/Orden de Hoy: Vencidas/),
    ).toBeTruthy()
    expect(
      screen.getAllByText('3.75 h planificadas').length,
    ).toBeGreaterThan(0)
  })

  it('muestra el estado vacío cuando no existen tareas pendientes aunque existan completadas', () => {
    vi.mocked(useToday).mockReturnValue({
      data: {
        ...emptyTodayData(),
        completed: todayDataFixture.completed,
      },
      isLoading: false,
      error: null,
      retry,
    })

    renderPage()

    expect(
      screen.queryByRole('heading', {
        name: 'Completadas hoy',
      }),
    ).toBeNull()
    expect(
      screen.queryByText(todayDataFixture.completed[0].name),
    ).toBeNull()
    expect(
      screen.getByRole('heading', {
        name: 'No tienes gestiones pendientes para hoy',
      }),
    ).toBeTruthy()
  })

  it('filtra por fecha específica y permite limpiar el filtro', async () => {
    renderPage()
    const user = userEvent.setup()

    const dateInput = screen.getByLabelText('Fecha')
    await user.type(dateInput, '24092026')

    // Solo deben figurar las tareas del 24 de septiembre
    expect(screen.getByText(todayDataFixture.today[0].name)).toBeTruthy()
    expect(screen.getByText(todayDataFixture.today[1].name)).toBeTruthy()
    expect(screen.queryByText(todayDataFixture.overdue[0].name)).toBeNull()
    expect(screen.queryByText(todayDataFixture.upcoming[0].name)).toBeNull()
    expect(screen.queryByText(todayDataFixture.completed[0].name)).toBeNull()

    // Limpiar filtro
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getByText(todayDataFixture.overdue[0].name)).toBeTruthy()
    expect(screen.getByText(todayDataFixture.upcoming[0].name)).toBeTruthy()
    expect(screen.queryByText(todayDataFixture.completed[0].name)).toBeNull()
  })

  it('no incluye Completadas en el filtro de estado y filtra por Para hoy', async () => {
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.keyboard('{ArrowDown}')
    expect(screen.queryByRole('option', { name: 'Completadas' })).toBeNull()

    await user.click(await screen.findByRole('option', { name: 'Para hoy' }))

    expect(screen.getByRole('heading', { name: 'Para hoy' })).toBeTruthy()
    expect(screen.getByText(todayDataFixture.today[0].name)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Vencidas' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Próximas' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Completadas hoy' })).toBeNull()
  })

  it('colapsa una sección si supera 3 tareas', async () => {
    const manyUpcoming = [
      { ...todayDataFixture.upcoming[0], id: 101, name: 'Próxima 1' },
      { ...todayDataFixture.upcoming[0], id: 102, name: 'Próxima 2' },
      { ...todayDataFixture.upcoming[0], id: 103, name: 'Próxima 3' },
      { ...todayDataFixture.upcoming[0], id: 104, name: 'Próxima 4' },
    ]
    vi.mocked(useToday).mockReturnValue({
      data: {
        ...emptyTodayData(),
        upcoming: manyUpcoming,
      },
      isLoading: false,
      error: null,
      retry,
    })

    renderPage()
    const user = userEvent.setup()

    expect(screen.getByText('Próxima 1')).toBeTruthy()
    expect(screen.getByText('Próxima 2')).toBeTruthy()
    expect(screen.getByText('Próxima 3')).toBeTruthy()
    expect(screen.queryByText('Próxima 4')).toBeNull()

    const toggleButton = screen.getByRole('button', { name: /Ver todas las tareas de Próximas \(4\)/i })
    expect(toggleButton).toBeTruthy()

    await user.click(toggleButton)
    expect(screen.getByText('Próxima 4')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Ver menos tareas de Próximas/i })).toBeTruthy()
  })

  it('muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    vi.mocked(useToday).mockReturnValue({
      data: null,
      isLoading: false,
      error: 'No pudimos cargar tus tareas.',
      retry,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'No pudimos cargar tus tareas' }),
    ).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('navega a crear evento desde su acción principal', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    expect(
      screen.getByRole('heading', { name: 'Crear evento destino' }),
    ).toBeTruthy()
    expect(screen.getByTestId('location').textContent).toBe('/crear')
  })

  it('navega a eventos desde el estado vacío', async () => {
    const user = userEvent.setup()
    vi.mocked(useToday).mockReturnValue({
      data: emptyTodayData(),
      isLoading: false,
      error: null,
      retry,
    })

    renderPage()

    await user.click(
      screen.getByRole('button', {
        name: 'Ver próximos días',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Eventos destino',
      }),
    ).toBeTruthy()
  })

  it('navega al evento de la tarea seleccionada', async () => {
    const user = userEvent.setup()
    const task = todayDataFixture.today[1]
    renderPage()

    await user.click(
      screen.getAllByRole('button', {
        name: `Ver tarea: ${task.name}`,
      })[0],
    )

    expect(
      screen.getByRole('heading', { name: 'Detalle del evento destino' }),
    ).toBeTruthy()
    expect(screen.getByTestId('location').textContent).toBe(
      `/evento/${task.eventId}`,
    )
  })

  it('debe abrir el diálogo de registrar avance al seleccionar la opción del menú', async () => {
    const user = userEvent.setup()
    renderPage()

    const task = todayDataFixture.today[0]
    const actionsButton = screen.getByRole('button', { name: new RegExp(`Acciones de ${task.name}`, 'i') })
    await user.click(actionsButton)

    const registerOption = screen.getByRole('menuitem', { name: /Registrar avance/i })
    await user.click(registerOption)

    expect(screen.getByRole('dialog', { name: /Registrar avance/i })).toBeDefined()
  })

  it('debe abrir el diálogo de reprogramar al seleccionar la opción del menú', async () => {
    const user = userEvent.setup()
    renderPage()

    const task = todayDataFixture.today[0]
    const actionsButton = screen.getByRole('button', { name: new RegExp(`Acciones de ${task.name}`, 'i') })
    await user.click(actionsButton)

    const rescheduleOption = screen.getByRole('menuitem', { name: /Reprogramar/i })
    await user.click(rescheduleOption)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined()
    })
  })

  it('mantiene visible el aviso de sobrecarga cuando se aplican filtros', async () => {
    vi.mocked(usePlanningPreferences).mockReturnValue({ dailyLimitHours: 2, isLoading: false, error: '', save: vi.fn(), refresh: vi.fn() })
    renderPage()
    expect(screen.getByText(/Tu planificación de hoy supera tus 2 horas disponibles/)).toBeTruthy()

    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.keyboard('{ArrowDown}')
    await user.click(await screen.findByRole('option', { name: 'Para hoy' }))
    expect(screen.getByText(/Tu planificación total de hoy.*supera tus 2 horas disponibles/)).toBeTruthy()
  })

  it('no muestra la opción Editar detalles en el menú de acciones de la tarea en Hoy', async () => {
    const user = userEvent.setup()
    renderPage()

    const task = todayDataFixture.today[0]
    const actionsButton = screen.getByRole('button', { name: new RegExp(`Acciones de ${task.name}`, 'i') })
    await user.click(actionsButton)

    expect(screen.queryByRole('menuitem', { name: /Editar detalles/i })).toBeNull()
    expect(screen.getByRole('menuitem', { name: /Reprogramar/i })).toBeDefined()
    expect(screen.getByRole('menuitem', { name: /Ver detalles/i })).toBeDefined()
  })

  it('no muestra el esqueleto de carga completa ni desmonta los filtros durante el refetch', () => {
    vi.mocked(useToday).mockReturnValue({
      data: todayDataFixture,
      setData: vi.fn(),
      isLoading: false,
      isRefetching: true,
      error: null,
      retry,
    })

    renderPage()

    // The full page skeleton must NOT be present
    expect(screen.queryByTestId('today-loading-state')).toBeNull()

    // The filter section and guide button must remain mounted
    expect(screen.getByRole('button', { name: /¿Cómo funciona\?/i })).toBeDefined()
    expect(screen.getByLabelText(/^Evento$/i)).toBeDefined()
    expect(screen.getByLabelText(/^Fecha$/i)).toBeDefined()

    // The task list container indicates busy status without unmounting
    const tasksRegion = screen.getByLabelText('Tareas priorizadas')
    expect(tasksRegion).toBeDefined()
    expect(tasksRegion.parentElement?.getAttribute('aria-busy')).toBe('true')
  })
})
