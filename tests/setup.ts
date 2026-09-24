import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

Object.defineProperties(Element.prototype, {
  hasPointerCapture: {
    value: () => false,
  },
  releasePointerCapture: {
    value: () => undefined,
  },
  setPointerCapture: {
    value: () => undefined,
  },
  scrollIntoView: {
    value: () => undefined,
  },
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// Un test de componente no debe consultar servicios reales por accidente.
// Los futuros tests HTTP deben sustituir fetch por respuestas sintéticas.
beforeEach(() => {
  vi.stubGlobal('fetch', () => {
    throw new Error('Red no permitida en pruebas: utiliza respuestas HTTP simuladas.')
  })

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})
