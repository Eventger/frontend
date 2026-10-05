import { vi } from 'vitest'
import type { EmailAddressResource, SessionWithActivitiesResource, UserResource } from '@clerk/react/types'

export function emailFixture(id = 'email-primary', emailAddress = 'juan@eventger.test', status = 'verified') {
  const email = {
    id, emailAddress, verification: { status },
    prepareVerification: vi.fn(), attemptVerification: vi.fn(),
  }
  email.prepareVerification.mockResolvedValue(email)
  email.attemptVerification.mockImplementation(async () => { email.verification.status = 'verified'; return email })
  return { email, resource: email as unknown as EmailAddressResource }
}

export function sessionFixture(id: string, isMobile = false) {
  const session = {
    id, status: 'active', lastActiveAt: new Date('2026-10-02T14:00:00Z'),
    latestActivity: { deviceType: isMobile ? 'Android' : 'X11', browserName: 'Chrome', browserVersion: '153', city: 'Cali', country: 'Colombia', ipAddress: '192.0.2.1', isMobile },
    revoke: vi.fn(),
  }
  session.revoke.mockResolvedValue({ ...session, status: 'revoked' })
  return { session, resource: session as unknown as SessionWithActivitiesResource }
}

export function settingsUserFixture() {
  const primary = emailFixture()
  const current = sessionFixture('session-current')
  const other = sessionFixture('session-other', true)
  const added = emailFixture('email-added', 'nuevo@eventger.test', 'unverified')
  const user = {
    id: 'user-settings', firstName: 'Juan Carlos', lastName: 'Cruz', fullName: 'Juan Carlos Cruz',
    hasImage: false, imageUrl: '', passwordEnabled: false, deleteSelfEnabled: true,
    primaryEmailAddressId: primary.email.id, primaryEmailAddress: primary.resource,
    emailAddresses: [primary.resource],
    externalAccounts: [{ id: 'google-1', provider: 'google', emailAddress: 'juan@eventger.test' }],
    unsafeMetadata: { otherApp: { theme: 'dark' }, eventger: { dailyLimitHours: 6, calendar: 'week' } },
    update: vi.fn(), updateMetadata: vi.fn(), updatePassword: vi.fn(), delete: vi.fn(),
    getSessions: vi.fn().mockResolvedValue([current.resource, other.resource]),
    createEmailAddress: vi.fn().mockImplementation(async () => { user.emailAddresses.push(added.resource); return added.resource }),
  }
  user.update.mockImplementation(async (params) => { Object.assign(user, params); return user })
  user.updateMetadata.mockImplementation(async (params) => {
    user.unsafeMetadata.eventger = { ...user.unsafeMetadata.eventger, ...params.unsafeMetadata.eventger }
    return user
  })
  user.updatePassword.mockResolvedValue(user)
  user.delete.mockResolvedValue(undefined)
  return { user, resource: user as unknown as UserResource, primary, added, current, other }
}
