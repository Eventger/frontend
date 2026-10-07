import { ApiError, apiRequest } from '@/lib/api'

type ReverificationHint = {
  clerk_error: {
    type: 'forbidden'
    reason: 'reverification-error'
    metadata: { reverification: 'strict' }
  }
}

function isReverificationHint(value: unknown): value is ReverificationHint {
  if (typeof value !== 'object' || value === null || !('clerk_error' in value)) return false
  const error = value.clerk_error
  return typeof error === 'object' && error !== null &&
    'type' in error && error.type === 'forbidden' &&
    'reason' in error && error.reason === 'reverification-error' &&
    'metadata' in error && typeof error.metadata === 'object' && error.metadata !== null &&
    'reverification' in error.metadata && error.metadata.reverification === 'strict'
}

export async function deleteOwnAccount(confirmation: string, request: typeof apiRequest): Promise<{ deleted: true } | ReverificationHint> {
  try {
    const response = await request<unknown>('/api/auth/me/', {
      method: 'DELETE', headers: { 'X-Account-Deletion-Confirmation': confirmation }, expectedStatus: 204,
    })
    // El backend confirma ambas eliminaciones con 204, sin cuerpo.
    if (response !== null) throw new Error('La eliminación no se pudo confirmar.')
    return { deleted: true }
  } catch (error) {
    // Clerk necesita recibir el hint como resultado para abrir la reverificación.
    if (error instanceof ApiError && error.status === 403 && isReverificationHint(error.body)) return error.body
    throw error
  }
}
