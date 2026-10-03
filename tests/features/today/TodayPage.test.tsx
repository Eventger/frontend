import { render, screen, within } from '@testing-library/react'
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useToday } from '@/features/today/hooks/useToday'
import { TodayPage } from '@/features/today/pages/TodayPage'
import type { TodayData } from '@/features/today/types/today.types'
import { todayDataFixture } from './today.fixtures'

vi.mock('@/features/today/hooks/useToday', () => ({
  useToday: vi.fn(),
}))
vi.mock('@/features/settings/hooks/usePlanningPreferences', () => ({ usePlanningPreferences: vi.fn() }))

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
  beforeEach(() => {
    vi.mocked(usePlanningPreferences).mockReturnValue({ dailyLimitHours: 6, isLoading: false, error: '', save: vi.fn(), refresh: vi.fn() })
    retry.mockClear()
    vi.mocked(useToday).mockReset()
    vi.mocked(useToday).mockReturnValue({
      data: todayDataFixture,
      isLoading: false,
      error: null,
      retry,
    })
  })

  it('calcula la capacidad con la preferencia de la cuenta y avisa si hay sobrecarga', () => {
    vi.mocked(usePlanningPreferences).mockReturnValue({ dailyLimitHours: 2, isLoading: false, error: '', save: vi.fn(), refresh: vi.fn() })
    renderPage()
    expect(screen.getByText('3.75 h / 2 h')).toBeTruthy()
    expect(screen.getByText('Tu planificación de hoy supera el límite diario de 2 horas. Revisa tus tareas para reducir la sobrecarga.')).toBeTruthy()
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

    const todayTask = screen.getAllByRole('button', {
      name: `Ver tarea: ${todayDataFixture.today[1].name}`,
    })[0]
    expect(todayTask).toBeTruthy()
    expect(
      within(todaySection!).getByText(
        /Conferencia Frontend.*2.25 h/,
      ),
    ).toBeTruthy()

    expect(
      screen.queryByText(todayDataFixture.completed[0].name),
    ).toBeNull()
    expect(
      screen.queryByRole('heading', { name: 'Completadas' }),
    ).toBeNull()
    expect(
      screen.getByText(/Orden de Hoy: Vencidas/),
    ).toBeTruthy()
    expect(
      screen.getAllByText('3.75 h planificadas').length,
    ).toBeGreaterThan(0)
  })

  it('muestra empty cuando solo existen tareas completadas', () => {
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
      screen.getByRole('heading', {
        name: 'No tienes gestiones pendientes para hoy',
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', {
        name: 'Ver próximos días',
      }),
    ).toBeTruthy()
    expect(
      screen.queryByText(
        'No tienes tareas pendientes para hoy',
      ),
    ).toBeNull()
    expect(
      screen.queryByText(todayDataFixture.completed[0].name),
    ).toBeNull()
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
})
