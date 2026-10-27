import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { EventsSearchInput } from '@/features/events/components/EventsSearchInput'

describe('EventsSearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza con etiqueta accesible y placeholder', () => {
    render(<EventsSearchInput value="" onChange={vi.fn()} />)

    const input = screen.getByRole('searchbox', { name: 'Buscar por nombre' })
    expect(input).toBeTruthy()
    expect(input.getAttribute('placeholder')).toBe('Buscar por nombre de evento...')
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).toBeNull()
  })

  it('muestra el botón de limpiar cuando hay texto en la búsqueda', () => {
    render(<EventsSearchInput value="Boda" onChange={vi.fn()} />)

    const input = screen.getByRole('searchbox', { name: 'Buscar por nombre' }) as HTMLInputElement
    expect(input.value).toBe('Boda')
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeTruthy()
  })

  it('espera 300 ms de debounce antes de emitir el cambio al escribir', () => {
    const onChange = vi.fn()

    render(<EventsSearchInput value="" onChange={onChange} debounceMs={300} />)

    const input = screen.getByRole('searchbox', { name: 'Buscar por nombre' })
    fireEvent.change(input, { target: { value: 'Cumple' } })

    // Before 300ms, onChange has not fired
    expect(onChange).not.toHaveBeenCalled()

    // Advance 299ms
    vi.advanceTimersByTime(299)
    expect(onChange).not.toHaveBeenCalled()

    // Advance to 300ms
    vi.advanceTimersByTime(1)
    expect(onChange).toHaveBeenCalledWith('Cumple')
  })

  it('emite el cambio inmediatamente al presionar Enter sin esperar debounce', () => {
    const onChange = vi.fn()

    render(<EventsSearchInput value="" onChange={onChange} />)

    const input = screen.getByRole('searchbox', { name: 'Buscar por nombre' })
    fireEvent.change(input, { target: { value: 'Gala' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledWith('Gala')
  })

  it('limpia el texto y emite cadena vacía al hacer clic en Limpiar búsqueda', () => {
    const onChange = vi.fn()

    render(<EventsSearchInput value="Aniversario" onChange={onChange} />)

    const clearButton = screen.getByRole('button', { name: 'Limpiar búsqueda' })
    fireEvent.click(clearButton)

    expect(onChange).toHaveBeenCalledWith('')
    const input = screen.getByRole('searchbox', { name: 'Buscar por nombre' }) as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('limpia el texto al presionar Escape', () => {
    const onChange = vi.fn()

    render(<EventsSearchInput value="Conferencia" onChange={onChange} />)

    const input = screen.getByRole('searchbox', { name: 'Buscar por nombre' })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('muestra el indicador de carga animado cuando isLoading es true', () => {
    const { container } = render(<EventsSearchInput value="Gala" onChange={vi.fn()} isLoading={true} />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeTruthy()
  })

  it('suprime los botones nativos de cancelación en navegadores WebKit', () => {
    render(<EventsSearchInput value="" onChange={vi.fn()} />)

    const input = screen.getByRole('searchbox', { name: 'Buscar por nombre' })
    expect(input.className).toContain('[&::-webkit-search-cancel-button]:hidden')
  })
})
