import { act, renderHook, waitFor } from '@testing-library/react'
import { useUser } from '@clerk/react'
import { describe, expect, it, vi } from 'vitest'
import { usePlanningPreferences } from '@/features/settings/hooks/usePlanningPreferences'
import { settingsUserFixture } from './settings.fixtures'

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
})
