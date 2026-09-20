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

test('el entrypoint monta la aplicación en el root del HTML real', async () => {
  document.body.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML
  try {
    await act(async () => { await import('../src/main') })
    expect(screen.getByRole('heading', { name: 'Eventger' })).toBeTruthy()
  } finally {
    await act(async () => { mountedRoot?.unmount() })
    document.body.innerHTML = ''
  }
})
