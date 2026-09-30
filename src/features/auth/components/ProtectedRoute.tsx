import type {
  ReactNode,
} from 'react'

import {
  Navigate,
  useLocation,
} from 'react-router'

import {
  useAuth,
} from '@clerk/react'

import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation()

  const {
    isLoaded,
    isSignedIn,
  } = useAuth()

  if (!isLoaded) {
    return <AuthLoadingState />
  }

  if (!isSignedIn) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    )
  }

  return children
}
