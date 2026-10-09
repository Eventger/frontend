import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'
import { dayPlan, schedulingTask } from './planning.fixtures'
import { eventFixture, subtaskApiFixture } from './subtask.fixtures'

const saved = vi.fn()
const closed = vi.fn()
let patchStatus = 200
let writes: Record<string, unknown>[]

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }) }
function show(conflict = false) {
  render(<RescheduleTaskDialog task={schedulingTask} initialConflict={conflict ? dayPlan() : undefined} initialInput={conflict ? { name: 'Proveedor actualizado', targetDate: '2026-10-12', estimatedHours: 2, details: 'Conservar esta nota', state: 'pending' } : undefined} onClose={closed} onSaved={saved} />)
}

async function selectDuration(user: ReturnType<typeof userEvent.setup>, label: string, value: string) {
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(screen.getByRole('option', { name: value }))
}

describe('RescheduleTaskDialog', () => {
  afterEach(() => { vi.useRealTimers() })

  it('usa hoy en Bogotá como mínimo y bloquea fechas pasadas aunque se ingresen manualmente', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-08T02:00:00Z'))
    show()
    const date = screen.getByLabelText('Nueva fecha') as HTMLInputElement
    expect(date.min).toBe('2026-10-07')
    expect(date.value).toBe('')
    expect(screen.getByText('Elige una fecha')).toBeTruthy()
    expect(screen.getByText('Aquí verás la carga del día antes de reprogramar.')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(await screen.findByText(/Fecha del evento: 24 de octubre de 2026/)).toBeTruthy()
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1)
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('/events/21/')
    expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(date, { target: { value: '2026-10-06' } })
    expect(screen.getByText('No puedes reprogramar una tarea para una fecha anterior a hoy.')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(true)
    expect(writes).toHaveLength(0)
    fireEvent.change(date, { target: { value: '2026-10-07' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('deja vacía la nueva fecha de una tarea vencida y conserva la fecha original como información', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-11T12:00:00Z'))
    show()
    expect((screen.getByLabelText('Nueva fecha') as HTMLInputElement).value).toBe('')
    expect(screen.getByText(/Actualmente: sábado, 10 de octubre/)).toBeTruthy()
    expect(await screen.findByText(/Fecha del evento: 24 de octubre de 2026/)).toBeTruthy()
    expect(vi.mocked(fetch).mock.calls).toHaveLength(1)
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-11' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
  })
  it('pide confirmación antes de guardar y conserva la duración al volver', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await user.click(screen.getByRole('radio', { name: /Reducir el tiempo estimado/ }))
    await selectDuration(user, 'Horas', '1')
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await screen.findByRole('heading', { name: '¿Estás seguro?' })
    expect(screen.getByText('¿Seguro que quieres reprogramar la subtarea?')).toBeTruthy()
    expect(screen.getByText('Quedarías con 6 h para ese día (tu límite es 6 h).')).toBeTruthy()
    expect(writes).toHaveLength(0)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('combobox', { name: 'Horas' }).textContent).toBe('1')
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(writes).toHaveLength(1)
    expect(writes[0].estimated_hours).toBe('1.00')
  })
  it('confirma Aplicar opción sin esperar a que termine la recarga de tareas', async () => {
    let finishRefresh!: () => void
    saved.mockReturnValueOnce(new Promise<void>(resolve => { finishRefresh = resolve }))
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await waitFor(() => expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(false))
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect((screen.getByRole('button', { name: 'Volver al plan' }) as HTMLButtonElement).disabled).toBe(false)
    expect((screen.getByRole('button', { name: 'Cerrar' }) as HTMLButtonElement).disabled).toBe(false)
    expect(writes).toHaveLength(1)
    await act(async () => { finishRefresh() })
  })
  it.each([false, true])('permite cerrar con la X en el estado de conflicto=%s', async (conflict) => {
    const user = userEvent.setup(); show(conflict)
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(closed).toHaveBeenCalledOnce()
    expect(writes).toHaveLength(0)
  })
  beforeEach(() => {
    writes = []; patchStatus = 200; saved.mockReset(); closed.mockReset()
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      const body = options.body ? JSON.parse(String(options.body)) : undefined
      expect(new Headers(options.headers).get('Authorization')).toBe('Bearer test-token')
      if (url.endsWith('/events/21/')) return json({ success: true, data: {
        id: eventFixture.id, user: 1, name: eventFixture.name, type: eventFixture.typeId,
        date: eventFixture.eventDate, location: eventFixture.location, contact: eventFixture.contact,
        created_at: '2026-09-24T12:00:00.000Z', updated_at: '2026-09-24T12:00:00.000Z',
      } })
      if (url.endsWith('/reschedule-preview/')) return json({ success: true, data: dayPlan(body.target_date, Number(body.estimated_hours)) })
      if (options.method === 'PATCH') {
        writes.push(body)
        const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(body.target_date))
        if (patchStatus === 400) return json({ success: false, errors: { target_date: ['La fecha límite no puede ser posterior a la fecha del evento.'] } }, 400)
        if (patchStatus === 409) return json({ success: false, data: { ...dayPlan(date), planned_hours: '7', existing_hours: '5', has_conflict: true, overload_hours: '1' } }, 409)
        return json({ success: true, data: { ...subtaskApiFixture, id: schedulingTask.id, name: schedulingTask.name, details: '', ...body }, planning: dayPlan(date, Number(body.estimated_hours)) })
      }
      throw new Error('Ruta inesperada')
    }))
  })

  it('guarda una fecha sin conflicto y confirma la carga', async () => {
    const user = userEvent.setup(); show()
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-13' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    expect(await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })).toBeTruthy()
    expect(writes).toHaveLength(1)
    expect(writes[0].target_date).toBe('2026-10-14T04:59:59.000Z')
    expect(saved).toHaveBeenCalledOnce()
    expect(saved).toHaveBeenCalledWith(expect.objectContaining({ id: schedulingTask.id, targetDate: writes[0].target_date, estimatedHours: 2 }))
  })

  it('muestra 7 frente a 6 sin escribir y permite mover a un día recomendado', async () => {
    const user = userEvent.setup(); show()
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-12' } })
    await screen.findByText('Tu límite diario es 6 h. La sobrecarga sería de 1 h.')
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    expect(await screen.findByText('7 h / 6 h')).toBeTruthy()
    expect(writes).toHaveLength(0)
    expect(screen.getByRole('button', { name: /^Volver$/ })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /^Volver$/ }))
    expect((screen.getByLabelText('Nueva fecha') as HTMLInputElement).value).toBe('2026-10-12')
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-13' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    expect(await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })).toBeTruthy()
    expect(writes[0].target_date).toBe('2026-10-14T04:59:59.000Z')
  })

  it('conserva cancelar reprogramación al abrir directamente un conflicto', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Cancelar reprogramación' }))
    expect(closed).toHaveBeenCalledOnce()
    expect(writes).toHaveLength(0)
  })

  it('vuelve al estado vacío si se borra una fecha con sobrecarga', async () => {
    show()
    const date = screen.getByLabelText('Nueva fecha') as HTMLInputElement
    fireEvent.change(date, { target: { value: '2026-10-12' } })
    await screen.findByText('Tu límite diario es 6 h. La sobrecarga sería de 1 h.')
    const previewRequests = vi.mocked(fetch).mock.calls.length

    fireEvent.change(date, { target: { value: '' } })
    expect(screen.getByText('Elige una fecha')).toBeTruthy()
    expect(screen.queryByText('Tu límite diario es 6 h. La sobrecarga sería de 1 h.')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
    expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(true)
    expect(vi.mocked(fetch).mock.calls).toHaveLength(previewRequests)
  })

  it('recalcula una reducción insuficiente y conserva los otros campos al resolver', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await user.click(screen.getByRole('radio', { name: /Reducir el tiempo estimado/ }))
    await selectDuration(user, 'Horas', '1')
    await selectDuration(user, 'Minutos', '30')
    await screen.findByText('Tu límite diario es 6 h. La sobrecarga sería de 30 min.')
    expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(true)
    await selectDuration(user, 'Horas', '1')
    await selectDuration(user, 'Minutos', '0')
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(writes[0]).toMatchObject({ estimated_hours: '1.00', name: 'Proveedor actualizado', details: 'Conservar esta nota', state: 'pending' })
  })

  it('permite elegir otra fecha manualmente', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await user.click(screen.getByRole('radio', { name: /Elegir manualmente otro día/ }))
    fireEvent.change(screen.getByLabelText('Otra fecha'), { target: { value: '2026-10-15' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(writes[0].target_date).toBe('2026-10-16T04:59:59.000Z')
  })

  it('ofrece horas enteras y no permite una duración de cero', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await user.click(screen.getByRole('radio', { name: /Reducir el tiempo estimado/ }))
    await user.click(screen.getByRole('combobox', { name: 'Horas' }))
    expect(screen.queryByRole('option', { name: '0.001' })).toBeNull()
    await user.click(screen.getByRole('option', { name: '0' }))
    expect(screen.getByText(/horas enteras y minutos entre 0 y 59/)).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(true)
    expect(writes).toHaveLength(0)
    await selectDuration(user, 'Horas', '1')
    await selectDuration(user, 'Minutos', '0')
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(writes[0].estimated_hours).toBe('1.00')
  })

  it('valida minutos y convierte una duración menor de una hora al contrato del backend', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await user.click(screen.getByRole('radio', { name: /Reducir el tiempo estimado/ }))
    await selectDuration(user, 'Horas', '0')
    await user.click(screen.getByRole('combobox', { name: 'Minutos' }))
    expect(screen.queryByRole('option', { name: '60' })).toBeNull()
    expect(screen.queryByRole('option', { name: '-1' })).toBeNull()
    await user.click(screen.getByRole('option', { name: '0' }))
    expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(true)
    expect(writes).toHaveLength(0)
    await selectDuration(user, 'Minutos', '45')
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(writes[0].estimated_hours).toBe('0.75')
  })

  it('recupera un conflicto recibido al guardar y permite volver a la fecha', async () => {
    const user = userEvent.setup(); patchStatus = 409; show()
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-11' } })
    await waitFor(() => expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(false))
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    expect(await screen.findByText('7 h / 6 h')).toBeTruthy()
    expect(saved).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /^Volver$/ }))
    expect((screen.getByLabelText('Nueva fecha') as HTMLInputElement).value).toBe('2026-10-11')
    expect(closed).not.toHaveBeenCalled()
  })

  it('no guarda cuando falla la vista previa y permite reintentar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const user = userEvent.setup(); show()
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-13' } })
    expect(await screen.findByText('No pudimos consultar la carga de ese día. Inténtalo de nuevo.')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(writes).toHaveLength(0)
  })
  it('conserva la fecha y muestra el error del servidor si el evento cambió después de la vista previa', async () => {
    const user = userEvent.setup(); patchStatus = 400; show()
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-13' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    await screen.findByText('La fecha límite no puede ser posterior a la fecha del evento.')
    expect((screen.getByLabelText('Nueva fecha') as HTMLInputElement).value).toBe('2026-10-13')
    expect(saved).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: 'Tarea reprogramada correctamente' })).toBeNull()
    patchStatus = 200
    fireEvent.change(screen.getByLabelText('Nueva fecha'), { target: { value: '2026-10-14' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(saved).toHaveBeenCalledOnce()
  })

})
