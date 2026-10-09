export function getAuthDestination(state: unknown): string {
  const from = state && typeof state === 'object' && 'from' in state
    ? state.from
    : undefined

  const isPublicAuthRoute =
    from === '/' ||
    from === '/crear-cuenta' ||
    (typeof from === 'string' && from.startsWith('/crear-cuenta'))

  return typeof from === 'string' && from.startsWith('/') &&
    !from.startsWith('//') && !/[\\\r\n]/.test(from) && !isPublicAuthRoute
    ? from
    : '/hoy'
}
