export function getAuthDestination(state: unknown): string {
  const from = state && typeof state === 'object' && 'from' in state
    ? state.from
    : undefined

  return typeof from === 'string' && from.startsWith('/') &&
    !from.startsWith('//') && !/[\\\r\n]/.test(from)
    ? from
    : '/hoy'
}
