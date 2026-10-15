import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProgress } from '@/features/progress/hooks/useProgress'
import { ProgressPage } from '@/features/progress/pages/ProgressPage'

const mockNavigate = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/features/progress/hooks/useProgress', () => ({
  useProgress: vi.fn(),
}))

describe('ProgressPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe mostrar el estado de carga mientras se obtienen los datos', () => {
    vi.mocked(useProgress).mockReturnValue({
      data: null,
      isLoading: true,
      error: false,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('Cargando progreso')).toBeDefined()
  })

  it('debe renderizar el estado de error si el servicio falla', () => {
    vi.mocked(useProgress).mockReturnValue({
      data: null,
      isLoading: false,
      error: true,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toBeDefined()
  })

  it('debe mostrar la tarjeta de estado vacío cuando el usuario no tiene eventos', () => {
    vi.mocked(useProgress).mockReturnValue({
      data: { events: [] },
      isLoading: false,
      error: false,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Aún no tienes eventos')).toBeDefined()
  })

  it('debe listar los eventos con sus porcentajes y barras de progreso cuando existen datos', () => {
    vi.mocked(useProgress).mockReturnValue({
      data: {
        events: [
          {
            event: { id: 10, name: 'Conferencia Tech' } as any,
            completedCount: 2,
            totalCount: 4,
            percentage: 50,
          },
          {
            event: { id: 11, name: 'Lanzamiento App' } as any,
            completedCount: 0,
            totalCount: 0,
            percentage: 0,
          },
        ],
      },
      isLoading: false,
      error: false,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Conferencia Tech')).toBeDefined()
    expect(screen.getByText('2 de 4 tareas completadas')).toBeDefined()
    expect(screen.getByText('50%')).toBeDefined()

    expect(screen.getByText('Lanzamiento App')).toBeDefined()
    expect(screen.getByText('0 de 0 tareas')).toBeDefined()
    expect(screen.getByText('Aún no tienes subtareas. Crea un plan inicial.')).toBeDefined()
  })

  it('debe navegar al detalle del evento al hacer clic en el nombre del evento o el botón Ver evento', async () => {
    const user = userEvent.setup()

    vi.mocked(useProgress).mockReturnValue({
      data: {
        events: [
          {
            event: { id: 10, name: 'Conferencia Tech' } as any,
            completedCount: 4,
            totalCount: 4,
            percentage: 100,
          },
        ],
      },
      isLoading: false,
      error: false,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    )

    const titleButton = screen.getByRole('button', { name: 'Conferencia Tech' })
    await user.click(titleButton)

    expect(mockNavigate).toHaveBeenCalledWith('/evento/10', { viewTransition: true })

    const viewEventButton = screen.getByRole('button', { name: /Ver evento/i })
    await user.click(viewEventButton)

    expect(mockNavigate).toHaveBeenCalledWith('/evento/10', { viewTransition: true })
  })

  it('debe navegar a la pantalla de crear evento al presionar el botón de la cabecera', async () => {
    const user = userEvent.setup()

    vi.mocked(useProgress).mockReturnValue({
      data: { events: [] },
      isLoading: false,
      error: false,
      retry: vi.fn(),
    })

    render(
      <MemoryRouter>
        <ProgressPage />
      </MemoryRouter>,
    )

    const createButton = screen.getByRole('button', { name: /Crear evento/i })
    await user.click(createButton)

    expect(mockNavigate).toHaveBeenCalledWith('/crear', { viewTransition: true })
  })
})