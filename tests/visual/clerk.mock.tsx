/* oxlint-disable react/only-export-components -- Fixture aislada para Playwright. */
import type { ReactNode } from 'react'

export function ClerkProvider({
  children,
}: {
  children: ReactNode
}) {
  return children
}

const getVisualToken = async () => 'visual-audit-token'

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: 'visual-user',
    getToken: getVisualToken,
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
    user: visualUser,
  }
}

const primaryEmail = {
  id: 'visual-email', emailAddress: 'mateo@eventger.test', verification: { status: 'verified' },
}
const visualSessions = [
  { id: 'visual-current', status: 'active', lastActiveAt: new Date('2026-10-02T19:10:00Z'), latestActivity: { deviceType: 'X11', browserName: 'Chrome', browserVersion: '153.0.0.0', ipAddress: '192.0.2.1', city: 'Cali', country: 'Colombia' } },
  { id: 'visual-other', status: 'active', lastActiveAt: new Date('2026-10-02T15:56:00Z'), latestActivity: { deviceType: 'X11', browserName: 'Chrome', browserVersion: '153.0.0.0', ipAddress: '192.0.2.1', city: 'Cali', country: 'Colombia' } },
].map((session) => ({ ...session, revoke: async () => ({ ...session, status: 'revoked' }) }))
const visualUser = {
  id: 'visual-user', firstName: 'Mateo', lastName: 'Noguera', fullName: 'Mateo Noguera',
  primaryEmailAddress: primaryEmail, primaryEmailAddressId: primaryEmail.id, emailAddresses: [primaryEmail],
  externalAccounts: [{ id: 'visual-google', provider: 'google', emailAddress: primaryEmail.emailAddress }],
  unsafeMetadata: { eventger: { dailyLimitHours: 6 } }, passwordEnabled: false, deleteSelfEnabled: true,
  getSessions: async () => visualSessions,
  update: async (params: { firstName?: string; lastName?: string }) => {
    Object.assign(visualUser, params)
    visualUser.fullName = `${visualUser.firstName} ${visualUser.lastName}`
    return visualUser
  },
  updateMetadata: async (params: { unsafeMetadata: { eventger: { dailyLimitHours: number } } }) => {
    visualUser.unsafeMetadata.eventger.dailyLimitHours = params.unsafeMetadata.eventger.dailyLimitHours
    return visualUser
  },
  updatePassword: async () => visualUser,
  delete: async () => undefined,
}

export function useSession() {
  return { isLoaded: true, isSignedIn: true, session: { id: 'visual-current' } }
}

export function useReverification<T>(fetcher: T) {
  return fetcher
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
