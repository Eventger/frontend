import type {
  ReactNode,
} from 'react'

import {
  Navigate,
} from 'react-router'

import {
  useAuth,
} from '@clerk/react'

import { AuthLoadingState } from '@/features/auth/components/AuthLoadingState'

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
    return <AuthLoadingState />
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
