import { useCallback, useEffect, useRef, useState } from 'react'
import type { SessionWithActivitiesResource, UserResource } from '@clerk/react/types'

// getSessions() caches its snapshot on the User resource. Keep confirmed
// revocations with that same resource so returning to this route cannot restore them.
const revokedSessions = new WeakMap<UserResource, Set<string>>()

export function useAccountSessions(user: UserResource, currentSessionId: string | undefined) {
  const [sessions, setSessions] = useState<SessionWithActivitiesResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [needsPageReload, setNeedsPageReload] = useState(false)
  const version = useRef(0)

  const load = useCallback(async () => {
    const requestVersion = ++version.current
    setLoading(true)
    setError('')
    setNeedsPageReload(false)
    try {
      const result = await user.getSessions()
      if (requestVersion !== version.current) return
      // Some Clerk JS versions convert a failed session request into a cached [].
      // A signed-in account's current session must not be presented as an empty list.
      if (currentSessionId && result.length === 0) {
        setNeedsPageReload(true)
        throw new Error('Current session missing from Clerk response')
      }
      const revoked = revokedSessions.get(user)
      setSessions(result.filter((session) => session.status === 'active' && !revoked?.has(session.id)))
    } catch {
      if (requestVersion === version.current) setError('No pudimos cargar tus dispositivos activos. Inténtalo de nuevo.')
    } finally {
      if (requestVersion === version.current) setLoading(false)
    }
  }, [user, currentSessionId])

  useEffect(() => {
    let active = true
    const requests = version
    void Promise.resolve().then(() => { if (active) void load() })
    return () => { active = false; requests.current++ }
  }, [load])

  async function revokeSession(id: string) {
    // Do not let a missing current-session identity enable a destructive action.
    if (!currentSessionId || id === currentSessionId || revokingId || loading) return
    const target = sessions.find((session) => session.id === id)
    if (!target) return
    const requestVersion = version.current
    setRevokingId(id)
    setError('')
    setNotice('')
    try {
      await target.revoke()
      if (requestVersion === version.current) {
        const revoked = revokedSessions.get(user) ?? new Set<string>()
        revoked.add(id)
        revokedSessions.set(user, revoked)
        setSessions((previous) => previous.filter((session) => session.id !== id))
        setNotice('La sesión se cerró correctamente.')
      }
    } catch {
      if (requestVersion === version.current) setError('No pudimos cerrar esa sesión. Inténtalo de nuevo.')
    } finally {
      if (requestVersion === version.current) setRevokingId(null)
    }
  }

  function confirmOtherSessionsClosed() {
    if (!currentSessionId || !sessions.some((session) => session.id === currentSessionId)) return
    const revoked = revokedSessions.get(user) ?? new Set<string>()
    sessions.forEach((session) => { if (session.id !== currentSessionId) revoked.add(session.id) })
    revokedSessions.set(user, revoked)
    setSessions((previous) => previous.filter((session) => session.id === currentSessionId))
    setError('')
    setNotice('')
  }

  return { sessions, loading, error, revokingId, notice, needsPageReload, reload: load, revokeSession, confirmOtherSessionsClosed }
}
