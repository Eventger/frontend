import { useState } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EventLocationInput } from '@/features/events/components/EventLocationInput'
import { searchAddresses, type AddressSuggestion } from '@/features/events/services/address.service'
import { addressFixture, secondAddressFixture } from './address.fixtures'
import { deferred } from '../../deferred'

vi.mock('@/features/events/services/address.service', () => ({ searchAddresses: vi.fn() }))

function Controlled({ initialValue = '', disabled = false, onSubmit = vi.fn() }) {
  const [value, setValue] = useState(initialValue)
  return <form onSubmit={event => { event.preventDefault(); onSubmit(value) }}>
    <label htmlFor="location">Lugar</label>
    <EventLocationInput id="location" value={value} onChange={setValue} disabled={disabled} />
    <button type="submit">Guardar</button>
  </form>
}

describe('campo de lugar con sugerencias', () => {
  beforeEach(() => { vi.mocked(searchAddresses).mockReset().mockResolvedValue([addressFixture, secondAddressFixture]) })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('conserva un lugar existente sin iniciar búsquedas al montar', () => {
    render(<Controlled initialValue="Hacienda Las Palmas" />)
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Hacienda Las Palmas')
    expect(searchAddresses).not.toHaveBeenCalled()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('espera 500 ms y busca solo el último término con al menos tres caracteres', async () => {
    vi.useFakeTimers()
    render(<Controlled />)
    const input = screen.getByRole('combobox')
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Ca' } })
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(searchAddresses).not.toHaveBeenCalled()
    fireEvent.change(input, { target: { value: 'Cal' } })
    await act(() => vi.advanceTimersByTimeAsync(300))
    fireEvent.change(input, { target: { value: 'Cali' } })
    await act(() => vi.advanceTimersByTimeAsync(499))
    expect(searchAddresses).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(searchAddresses).toHaveBeenCalledOnce()
    expect(searchAddresses).toHaveBeenCalledWith('Cali', expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it('selecciona la dirección completa con clic y la envía como texto', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Controlled onSubmit={onSubmit} />)
    await user.type(screen.getByRole('combobox'), 'Chipichape')
    await user.click(await screen.findByRole('option', { name: /Centro Comercial Chipichape/ }))
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe(addressFixture.address)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onSubmit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onSubmit).toHaveBeenCalledWith(addressFixture.address)
  })

  it('permite elegir con flechas y Enter sin enviar el formulario', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Controlled onSubmit={onSubmit} />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'Cali')
    await screen.findByRole('option', { name: /Centro Comercial Chipichape/ })
    await user.keyboard('{ArrowUp}{Enter}')
    expect((input as HTMLInputElement).value).toBe(secondAddressFixture.address)
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('Escape cierra las sugerencias sin modificar el texto', async () => {
    const user = userEvent.setup()
    render(<Controlled />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'Cali')
    await screen.findByRole('listbox')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect((input as HTMLInputElement).value).toBe('Cali')
  })

  it('ignora una respuesta anterior después de cambiar la búsqueda', async () => {
    const previous = deferred<AddressSuggestion[]>()
    vi.mocked(searchAddresses).mockReturnValueOnce(previous.promise).mockResolvedValueOnce([secondAddressFixture])
    const user = userEvent.setup()
    render(<Controlled />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'Chipichape')
    await waitFor(() => expect(searchAddresses).toHaveBeenCalledOnce())
    await user.clear(input)
    await user.type(input, 'Teatro')
    await screen.findByRole('option', { name: /Teatro Municipal/ })
    await act(() => { previous.resolve([addressFixture]) })
    expect(screen.queryByRole('option', { name: /Centro Comercial Chipichape/ })).toBeNull()
  })

  it('un fallo de búsqueda permite conservar y guardar el lugar escrito', async () => {
    vi.mocked(searchAddresses).mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Controlled onSubmit={onSubmit} />)
    await user.type(screen.getByRole('combobox'), 'Mi dirección')
    await screen.findByText('No pudimos buscar direcciones. Puedes escribir el lugar completo.')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onSubmit).toHaveBeenCalledWith('Mi dirección')
  })

  it('comunica una búsqueda sin coincidencias', async () => {
    vi.mocked(searchAddresses).mockResolvedValue([])
    const user = userEvent.setup()
    render(<Controlled />)
    await user.type(screen.getByRole('combobox'), 'Lugar desconocido')
    expect(await screen.findByText(/No encontramos resultados/)).toBeTruthy()
  })

  it('bloquea el campo mientras el formulario está enviando', () => {
    render(<Controlled disabled />)
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(true)
    expect(searchAddresses).not.toHaveBeenCalled()
  })
})
