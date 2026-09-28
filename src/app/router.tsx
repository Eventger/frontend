import { createBrowserRouter } from 'react-router'

import { EventsPage } from '@/features/events/pages/EventsPage'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { TodayPage } from '@/features/today/pages/TodayPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login-error',
    element: <LoginPage showErrors />,
  },
  {
    path: '/crear-cuenta',
    element: <SignUpPage />,
  },
  {
    path: '/crear-cuenta-validacion',
    element: <SignUpPage showErrors />,
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
  {
    path: '/hoy',
    element: <TodayPage />,
  },
])