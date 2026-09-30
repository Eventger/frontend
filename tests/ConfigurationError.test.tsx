import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import { ConfigurationError } from '@/components/ConfigurationError'

test('explica la configuración faltante en lugar de dejar la página en blanco', () => {
  render(
    <ConfigurationError
      missingVariables={[
        'VITE_API_URL',
        'VITE_CLERK_PUBLISHABLE_KEY',
      ]}
    />,
  )

  expect(
    screen.getByRole('heading', {
      name: 'Falta configurar el entorno local',
    }),
  ).toBeTruthy()
  expect(
    screen.getByText('VITE_API_URL'),
  ).toBeTruthy()
  expect(
    screen.getByText(
      'VITE_CLERK_PUBLISHABLE_KEY',
    ),
  ).toBeTruthy()
})
