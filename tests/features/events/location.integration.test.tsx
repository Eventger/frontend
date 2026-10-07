import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateEventPage } from '@/features/events/pages/CreateEventPage'
import { EditEventForm } from '@/features/events/components/edit/EditEventForm'
import { useAuthenticatedApi } from '@/features/auth/hooks/useAuthenticatedApi'
import { updateEvent } from '@/features/events/services/event.service'
import { addressApiFixture, addressFixture } from './address.fixtures'
import { eventFixture } from './subtask.fixtures'

function EditPage() {
  const { authenticatedRequest } = useAuthenticatedApi()
  return <EditEventForm event={eventFixture} eventTypes={[{ id: eventFixture.typeId, name: 'Boda', description: '' }]}
    isSubmitting={false} onCancel={vi.fn()} onSubmit={async data => { await updateEvent(eventFixture.id, data, authenticatedRequest) }} />
}

describe('selección y persistencia de la dirección del evento', () => {
  beforeEach(() => { sessionStorage.clear() })

  for (const mode of ['crear', 'editar'] as const) {
    it(`${mode} guarda la dirección seleccionada en location como texto mediante la API autenticada`, async () => {
      const writes: Record<string, unknown>[] = []
      vi.stubGlobal('fetch', vi.fn(async (input: string | URL, options?: RequestInit) => {
        const url = new URL(input)
        let body: unknown
        if (url.origin === 'https://photon.komoot.io') {
          expect(new Headers(options?.headers).has('Authorization')).toBe(false)
          body = addressApiFixture
        } else if (url.pathname === '/event-types/') {
          body = { success: true, data: [{ id: eventFixture.typeId, name: 'Boda', description: '' }] }
        } else {
          expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer test-token')
          const data = JSON.parse(String(options?.body))
          writes.push(data)
          body = { success: true, message: 'Evento guardado', data: { id: eventFixture.id, ...data } }
        }
        return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } })
      }))
      render(<MemoryRouter>{mode === 'crear' ? <CreateEventPage /> : <EditPage />}</MemoryRouter>)
      const user = userEvent.setup()
      if (mode === 'crear') {
        fireEvent.change(screen.getByLabelText('Nombre del evento *'), { target: { value: 'Evento con dirección' } })
        const type = screen.getByRole('combobox', { name: 'Tipo de evento *' })
        await waitFor(() => expect((type as HTMLButtonElement).disabled).toBe(false))
        await user.click(type)
        await user.click(await screen.findByRole('option', { name: 'Boda' }))
        const date = screen.getByLabelText('Fecha del evento *')
        fireEvent.change(date, { target: { value: '2099-12-31' } })
        fireEvent.change(screen.getByLabelText('Contacto *'), { target: { value: 'Laura' } })
      }
      const input = screen.getByRole('combobox', { name: 'Lugar *' })
      await user.clear(input)
      fireEvent.change(input, { target: { value: 'Chipichape Cali' } })
      await user.click(await screen.findByRole('option', { name: /Centro Comercial Chipichape/ }))
      await user.click(screen.getByRole('button', { name: mode === 'crear' ? 'Crear evento' : 'Guardar cambios' }))
      await waitFor(() => expect(writes).toHaveLength(1))
      expect(writes[0].location).toBe(addressFixture.address)
      expect(typeof writes[0].location).toBe('string')
      expect(writes[0]).not.toHaveProperty('latitude')
      expect(writes[0]).not.toHaveProperty('longitude')
    })
  }
})
