import type {
  ReactNode,
} from 'react'

import {
  Navigate,
} from 'react-router'

import {
  useAuth,
} from '@clerk/react'

type PublicOnlyRouteProps = {
  children: ReactNode
}

export function PublicOnlyRoute({
  children,
}: PublicOnlyRouteProps) {
  const {
    isLoaded,
    isSignedIn,
  } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return (
      <Navigate
        to="/hoy"
        replace
      />
    )
  }

  return children
}