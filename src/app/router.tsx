import { createBrowserRouter, Navigate } from 'react-router'

import { EventsPage } from '@/features/events/pages/EventsPage'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'

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
])
