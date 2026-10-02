import type { CreateEventInput, Event } from '@/features/events/types/event.types'
import type { CreateSubtaskInput } from '@/features/events/types/subtask.types'

export type CreateEventDraft = {
  data: CreateEventInput
  subtasks: CreateSubtaskInput[]
  createdEvent?: Event
}

const key = (userId: string) => `eventger:create-event-draft:${userId}`
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object'

function isEventInput(value: unknown): value is CreateEventInput {
  return isRecord(value) && ['name', 'eventDate', 'location', 'contact'].every(field => typeof value[field] === 'string') &&
    (value.typeId === null || (typeof value.typeId === 'number' && Number.isInteger(value.typeId)))
}

function isSubtaskInput(value: unknown): value is CreateSubtaskInput {
  return isRecord(value) && ['name', 'targetDate', 'details'].every(field => typeof value[field] === 'string') &&
    typeof value.estimatedHours === 'number' && Number.isFinite(value.estimatedHours) && value.estimatedHours > 0
}

export function readCreateEventDraft(userId: string): CreateEventDraft | undefined {
  try {
    const stored = sessionStorage.getItem(key(userId))
    if (!stored) return undefined
    const value: unknown = JSON.parse(stored)
    if (isRecord(value) && value.version === 1 && isEventInput(value.data) &&
      Array.isArray(value.subtasks) && value.subtasks.every(isSubtaskInput) &&
      (value.createdEvent === undefined || (isEventInput(value.createdEvent) &&
        value.createdEvent.typeId !== null &&
        'id' in value.createdEvent && typeof value.createdEvent.id === 'number' &&
        Number.isInteger(value.createdEvent.id) && value.createdEvent.id > 0))) {
      return value as CreateEventDraft
    }
    clearCreateEventDraft(userId)
  } catch {
    clearCreateEventDraft(userId)
  }
}

export function saveCreateEventDraft(userId: string, draft: CreateEventDraft) {
  try { sessionStorage.setItem(key(userId), JSON.stringify({ version: 1, ...draft })) } catch { /* El formulario sigue disponible si el almacenamiento no lo está. */ }
}

export function clearCreateEventDraft(userId: string) {
  try { sessionStorage.removeItem(key(userId)) } catch { /* No bloquear la navegación si el almacenamiento no está disponible. */ }
}
