import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RescheduleTaskDialog } from '@/features/events/components/detail/RescheduleTaskDialog'
import { dayPlan, schedulingTask } from './planning.fixtures'
import { subtaskApiFixture } from './subtask.fixtures'

const saved = vi.fn()
const closed = vi.fn()
let patchStatus = 200
let writes: Record<string, unknown>[]

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }) }
function show(conflict = false) {
  render(<RescheduleTaskDialog task={schedulingTask} initialConflict={conflict ? dayPlan() : undefined} initialInput={conflict ? { name: 'Proveedor actualizado', targetDate: '2026-10-12', estimatedHours: 2, details: 'Conservar esta nota', state: 'pending' } : undefined} onClose={closed} onSaved={saved} />)
}

describe('RescheduleTaskDialog', () => {
  beforeEach(() => {
    writes = []; patchStatus = 200; saved.mockReset(); closed.mockReset()
    vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
      const body = JSON.parse(String(options.body))
      expect(new Headers(options.headers).get('Authorization')).toBe('Bearer test-token')
      if (url.endsWith('/reschedule-preview/')) return json({ success: true, data: dayPlan(body.target_date, Number(body.estimated_hours)) })
      if (options.method === 'PATCH') {
        writes.push(body)
        const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(body.target_date))
        if (patchStatus === 409) return json({ success: false, data: { ...dayPlan(date), planned_hours: '7', existing_hours: '5', has_conflict: true, overload_hours: '1' } }, 409)
        return json({ success: true, data: { ...subtaskApiFixture, id: schedulingTask.id, name: schedulingTask.name, details: '', ...body }, planning: dayPlan(date, Number(body.estimated_hours)) })
      }
      throw new Error('Ruta inesperada')
    }))
  })

  it('guarda una fecha sin conflicto y confirma la carga', async () => {
    const user = userEvent.setup(); show()
    await waitFor(() => expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(false))
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
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await waitFor(() => expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(false))
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    expect(await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })).toBeTruthy()
    expect(writes[0].target_date).toBe('2026-10-14T04:59:59.000Z')
  })

  it('recalcula una reducción insuficiente y conserva los otros campos al resolver', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await user.click(screen.getByRole('radio', { name: /Reducir el tiempo estimado/ }))
    fireEvent.change(screen.getByLabelText('Horas estimadas'), { target: { value: '1.5' } })
    await screen.findByText('Tu límite diario es 6 h. La sobrecarga sería de 0,5 h.')
    expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Horas estimadas'), { target: { value: '1' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
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
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(writes[0].target_date).toBe('2026-10-16T04:59:59.000Z')
  })

  it('explica la precisión inválida de horas y permite corregirla', async () => {
    const user = userEvent.setup(); show(true)
    await user.click(screen.getByRole('button', { name: 'Resolver conflicto' }))
    await user.click(screen.getByRole('radio', { name: /Reducir el tiempo estimado/ }))
    fireEvent.change(screen.getByLabelText('Horas estimadas'), { target: { value: '0.001' } })
    expect(screen.getByText(/con un máximo de dos decimales/)).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Aplicar opción' }) as HTMLButtonElement).disabled).toBe(true)
    expect(writes).toHaveLength(0)
    fireEvent.change(screen.getByLabelText('Horas estimadas'), { target: { value: '1' } })
    await screen.findByText('La carga está dentro de tu límite diario de 6 h.')
    await user.click(screen.getByRole('button', { name: 'Aplicar opción' }))
    await screen.findByRole('heading', { name: 'Tarea reprogramada correctamente' })
    expect(writes[0].estimated_hours).toBe('1.00')
  })

  it('recupera un conflicto recibido al guardar y permite cancelar', async () => {
    const user = userEvent.setup(); patchStatus = 409; show()
    await waitFor(() => expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(false))
    await user.click(screen.getByRole('button', { name: 'Reprogramar' }))
    expect(await screen.findByText('7 h / 6 h')).toBeTruthy()
    expect(saved).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cancelar reprogramación' }))
    expect(closed).toHaveBeenCalledOnce()
  })

  it('no guarda cuando falla la vista previa y permite reintentar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const user = userEvent.setup(); show()
    expect(await screen.findByText('No pudimos consultar la carga de ese día. Inténtalo de nuevo.')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Reprogramar' }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(writes).toHaveLength(0)
  })
})
