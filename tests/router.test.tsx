import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { appRoutes } from '@/app/router'
import { RouteErrorPage } from '@/components/RouteErrorPage'

describe('recuperación de rutas', () => {
  it('una dirección desconocida muestra el mensaje 404 de Eventger', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/eventoss'] })
    render(<RouterProvider router={router} />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeTruthy()
    expect(screen.queryByText('Unexpected Application Error!')).toBeNull()
  })

  it('permite volver al inicio desde el mensaje de página inexistente', async () => {
    const router = createMemoryRouter([
      { path: '/', element: <h1>Inicio</h1> },
      { path: '*', element: <RouteErrorPage notFound /> },
    ], { initialEntries: ['/enlace-antiguo'] })
    render(<RouterProvider router={router} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Ir al inicio' }))
    expect(await screen.findByRole('heading', { name: 'Inicio' })).toBeTruthy()
    expect(router.state.location.pathname).toBe('/')
  })

  it.each([404, 500])('la barrera de errores del router presenta un HTTP %i en español', async (status) => {
    const router = createMemoryRouter([{
      errorElement: appRoutes[0].errorElement,
      hydrateFallbackElement: <p>Cargando página…</p>,
      children: [{ path: '/fallo', loader: () => { throw new Response('Internal technical details', { status }) }, element: <h1>Contenido</h1> }],
    }], { initialEntries: ['/fallo'] })
    render(<RouterProvider router={router} />)
    expect(await screen.findByRole('heading', { level: 1, name: status === 404 ? 'Página no encontrada' : 'Algo salió mal' })).toBeTruthy()
    expect(screen.queryByText(/Internal technical details/)).toBeNull()
    expect(screen.getByRole('button', { name: status === 404 ? 'Ir al inicio' : 'Recargar página' })).toBeTruthy()
  })

  it('un fallo durante el render usa la tarjeta de error y oculta detalles técnicos', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    function BrokenPage(): never { throw new Error('Failed to fetch sensitive debug details') }
    try {
      const router = createMemoryRouter([{
        errorElement: appRoutes[0].errorElement,
        children: [{ path: '/fallo', element: <BrokenPage /> }],
      }], { initialEntries: ['/fallo'] })
      render(<RouterProvider router={router} />)
      expect(await screen.findByRole('heading', { level: 1, name: 'Algo salió mal' })).toBeTruthy()
      expect(screen.queryByText(/sensitive debug details/)).toBeNull()
    } finally {
      consoleError.mockRestore()
    }
  })
})
