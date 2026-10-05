import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEvents } from '@/features/events/hooks/useEvents'
import { useEventTypes } from '@/features/events/hooks/useEventTypes'
import { useEventSubtasks } from '@/features/events/hooks/useEventSubtasks'
import { EventsPage } from '@/features/events/pages/EventsPage'
import type { Event } from '@/features/events/types/event.types'

vi.mock('@/features/events/hooks/useEvents', () => ({
  useEvents: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventSubtasks', () => ({
  useEventSubtasks: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventTypes', () => ({ useEventTypes: vi.fn() }))

const event: Event = {
  id: 21,
  name: 'Boda Backend',
  typeId: 0,
  eventDate: '2099-12-31T00:00:00.000Z',
  location: 'Cali',
  contact: 'Laura 3001234567',
}

function renderPage(path = '/eventos') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <EventsPage />
    </MemoryRouter>,
  )
}

describe('EventsPage', () => {
  beforeEach(() => {
    vi.mocked(useEvents).mockReset()
    vi.mocked(useEventTypes).mockReturnValue({
      eventTypes: [{ id: 1, name: 'Boda', description: '' }, { id: 2, name: 'Social', description: '' }],
      isLoading: false, error: null, retry: vi.fn(),
    })
    vi.mocked(useEventSubtasks).mockReturnValue({
      subtasks: [],
      isLoading: false,
      error: null,
      refresh: vi.fn(),
    })
  })

  it('muestra el estado de carga', () => {
    vi.mocked(useEvents).mockReturnValue({
      events: [],
      pagination: null,
      isLoading: true,
      error: null,
      retry: vi.fn(),
    })

    renderPage()

    expect(
      screen.getByRole('status', {
        name: 'Cargando eventos',
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Crear evento' }),
    ).toBeTruthy()
  })

  it('muestra el error y permite reintentar', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    vi.mocked(useEvents).mockReturnValue({
      events: [],
      pagination: null,
      isLoading: false,
      error: 'No pudimos cargar los eventos',
      retry,
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'No pudimos cargar tus eventos' }),
    ).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(retry).toHaveBeenCalledOnce()
  })

  it('muestra el estado vacío', () => {
    vi.mocked(useEvents).mockReturnValue({
      events: [],
      pagination: null,
      isLoading: false,
      error: null,
      retry: vi.fn(),
    })

    renderPage()

    expect(
      screen.getByRole('heading', { name: 'Aún no tienes eventos' }),
    ).toBeTruthy()
    expect(
      screen.getByText(
        'Crea tu primer evento para organizar sus tareas y hacer seguimiento a su preparación.',
      ),
    ).toBeTruthy()
  })

  it('muestra los eventos con su progreso y acceso al detalle', () => {
    vi.mocked(useEvents).mockReturnValue({
      events: [event],
      pagination: { page: 1, pageSize: 6, total: 1, totalPages: 1 },
      isLoading: false,
      error: null,
      retry: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('heading', { name: event.name })).toBeTruthy()
    expect(
      screen.getByText('0 % · 0/0 tareas'),
    ).toBeTruthy()
    const eventLink = screen.getByRole('link', {
      name: new RegExp(event.name),
    })
    expect(eventLink.getAttribute('href')).toBe(`/evento/${event.id}`)
    expect(screen.getByRole('status', { name: 'Resumen de eventos' }).textContent).toBe('1 evento')
    expect(screen.queryByRole('navigation', { name: 'Paginación de eventos' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Anterior' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Siguiente' })).toBeNull()
  })

  it.each([
    { page: 1, previousDisabled: true, nextDisabled: false },
    { page: 2, previousDisabled: false, nextDisabled: false },
    { page: 3, previousDisabled: false, nextDisabled: true },
  ])('limita la navegación en la página $page', ({ page, previousDisabled, nextDisabled }) => {
    vi.mocked(useEvents).mockReturnValue({
      events: [event], pagination: { page, pageSize: 6, total: 13, totalPages: 3 },
      isLoading: false, error: null, retry: vi.fn(),
    })
    renderPage(`/eventos?page=${page}`)
    expect(useEvents).toHaveBeenCalledWith(page, null)
    expect(screen.getByText(`Página ${page} de 3`)).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Anterior' }) as HTMLButtonElement).disabled).toBe(previousDisabled)
    expect((screen.getByRole('button', { name: 'Siguiente' }) as HTMLButtonElement).disabled).toBe(nextDisabled)
  })

  it('solicita la siguiente página y regresa a la primera mediante la URL', async () => {
    vi.mocked(useEvents).mockImplementation((page = 1) => ({
      events: [event], pagination: { page, pageSize: 6, total: 13, totalPages: 3 },
      isLoading: false, error: null, retry: vi.fn(),
    }))
    renderPage()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByText('Página 2 de 3')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(screen.getByText('Página 1 de 3')).toBeTruthy()
    expect(useEvents).toHaveBeenLastCalledWith(1, null)
  })

  it.each(['-1', 'texto', '1.5'])('normaliza la página inválida %s a la primera', page => {
    vi.mocked(useEvents).mockReturnValue({ events: [], pagination: null, isLoading: true, error: null, retry: vi.fn() })
    renderPage(`/eventos?page=${page}`)
    expect(useEvents).toHaveBeenCalledWith(1, null)
  })

  it('cambiar el tipo reinicia la página y conserva el filtro al paginar', async () => {
    vi.mocked(useEvents).mockImplementation((page = 1) => ({
      events: [event], pagination: { page, pageSize: 6, total: 13, totalPages: 3 },
      isLoading: false, error: null, retry: vi.fn(),
    }))
    renderPage('/eventos?page=3')
    const user = userEvent.setup()
    await user.click(screen.getByRole('combobox', { name: 'Tipo de evento' }))
    await user.keyboard('{ArrowDown}')
    await user.click(await screen.findByRole('option', { name: 'Social' }))
    expect(useEvents).toHaveBeenLastCalledWith(1, 2)
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(useEvents).toHaveBeenLastCalledWith(2, 2)
    await user.click(screen.getByRole('button', { name: 'Limpiar filtro' }))
    expect(useEvents).toHaveBeenLastCalledWith(1, null)
    expect(screen.getByRole('combobox', { name: 'Tipo de evento' }).textContent).toBe('Todos los tipos')
  })

  it('distingue un filtro sin coincidencias de una cuenta sin eventos y permite limpiarlo', async () => {
    vi.mocked(useEvents).mockReturnValue({ events: [], pagination: null, isLoading: false, error: null, retry: vi.fn() })
    renderPage('/eventos?type=2')
    expect(screen.getByRole('heading', { name: 'No hay eventos de este tipo' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Aún no tienes eventos' })).toBeNull()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Ver todos los eventos' }))
    expect(useEvents).toHaveBeenLastCalledWith(1, null)
  })

  it('un fallo del catálogo mantiene la lista de eventos y permite reintentar los tipos', async () => {
    const retryTypes = vi.fn()
    vi.mocked(useEventTypes).mockReturnValue({ eventTypes: [], isLoading: false, error: 'No pudimos cargar los tipos de evento.', retry: retryTypes })
    vi.mocked(useEvents).mockReturnValue({ events: [event], pagination: null, isLoading: false, error: null, retry: vi.fn() })
    renderPage()
    expect(screen.getByRole('heading', { name: event.name })).toBeTruthy()
    expect(screen.getByRole('alert')).toBeTruthy()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar tipos' }))
    expect(retryTypes).toHaveBeenCalledOnce()
  })
})
