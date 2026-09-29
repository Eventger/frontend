import { createBrowserRouter } from 'react-router'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'

import { EventsPage } from '@/features/events/pages/EventsPage'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { TodayPage } from '@/features/today/pages/TodayPage'

export const router =
  createBrowserRouter([
    {
      path: '/',
      element: (
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      ),
    },

    {
      path: '/crear-cuenta',
      element: (
        <PublicOnlyRoute>
          <SignUpPage />
        </PublicOnlyRoute>
      ),
    },

    {
      path: '/hoy',
      element: (
        <ProtectedRoute>
          <TodayPage />
        </ProtectedRoute>
      ),
    },

    {
      path: '/eventos',
      element: (
        <ProtectedRoute>
          <EventsPage />
        </ProtectedRoute>
      ),
    },

    {
      path: '/crear',
      element: (
        <ProtectedRoute>
          <CreateEventPage />
        </ProtectedRoute>
      ),
    },

    {
      path: '/evento/:id',
      element: (
        <ProtectedRoute>
          <EventDetailPage />
        </ProtectedRoute>
      ),
    },
  ])