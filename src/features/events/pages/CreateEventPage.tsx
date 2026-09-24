import { useState } from 'react'
import { useNavigate } from 'react-router'

import { AppLayout } from '@/components/layout/AppLayout'
import { CreateEventError } from '@/features/events/components/CreateEventError'
import { CreateEventSuccess } from '@/features/events/components/CreateEventSuccess'
import { EventForm } from '@/features/events/components/EventForm'
import { createEvent } from '@/features/events/services/event.service'
import type {
  CreateEventInput,
  Event,
} from '@/features/events/types/event.types'

type CreateEventView =
  | 'form'
  | 'success'
  | 'error'

export function CreateEventPage() {
  const navigate = useNavigate()

  const [view, setView] =
    useState<CreateEventView>('form')

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [submittedData, setSubmittedData] =
    useState<CreateEventInput>()

  const [createdEvent, setCreatedEvent] =
    useState<Event>()

  const handleSubmit = async (
    data: CreateEventInput,
  ) => {
    setSubmittedData(data)
    setIsSubmitting(true)

    try {
      const event = await createEvent(data)

      setCreatedEvent(event)
      setView('success')
    } catch {
      setView('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 md:px-8 md:py-12">
        {view === 'form' && (
          <>
            <header>
              <h1 className="text-2xl font-bold text-[#17212b] md:text-[30px]">
                Crear evento
              </h1>

              <p className="mt-2 text-sm text-[#667085] md:text-[15px]">
                Completa la información básica de tu evento.
              </p>
            </header>

            <div className="mt-8 max-w-[820px]">
              <EventForm
                initialValues={submittedData}
                onSubmit={handleSubmit}
                onCancel={() =>
                  navigate('/eventos')
                }
                isSubmitting={isSubmitting}
              />
            </div>
          </>
        )}

        {view === 'success' && createdEvent && (
          <CreateEventSuccess
            event={createdEvent}
          />
        )}

        {view === 'error' && submittedData && (
          <CreateEventError
            eventName={submittedData.name}
            onReview={() => setView('form')}
          />
        )}
      </div>
    </AppLayout>
  )
}