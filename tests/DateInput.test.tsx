import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DateInput } from '@/components/DateInput'

function ControlledDateInput({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)

  return (
    <>
      <label htmlFor="test-date">Fecha</label>
      <DateInput
        id="test-date"
        value={value}
        min="2026-01-01"
        max="2026-12-31"
        onValueChange={setValue}
      />
      <output aria-label="Fecha ISO">{value}</output>
    </>
  )
}

describe('DateInput', () => {
  it('muestra la fecha en orden día, mes y año y conserva los límites ISO', () => {
    render(<ControlledDateInput initialValue="2026-10-02" />)

    const input = screen.getByLabelText('Fecha') as HTMLInputElement
    expect(input.type).toBe('text')
    expect(input.value).toBe('02/10/2026')
    expect(input.placeholder).toBe('dd/mm/aaaa')
    expect(input.min).toBe('2026-01-01')
    expect(input.max).toBe('2026-12-31')
  })

  it('convierte la escritura localizada al formato ISO usado por la aplicación', async () => {
    const user = userEvent.setup()
    render(<ControlledDateInput />)

    await user.type(screen.getByLabelText('Fecha'), '29/02/2028')

    expect((screen.getByLabelText('Fecha') as HTMLInputElement).value).toBe('29/02/2028')
    expect(screen.getByLabelText('Fecha ISO').textContent).toBe('2028-02-29')
  })

  it('no propaga una fecha inexistente', async () => {
    const user = userEvent.setup()
    render(<ControlledDateInput />)

    await user.type(screen.getByLabelText('Fecha'), '31/02/2026')

    expect((screen.getByLabelText('Fecha') as HTMLInputElement).value).toBe('31/02/2026')
    expect(screen.getByLabelText('Fecha ISO').textContent).toBe('')
  })

  it('permite seleccionar la fecha con el calendario nativo', () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <DateInput aria-label="Fecha" value="" onValueChange={onValueChange} />,
    )
    const picker = container.querySelector('input[type="date"]') as HTMLInputElement

    fireEvent.change(picker, { target: { value: '2026-11-07' } })

    expect(onValueChange).toHaveBeenCalledWith('2026-11-07')
  })

  it('delega la apertura cuando usa un calendario personalizado', async () => {
    const user = userEvent.setup()
    const onCalendarOpen = vi.fn()
    const { container } = render(
      <DateInput
        aria-label="Fecha"
        value=""
        onValueChange={vi.fn()}
        onCalendarOpen={onCalendarOpen}
        calendarExpanded={false}
        calendarControls="custom-calendar"
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Abrir calendario' })
    expect(trigger.getAttribute('aria-controls')).toBe('custom-calendar')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('input[type="date"]')).toBeNull()

    await user.click(trigger)
    expect(onCalendarOpen).toHaveBeenCalledOnce()
  })
})
