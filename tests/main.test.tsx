import html from '../index.html?raw'
import { act, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import type { Root } from 'react-dom/client'

let mountedRoot: Root | undefined

vi.mock('react-dom/client', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-dom/client')>()
  return {
    ...original,
    createRoot: (...args: Parameters<typeof original.createRoot>) => {
      mountedRoot = original.createRoot(...args)
      return mountedRoot
    },
  }
})

vi.mock('@/features/events/services/event.service', () => ({
  createEvent: vi.fn(),
  getEventById: vi.fn(),
  getEvents: vi.fn(),
  getEventTypes: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))

vi.mock('@/features/events/services/subtasks.service', () => ({
  createSubtask: vi.fn(),
  getEventSubtasks: vi.fn(),
  updateSubtask: vi.fn(),
  deleteSubtask: vi.fn(),
}))

vi.mock('@/features/events/hooks/useEventTypes', () => ({
  useEventTypes: () => ({
    eventTypes: [],
    isLoading: false,
    error: null,
    retry: vi.fn(),
  }),
}))

test('el entrypoint monta la aplicación en el root del HTML real', async () => {
  document.body.innerHTML = new DOMParser()
    .parseFromString(html, 'text/html')
    .body.innerHTML
  window.history.pushState({}, '', '/crear')

  try {
    await act(async () => {
      await import('../src/main')
    })
    expect(
      screen.getByRole('heading', { name: 'Crear evento' }),
    ).toBeTruthy()
  } finally {
    await act(async () => { mountedRoot?.unmount() })
    document.body.innerHTML = ''
  }
})
