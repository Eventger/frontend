/* oxlint-disable react/only-export-components -- Fixture aislada para Playwright. */
import type { ReactNode } from 'react'

export function ClerkProvider({
  children,
}: {
  children: ReactNode
}) {
  return children
}

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    getToken: async () => 'visual-audit-token',
  }
}

export function useClerk() {
  return {
    openUserProfile: () => undefined,
    signOut: async () => undefined,
  }
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      firstName: 'Mateo',
      lastName: 'Noguera',
      fullName: 'Mateo Noguera',
      primaryEmailAddress: {
        emailAddress: 'mateo@eventger.test',
      },
    },
  }
}

export function useSignIn() {
  return {
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
      password: async () => ({ error: null }),
      finalize: async () => ({ error: null }),
      sso: async () => ({ error: null }),
      create: async () => ({ error: null }),
      verifications: {
        sendEmailCode: async () => ({ error: null }),
        verifyEmailCode: async () => ({ error: null }),
      },
    },
  }
}

export function useSignUp() {
  return {
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
      password: async () => ({ error: null }),
      sso: async () => ({ error: null }),
      verifications: {
        sendEmailCode: async () => ({ error: null }),
        verifyEmailCode: async () => ({ error: null }),
      },
    },
  }
}
