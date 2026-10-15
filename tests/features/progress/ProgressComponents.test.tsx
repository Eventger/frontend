import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ProgressEmptyState } from '@/features/progress/components/ProgressEmptyState'
import { ProgressErrorState } from '@/features/progress/components/ProgressErrorState'

describe('ProgressComponents', () => {
  describe('ProgressErrorState', () => {
    it('debe renderizar el mensaje de error y ejecutar la función de reintento al hacer clic', async () => {
      const user = userEvent.setup()
      const onRetry = vi.fn()

      render(<ProgressErrorState onRetry={onRetry} />)

      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByText('No pudimos cargar el progreso')).toBeDefined()

      const retryButton = screen.getByRole('button', { name: /Reintentar/i })
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('debe deshabilitar el botón y mostrar texto de reintento cuando isRetrying es true', () => {
      render(<ProgressErrorState onRetry={vi.fn()} isRetrying={true} />)

      const button = screen.getByRole('button', { name: /Reintentando…/i })
      expect((button as HTMLButtonElement).disabled).toBe(true)
    })
  })

  describe('ProgressEmptyState', () => {
    it('debe renderizar el mensaje para evento sin subtareas y el enlace al evento', () => {
      render(
        <MemoryRouter>
          <ProgressEmptyState eventId={42} eventName="Boda de Prueba" />
        </MemoryRouter>,
      )

      expect(screen.getByText(/Aún no tienes subtareas/i)).toBeDefined()
      expect(screen.getByText(/Boda de Prueba/i)).toBeDefined()

      const link = screen.getByRole('link', { name: /Agregar subtarea/i })
      expect(link.getAttribute('href')).toBe('/evento/42')
    })
  })
})