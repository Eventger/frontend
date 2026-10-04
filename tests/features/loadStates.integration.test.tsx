import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { EventsPage } from '@/features/events/pages/EventsPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { TodayPage } from '@/features/today/pages/TodayPage'
import { eventFixture, subtaskApiFixture } from './events/subtask.fixtures'

const emptyTasks = { overdue: [], today: [], upcoming: [], completed: [] }
const eventApi = {
  id: eventFixture.id,
  name: eventFixture.name,
  type: eventFixture.typeId,
  date: eventFixture.eventDate,
  location: eventFixture.location,
  contact: eventFixture.contact,
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function mockHttp(handler: (path: string) => Response) {
  const fetchMock = vi.fn(async (input: string, options?: RequestInit) => {
    const path = new URL(input).pathname
    if (path === '/event-types/') return json({ success: true, data: [{ id: 1, name: 'Boda', description: '' }] })
    if (path !== '/event-types/') {
      expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer test-token')
    }
    return handler(path)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const listViews = [
  {
    path: '/eventos',
    page: EventsPage,
    empty: 'Aún no tienes eventos',
    error: 'No pudimos cargar tus eventos',
    data: [],
  },
  {
    path: '/hoy',
    page: TodayPage,
    empty: 'No tienes gestiones pendientes para hoy',
    error: 'No pudimos cargar tus tareas',
    data: emptyTasks,
  },
] as const

function renderList(view: typeof listViews[number]) {
  return render(<MemoryRouter><view.page /></MemoryRouter>)
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={[`/evento/${eventFixture.id}`]}>
      <Routes>
        <Route path="/evento/:id" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('estados de carga con hooks, servicios y respuestas HTTP', () => {
  for (const view of listViews) {
    describe(view.path, () => {
      it('una cuenta sin datos muestra el mensaje vacío y no un error', async () => {
        mockHttp(() => json({ success: true, data: view.data, pagination: { page: 1, page_size: 6, total: 0, total_pages: 1 } }))
        renderList(view)

        expect(await screen.findByRole('heading', { name: view.empty })).toBeTruthy()
        expect(screen.queryByRole('heading', { name: view.error })).toBeNull()
        expect(screen.queryByRole('alert')).toBeNull()
      })

      it.each([401, 403, 404, 500, 503])('un HTTP %s conserva el error de carga', async (status) => {
        mockHttp(() => json({ success: false, message: 'Solicitud fallida' }, status))
        renderList(view)

        expect(await screen.findByRole('heading', { name: view.error })).toBeTruthy()
        expect(screen.queryByRole('heading', { name: view.empty })).toBeNull()
      })

      it('un fallo de red conserva el error de carga', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
        renderList(view)

        expect(await screen.findByRole('heading', { name: view.error })).toBeTruthy()
        expect(screen.queryByRole('heading', { name: view.empty })).toBeNull()
      })

      it('success false no se interpreta como una lista vacía', async () => {
        mockHttp(() => json({ success: false, data: view.data }))
        renderList(view)

        expect(await screen.findByRole('heading', { name: view.error })).toBeTruthy()
        expect(screen.queryByRole('heading', { name: view.empty })).toBeNull()
      })

      it('un reintento exitoso reemplaza el error por el estado vacío', async () => {
        let failed = true
        mockHttp(() => failed
          ? json({ success: false }, 503)
          : json({ success: true, data: view.data, pagination: { page: 1, page_size: 6, total: 0, total_pages: 1 } }))
        renderList(view)
        await screen.findByRole('heading', { name: view.error })

        failed = false
        await userEvent.setup().click(screen.getByRole('button', { name: 'Reintentar' }))

        expect(await screen.findByRole('heading', { name: view.empty })).toBeTruthy()
        expect(screen.queryByRole('heading', { name: view.error })).toBeNull()
      })
    })
  }

  it('Hoy vacío no consulta los eventos aunque ese servicio esté fallando', async () => {
    const fetchMock = mockHttp(path => path === '/hoy/'
      ? json({ success: true, data: emptyTasks })
      : json({ success: false }, 500))
    renderList(listViews[1])

    await screen.findByRole('heading', { name: listViews[1].empty })
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith('/hoy/'))).toHaveLength(1)
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/events/'))).toBe(false)
  })

  it('una cuenta con eventos muestra sus datos y su progreso vacío', async () => {
    mockHttp(path => json({ success: true, data: path === '/events/' ? [eventApi] : [], pagination: { page: 1, page_size: 6, total: 1, total_pages: 1 } }))
    renderList(listViews[0])

    expect(await screen.findByRole('heading', { name: eventFixture.name })).toBeTruthy()
    expect(await screen.findByText('0 % · 0/0 tareas')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: listViews[0].empty })).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('una cuenta con tareas muestra las prioridades y su evento', async () => {
    mockHttp(path => json({
      success: true,
      data: path === '/hoy/'
        ? { ...emptyTasks, today: [{ ...subtaskApiFixture, event_name: eventFixture.name }] }
        : [eventApi],
    }))
    renderList(listViews[1])

    expect((await screen.findAllByRole('button', { name: `Ver tarea: ${subtaskApiFixture.name}` })).length).toBeGreaterThan(0)
    expect(screen.getAllByText(new RegExp(eventFixture.name)).length).toBeGreaterThan(0)
    expect(screen.queryByRole('heading', { name: listViews[1].empty })).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('un evento inexistente usa su mensaje específico sin consultar sus tareas', async () => {
    const fetchMock = mockHttp(path => path === '/event-types/'
      ? json({ success: true, data: [] })
      : json({ success: false, message: 'El recurso solicitado no existe.' }, 404))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Evento no encontrado' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'No pudimos cargar el evento' })).toBeNull()
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/subtasks/'))).toBe(false)
  })

  it('el detalle de un evento sin tareas muestra el estado vacío definido', async () => {
    mockHttp(path => json({
      success: true,
      data: path === `/events/${eventFixture.id}/` ? eventApi : [],
    }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'Aún no tienes tareas para este evento' })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('un fallo al cargar las tareas del evento conserva el error', async () => {
    mockHttp(path => path.endsWith('/subtasks/')
      ? json({ success: false }, 500)
      : json({ success: true, data: path === '/event-types/' ? [] : eventApi }))
    renderDetail()

    expect(await screen.findByRole('heading', { name: 'No pudimos cargar el evento' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Aún no tienes tareas para este evento' })).toBeNull()
  })
})
