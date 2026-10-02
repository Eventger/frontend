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
import { getAuthDestination } from '@/features/auth/utils/getAuthDestination'

type PublicOnlyRouteProps = {
  children: ReactNode
}

export function PublicOnlyRoute({
  children,
}: PublicOnlyRouteProps) {
  const location = useLocation()
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
        to={getAuthDestination(location.state)}
        replace
      />
    )
  }

  return children
}
