import { createBrowserRouter } from 'react-router'

import { EventsPage } from '@/features/events/pages/EventsPage'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { EventDetailPage } from '@/features/events/pages/EventDetailPage'

export const router = createBrowserRouter([
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
])
