import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { TodayPage } from '@/features/today/pages/TodayPage'
import { buildTodayApiTask } from '../today/today.fixtures'
import { dayPlan } from './planning.fixtures'
import { eventFixture, subtaskApiFixture } from './subtask.fixtures'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('reprogramación con hooks, servicios y respuestas HTTP', () => {
  it('mantiene la confirmación de Aplicar opción en Hoy mientras se recarga la lista', async () => {
    const user = userEvent.setup()
    let task = buildTodayApiTask({ target_date: '2026-10-10', estimated_hours: '2.00' })
    let reads = 0
    let writes = 0
    let finishRefresh!: (response: Response) => void
    const refresh = new Promise<Response>(resolve => { finishRefresh = resolve })
    const todayResponse = () => json({ success: true, data: { overdue: [task], today: [], upcoming: [], completed: [] } })
    vi.stubGlobal('fetch', vi.fn(async (input: string, options?: RequestInit) => {
      const path = new URL(input).pathname
      if (path === '/api/auth/preferences/') return json({ success: true, data: { daily_limit_hours: '6.00', daily_limit_configured: true } })
      if (path === '/hoy/') return ++reads === 1 ? todayResponse() : refresh
      const body = JSON.parse(String(options?.body))
      if (path === `/subtasks/${task.id}/reschedule-preview/`) return json({ success: true, data: dayPlan(body.target_date, Number(body.estimated_hours)) })
      if (path === `/subtasks/${task.id}/` && options?.method === 'PATCH') {
        writes++
        task = { ...task, ...body }
        return json({ success: true, data: task, planning: dayPlan('2026-10-13', Number(body.estimated_hours)) })
      }
      throw new Error(`Solicitud inesperada: ${path}`)
    }))
    render(<MemoryRouter><TodayPage /></MemoryRouter>)
    await user.click(await screen.findByRole('button', { name: `Reprogramar tarea: ${task.name}` }))
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-12' } })
    await waitFor(() => expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(false))
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await waitFor(() => expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(false))
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    await waitFor(() => expect(reads).toBe(2))
    expect(writes).toBe(1)
    await user.click(screen.getByRole('button', { name: 'Volver al plan' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await act(async () => { finishRefresh(todayResponse()) })
  })
  it.each([503, 'network'] as const)('mantiene el cambio confirmado y el borrador si la recarga falla con %s', async (failure) => {
    const user = userEvent.setup()
    let savedTask = { ...subtaskApiFixture, estimated_hours: '2.00' }
    let failReload = true
    const writes: Record<string, unknown>[] = []
    const fetchMock = vi.fn(async (input: string, options?: RequestInit) => {
      const path = new URL(input).pathname
      if (path === '/event-types/') return json({ success: true, data: [{ id: eventFixture.typeId, name: 'Boda', description: '' }] })
      expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer test-token')
      if (path === `/events/${eventFixture.id}/`) return json({ success: true, data: {
        id: eventFixture.id, name: eventFixture.name, type: eventFixture.typeId,
        date: eventFixture.eventDate, location: eventFixture.location, contact: eventFixture.contact,
      } })
      if (path === `/events/${eventFixture.id}/subtasks/`) {
        if (writes.length && failReload) {
          if (failure === 'network') throw new TypeError('Failed to fetch')
          return json({ success: false }, failure)
        }
        return json({ success: true, data: [savedTask] })
      }
      const body = JSON.parse(String(options?.body))
      if (path === `/subtasks/${savedTask.id}/reschedule-preview/`) {
        return json({ success: true, data: dayPlan(body.target_date, Number(body.estimated_hours)) })
      }
      if (path === `/subtasks/${savedTask.id}/` && options?.method === 'PATCH') {
        writes.push(body)
        savedTask = { ...savedTask, ...body }
        return json({ success: true, data: savedTask, planning: dayPlan('2026-10-13', Number(body.estimated_hours)) })
      }
      throw new Error(`Solicitud inesperada: ${path}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<MemoryRouter initialEntries={[`/evento/${eventFixture.id}`]}><Routes>
      <Route path="/evento/:id" element={<EventDetailPage />} />
    </Routes></MemoryRouter>)

    await user.click(await screen.findByRole('button', { name: 'Editar evento' }))
    await user.clear(screen.getByLabelText('Contacto *'))
    await user.type(screen.getByLabelText('Contacto *'), 'Contacto sin guardar')
    await user.click(screen.getByRole('button', { name: `Reprogramar ${savedTask.name}` }))
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-13' } })
    await waitFor(() => expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(false))
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    await user.click(screen.getByRole('button', { name: 'Volver al plan' }))

    const tasks = screen.getByRole('list', { name: 'Tareas agregadas' })
    expect(within(tasks).getByText('13/10/2026').getAttribute('datetime')).toBe('2026-10-13')
    expect((screen.getByLabelText('Contacto *') as HTMLInputElement).value).toBe('Contacto sin guardar')
    expect(screen.getByText('No pudimos actualizar la lista de tareas. Los cambios guardados se conservan.')).toBeTruthy()
    expect(writes).toHaveLength(1)

    failReload = false
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(screen.queryByText('Actualizando la lista de tareas…')).toBeNull())
    expect(screen.queryByText('No pudimos actualizar la lista de tareas. Los cambios guardados se conservan.')).toBeNull()
    expect(writes).toHaveLength(1)
    expect(fetchMock.mock.calls.filter(([url]) => url.endsWith(`/events/${eventFixture.id}/subtasks/`))).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: `Editar ${savedTask.name}` }))
    expect((screen.getByLabelText('Fecha límite *') as HTMLInputElement).value).toBe('2026-10-13')
    expect((screen.getByLabelText('Contacto *') as HTMLInputElement).value).toBe('Contacto sin guardar')
  })
})
