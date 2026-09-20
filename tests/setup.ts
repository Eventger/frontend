import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

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
})
