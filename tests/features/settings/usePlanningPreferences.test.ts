import { act, renderHook, waitFor } from '@testing-library/react'
import { useUser } from '@clerk/react'
import { describe, expect, it, vi } from 'vitest'
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'
import { settingsUserFixture } from './settings.fixtures'
import { buildTodayApiTask } from '../today/today.fixtures'
import { DailyLimitConflictError } from '@/features/settings/utils/preferences'
import { deferred } from '../../deferred'

function response(limit: string, configured: boolean) {
  return new Response(JSON.stringify({ success: true, data: { daily_limit_hours: limit, daily_limit_configured: configured } }), { headers: { 'Content-Type': 'application/json' } })
}

describe('preferencias de planificación por API', () => {
  it('consulta, importa una preferencia anterior válida y guarda mediante la sesión', async () => {
    const fixture = settingsUserFixture(); fixture.user.unsafeMetadata.eventger.dailyLimitHours = 4.5
    vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: true, user: fixture.resource })
    const fetch = vi.fn().mockResolvedValueOnce(response('6', false)).mockResolvedValueOnce(response('4.5', true)).mockResolvedValueOnce(response('8', true))
    vi.stubGlobal('fetch', fetch)
    const { result } = renderHook(() => usePlanningPreferences())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.dailyLimitHours).toBe(4.5)
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ daily_limit_hours: '4.50', only_if_unconfigured: true })
    expect(new Headers(fetch.mock.calls[1][1].headers).get('Authorization')).toBe('Bearer test-token')
    await act(() => result.current.save(8))
    expect(result.current.dailyLimitHours).toBe(8)
    expect(fixture.user.updateMetadata).not.toHaveBeenCalled()
  })

  it('respeta un límite guardado en BD aunque Clerk tenga una preferencia distinta', async () => {
    const fixture = settingsUserFixture(); fixture.user.unsafeMetadata.eventger.dailyLimitHours = 8
    vi.mocked(useUser).mockReturnValue({ isLoaded: true, isSignedIn: true, user: fixture.resource })
    const fetch = vi.fn().mockResolvedValue(response('4', true)); vi.stubGlobal('fetch', fetch)
    const { result } = renderHook(() => usePlanningPreferences())
    await waitFor(() => expect(result.current.dailyLimitHours).toBe(4))
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('comunica un error de carga sin presentar el valor predeterminado como confirmado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    const { result } = renderHook(() => usePlanningPreferences())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toContain('No pudimos cargar tu límite diario')
  })

  it('consulta la carga con la sesión, rechaza el conflicto sin PUT y permite el límite exacto', async () => {
    const tasks = new Response(JSON.stringify({ success: true, data: {
      overdue: [], today: [], completed: [buildTodayApiTask({ state: 'completed', estimated_hours: '9.00' })],
      upcoming: [
        buildTodayApiTask({ estimated_hours: '0.75' }),
        buildTodayApiTask({ id: 32, event: 22, state: 'in_progress', estimated_hours: '1.25' }),
      ],
    } }), { headers: { 'Content-Type': 'application/json' } })
    const fetch = vi.fn().mockResolvedValueOnce(response('6', true))
      .mockResolvedValueOnce(tasks.clone()).mockResolvedValueOnce(tasks.clone()).mockResolvedValueOnce(response('2', true))
    vi.stubGlobal('fetch', fetch)
    const { result } = renderHook(() => usePlanningPreferences())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { await expect(result.current.save(1)).rejects.toBeInstanceOf(DailyLimitConflictError) })
    expect(result.current.dailyLimitHours).toBe(6)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][0]).toBe('https://api.eventger.test/hoy/')
    expect(new Headers(fetch.mock.calls[1][1].headers).get('Authorization')).toBe('Bearer test-token')
    await act(() => result.current.save(2))
    expect(result.current.dailyLimitHours).toBe(2)
    expect(fetch.mock.calls[3][0]).toBe('https://api.eventger.test/api/auth/preferences/')
    expect(JSON.parse(fetch.mock.calls[3][1].body)).toEqual({ daily_limit_hours: '2.00' })
  })

  it('no escribe una reducción si la consulta de carga termina después de desmontar', async () => {
    const pending = deferred<Response>()
    const fetch = vi.fn().mockResolvedValueOnce(response('6', true)).mockReturnValueOnce(pending.promise)
    vi.stubGlobal('fetch', fetch)
    const { result, unmount } = renderHook(() => usePlanningPreferences())
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const saving = result.current.save(1)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    unmount()
    pending.resolve(new Response(JSON.stringify({ success: true, data: { overdue: [], today: [], upcoming: [], completed: [] } })))
    await saving
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
