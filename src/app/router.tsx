import { createBrowserRouter, type RouteObject } from 'react-router'
import { RouteErrorPage } from '@/components/RouteErrorPage'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import { EventsPage } from '@/features/events/pages/EventsPage'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { TodayPage } from '@/features/today/pages/TodayPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { SecurityPage } from '@/features/settings/pages/SecurityPage'

export const appRoutes: RouteObject[] = [{
  errorElement: <RouteErrorPage />,
  children: [
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
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/configuracion',
          element: <SettingsPage />,
        },
        {
          path: '/configuracion/seguridad',
          element: <SecurityPage />,
        },
        {
          path: '/hoy',
          element: <TodayPage />,
        },
        {
          path: '/eventos',
          element: <EventsPage />,
        },
        {
          path: '/crear',
          element: <CreateEventPage />,
        },
        {
          path: '/evento/:id',
          element: <EventDetailPage />,
        },
      ],
    },
    {
      path: '*',
      element: <RouteErrorPage notFound />,
    },
  ],
}]

export const router = createBrowserRouter(appRoutes)
