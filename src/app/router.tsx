import { createBrowserRouter, Navigate } from 'react-router'

import { EventsPage } from '@/features/events/pages/EventsPage'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'
import { TodayPage } from '@/features/today/pages/TodayPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/eventos" replace />,
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
  }
])
