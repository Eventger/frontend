import { render, screen } from '@testing-library/react'
import { useAuth } from '@clerk/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'

const getToken = vi.fn()

function setAuthState(
  isLoaded: boolean,
  isSignedIn: boolean,
) {
  vi.mocked(useAuth).mockReturnValue({
    isLoaded,
    isSignedIn,
    getToken,
  } as never)
}

function LocationProbe() {
  const location = useLocation()

  return (
    <output data-testid="location">
      {JSON.stringify({
        pathname: location.pathname,
        state: location.state,
      })}
    </output>
  )
}

describe('rutas de autenticación', () => {
  beforeEach(() => {
    getToken.mockReset()
  })

  it('muestra un estado accesible mientras Clerk carga', () => {
    setAuthState(false, false)

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <h1>Contenido privado</h1>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(
      screen.getByText(
        'Verificando tu sesión…',
      ),
    ).toBeTruthy()
    expect(
      screen.queryByRole('heading', {
        name: 'Contenido privado',
      }),
    ).toBeNull()
  })

  it('redirige al login y conserva la ruta privada solicitada', async () => {
    setAuthState(true, false)

    render(
      <MemoryRouter
        initialEntries={['/eventos']}
      >
        <Routes>
          <Route
            path="/eventos"
            element={(
              <ProtectedRoute>
                <h1>Eventos</h1>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/"
            element={<LocationProbe />}
          />
        </Routes>
      </MemoryRouter>,
    )

    const location = JSON.parse(
      await screen.findByTestId('location')
        .then((node) => node.textContent ?? ''),
    )
    expect(location).toEqual({
      pathname: '/',
      state: { from: '/eventos' },
    })
  })

  it('evita que una sesión activa vuelva a la pantalla pública', async () => {
    setAuthState(true, true)

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={(
              <PublicOnlyRoute>
                <h1>Iniciar sesión</h1>
              </PublicOnlyRoute>
            )}
          />
          <Route
            path="/hoy"
            element={<LocationProbe />}
          />
        </Routes>
      </MemoryRouter>,
    )

    const location =
      await screen.findByTestId('location')
    expect(location.textContent).toContain(
      '"pathname":"/hoy"',
    )
  })

  it('muestra carga y luego permite la ruta pública sin sesión', () => {
    setAuthState(false, false)
    const { rerender } = render(
      <MemoryRouter>
        <PublicOnlyRoute>
          <h1>Iniciar sesión</h1>
        </PublicOnlyRoute>
      </MemoryRouter>,
    )
    expect(
      screen.getByText(
        'Verificando tu sesión…',
      ),
    ).toBeTruthy()

    setAuthState(true, false)
    rerender(
      <MemoryRouter>
        <PublicOnlyRoute>
          <h1>Iniciar sesión</h1>
        </PublicOnlyRoute>
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', {
        name: 'Iniciar sesión',
      }),
    ).toBeTruthy()
  })

  it.each([
    ['/eventos?estado=pendiente#tareas', '/eventos'],
    ['//otro.example', '/hoy'],
    ['/\\otro.example', '/hoy'],
  ])('una sesión activada respeta un destino local seguro: %s', async (from, destination) => {
    setAuthState(true, true)
    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: { from } }]}>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><h1>Acceso</h1></PublicOnlyRoute>} />
          <Route path={destination} element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )
    expect((await screen.findByTestId('location')).textContent).toContain(`"pathname":"${destination}"`)
  })
})
