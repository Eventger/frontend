import type { Event } from '@/features/events/types/event.types'
import type {
  CreateSubtaskInput,
  Subtask,
  SubtaskApiData,
} from '@/features/events/types/subtask.types'

export const eventFixture: Event = {
  id: 21,
  name: 'Boda Backend',
  typeId: 0,
  eventDate: '2026-10-24T00:00:00.000Z',
  location: 'Cali',
}

export const createSubtaskInputFixture: CreateSubtaskInput = {
  name: 'Coordinar transporte',
  targetDate: '2026-10-20',
  estimatedHours: 2.5,
  details: 'Confirmar disponibilidad.',
}

export const subtaskFixture: Subtask = {
  id: 31,
  eventId: eventFixture.id,
  state: 'pending',
  ...createSubtaskInputFixture,
}

export const subtaskApiFixture: SubtaskApiData = {
  id: subtaskFixture.id,
  event: eventFixture.id,
  state: 'pending',
  name: subtaskFixture.name,
  target_date: '2026-10-20T23:59:59.000Z',
  estimated_hours: '2.50',
  details: subtaskFixture.details,
  created_at: '2026-09-24T12:00:00.000Z',
  updated_at: '2026-09-24T12:00:00.000Z',
}
