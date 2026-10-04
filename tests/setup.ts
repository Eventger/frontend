import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.stubEnv(
  'VITE_API_URL',
  'https://api.eventger.test',
)
vi.stubEnv(
  'VITE_CLERK_PUBLISHABLE_KEY',
  'pk_test_eventger',
)

const clerkMocks = vi.hoisted(() => ({
  getToken: vi
    .fn()
    .mockResolvedValue('test-token'),
  openUserProfile: vi.fn(),
  signOut: vi
    .fn()
    .mockResolvedValue(undefined),
}))

vi.mock('@clerk/react', () => ({
  ClerkProvider: ({
    children,
  }: {
    children: ReactNode
  }) => children,
  useAuth: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user-test',
    getToken: clerkMocks.getToken,
  })),
  useClerk: vi.fn(() => ({
    openUserProfile:
      clerkMocks.openUserProfile,
    signOut: clerkMocks.signOut,
  })),
  useUser: vi.fn(() => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user-test',
      firstName: 'Usuario',
      lastName: 'Prueba',
      fullName: 'Usuario Prueba',
      primaryEmailAddress: {
        emailAddress:
          'usuario@eventger.test',
      },
      unsafeMetadata: {},
      externalAccounts: [],
      emailAddresses: [],
    },
  })),
  useSession: vi.fn(() => ({ isLoaded: true, isSignedIn: true, session: { id: 'session-current' } })),
  useReverification: vi.fn((fetcher: (...args: never[]) => Promise<unknown>) => fetcher),
  useSignIn: vi.fn(() => ({
    fetchStatus: 'idle',
    errors: {
      fields: {
        identifier: null,
        password: null,
        code: null,
      },
    },
    signIn: {
      status: 'needs_identifier',
      password: vi.fn(),
      finalize: vi.fn(),
      sso: vi.fn(),
    },
  })),
  useSignUp: vi.fn(() => ({
    fetchStatus: 'idle',
    errors: {
      fields: {
        firstName: null,
        lastName: null,
        emailAddress: null,
        password: null,
        code: null,
      },
    },
    signUp: {
      status: 'missing_requirements',
      password: vi.fn(),
      sso: vi.fn(),
      verifications: {
        sendEmailCode: vi.fn(),
        verifyEmailCode: vi.fn(),
      },
    },
  })),
}))

Object.defineProperties(Element.prototype, {
  hasPointerCapture: {
    value: () => false,
  },
  releasePointerCapture: {
    value: () => undefined,
  },
  setPointerCapture: {
    value: () => undefined,
  },
  scrollIntoView: {
    value: () => undefined,
  },
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// Un test de componente no debe consultar servicios reales por accidente.
// Los futuros tests HTTP deben sustituir fetch por respuestas sintéticas.
beforeEach(() => {
  vi.stubGlobal(
    'scrollTo',
    vi.fn(),
  )

  vi.stubGlobal('fetch', () => {
    throw new Error('Red no permitida en pruebas: utiliza respuestas HTTP simuladas.')
  })

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})
