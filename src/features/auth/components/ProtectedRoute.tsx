import type {
  ReactNode,
} from 'react'

import {
  Navigate,
} from 'react-router'

import {
  useAuth,
} from '@clerk/react'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    isLoaded,
    isSignedIn,
  } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (!isSignedIn) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}