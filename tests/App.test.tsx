import { render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../src/App'

test('muestra el arranque de Eventger dentro del contenido principal', () => {
  render(<App />)
  const main = screen.getByRole('main')
  expect(within(main).getByRole('heading', { level: 1, name: 'Eventger' })).toBeTruthy()
  expect(within(main).getByText('Frontend en construcción')).toBeTruthy()
})
