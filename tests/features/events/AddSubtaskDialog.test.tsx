import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { AddSubtaskDialog } from '@/features/events/components/detail/AddSubtaskDialog'
import { eventFixture } from './subtask.fixtures'

function renderDialog(onSubmit = vi.fn()) {
  return render(
    <AddSubtaskDialog
      open
      eventName={eventFixture.name}
      eventDate={eventFixture.eventDate}
      onOpenChange={vi.fn()}
      onSubmit={onSubmit}
    />,
  )
}

async function fillRequiredFields({
  hours = '2.5',
  targetDate = '2026-10-20',
}: {
  hours?: string
  targetDate?: string
} = {}) {
  const user = userEvent.setup()

  await user.type(
    screen.getByLabelText('Nombre de la tarea *'),
    'Coordinar transporte',
  )
  await user.type(
    screen.getByLabelText('Fecha límite *'),
    targetDate,
  )
  await user.type(
    screen.getByLabelText('Tiempo estimado *'),
    hours,
  )

  return user
}

describe('AddSubtaskDialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-24T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza los campos de creación de una subtarea', () => {
    renderDialog()

    expect(screen.getByLabelText('Nombre de la tarea *')).toBeTruthy()
    expect(screen.getByLabelText('Fecha límite *')).toBeTruthy()
    expect(screen.getByLabelText('Tiempo estimado *')).toBeTruthy()
    expect(screen.getByLabelText('Nota (opcional)')).toBeTruthy()
  })

  it('muestra los errores obligatorios y no envía el formulario vacío', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderDialog(onSubmit)

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(screen.getByText('Ingresa el nombre de la tarea.')).toBeTruthy()
    expect(screen.getByText('Selecciona la fecha límite.')).toBeTruthy()
    expect(screen.getByText('Ingresa el tiempo estimado.')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rechaza un tiempo estimado igual o menor que cero', async () => {
    const onSubmit = vi.fn()
    renderDialog(onSubmit)
    const user = await fillRequiredFields({ hours: '0' })

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(screen.getByText('Ingresa un tiempo mayor que cero.')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rechaza una fecha posterior a la fecha del evento', async () => {
    const onSubmit = vi.fn()
    renderDialog(onSubmit)
    const user = await fillRequiredFields({ targetDate: '2026-10-25' })

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(
      screen.getByText('La tarea debe completarse antes del evento.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rechaza una fecha límite pasada', async () => {
    const onSubmit = vi.fn()
    renderDialog(onSubmit)
    const user = await fillRequiredFields({ targetDate: '2026-09-23' })

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(
      screen.getByText('La fecha límite no puede estar en el pasado.'),
    ).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía una sola vez los datos válidos y permite una nota vacía', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderDialog(onSubmit)
    const user = await fillRequiredFields()

    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Coordinar transporte',
      targetDate: '2026-10-20',
      estimatedHours: 2.5,
      details: '',
    })
    expect(typeof onSubmit.mock.calls[0][0].estimatedHours).toBe('number')
  })
})
