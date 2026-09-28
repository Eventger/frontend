import {
  useState,
  type FormEvent,
} from 'react'

import {
  CalendarDays,
  Clock3,
  GripVertical,
  Info,
  Pencil,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useEventTypes } from '@/features/events/hooks/useEventTypes'

import type {
  CreateEventInput,
} from '@/features/events/types/event.types'

import type {
  CreateSubtaskInput,
} from '@/features/events/types/subtask.types'


type EventFormProps = {
  initialValues?: CreateEventInput
  initialSubtasks?: CreateSubtaskInput[]
  onSubmit: (
    data: CreateEventInput,
    subtasks: CreateSubtaskInput[],
  ) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}


type EventFormErrors = Partial<
  Record<
    keyof CreateEventInput,
    string
  >
>


type SubtaskFormValues = {
  name: string
  targetDate: string
  estimatedHours: string
  details: string
}


type SubtaskFormErrors = Partial<
  Record<
    keyof SubtaskFormValues,
    string
  >
>


const emptyValues: CreateEventInput = {
  name: '',
  typeId: null,
  eventDate: '',
  location: '',
  contact: '',
}


const emptySubtaskValues: SubtaskFormValues = {
  name: '',
  targetDate: '',
  estimatedHours: '',
  details: '',
}


function getLocalDateInputValue() {
  const today = new Date()

  const year = today.getFullYear()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    today.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}


function formatTaskDate(date: string) {
  return new Intl.DateTimeFormat(
    'es-CO',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(
    new Date(`${date}T00:00:00Z`),
  )
}


export function EventForm({
  initialValues = emptyValues,
  initialSubtasks = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: EventFormProps) {
  const minimumEventDate =
    getLocalDateInputValue()

  const {
    eventTypes,
    isLoading:
      isLoadingEventTypes,
    error: eventTypesError,
  } = useEventTypes()


  /*
   * DATOS DEL EVENTO
   */

  const [values, setValues] =
    useState<CreateEventInput>(
      initialValues,
    )

  const [errors, setErrors] =
    useState<EventFormErrors>({})


  /*
   * TAREAS TEMPORALES
   */

  const [subtasks, setSubtasks] =
  useState<CreateSubtaskInput[]>(
    initialSubtasks,
  )

  const [
    isSubtaskFormOpen,
    setIsSubtaskFormOpen,
  ] = useState(true)

  const [
    editingSubtaskIndex,
    setEditingSubtaskIndex,
  ] = useState<number | null>(null)

  const [
    subtaskValues,
    setSubtaskValues,
  ] = useState<SubtaskFormValues>(
    emptySubtaskValues,
  )

  const [
    subtaskErrors,
    setSubtaskErrors,
  ] = useState<SubtaskFormErrors>({})


  /*
   * ACTUALIZAR DATOS DEL EVENTO
   */

  const updateField = <
    K extends keyof CreateEventInput,
  >(
    field: K,
    value: CreateEventInput[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }


  /*
   * ACTUALIZAR FORMULARIO DE TAREA
   */

  const updateSubtaskField = <
    K extends keyof SubtaskFormValues,
  >(
    field: K,
    value: SubtaskFormValues[K],
  ) => {
    setSubtaskValues((current) => ({
      ...current,
      [field]: value,
    }))

    setSubtaskErrors((current) => ({
      ...current,
      [field]: undefined,
    }))
  }


  /*
   * VALIDAR EVENTO
   */

  const validate = () => {
    const nextErrors:
      EventFormErrors = {}

    if (!values.name.trim()) {
      nextErrors.name =
        'Ingresa el nombre del evento.'
    }

    if (values.typeId === null) {
      nextErrors.typeId =
        'Selecciona un tipo de evento.'
    }

    if (!values.eventDate) {
      nextErrors.eventDate =
        'Selecciona una fecha válida.'
    } else if (
      values.eventDate <
      getLocalDateInputValue()
    ) {
      nextErrors.eventDate =
        'La fecha del evento no puede estar en el pasado.'
    }

    if (!values.location.trim()) {
      nextErrors.location =
        'Ingresa el lugar del evento.'
    }

    if (!values.contact.trim()) {
      nextErrors.contact =
        'Ingresa un contacto para el evento.'
    }

    setErrors(nextErrors)

    return (
      Object.keys(nextErrors)
        .length === 0
    )
  }


  /*
   * VALIDAR TAREA
   */

  const validateSubtask = () => {
    const nextErrors:
      SubtaskFormErrors = {}

    if (!subtaskValues.name.trim()) {
      nextErrors.name =
        'Ingresa el nombre de la tarea.'
    }

    if (!subtaskValues.targetDate) {
      nextErrors.targetDate =
        'Selecciona una fecha límite.'
    } else if (
      subtaskValues.targetDate <
      getLocalDateInputValue()
    ) {
      nextErrors.targetDate =
        'La fecha límite no puede estar en el pasado.'
    } else if (
      values.eventDate &&
      subtaskValues.targetDate >
      values.eventDate
    ) {
      nextErrors.targetDate =
        `La fecha límite debe ser anterior al ${formatTaskDate(
          values.eventDate,
        )}.`
    }

    const estimatedHours =
      Number(
        subtaskValues.estimatedHours,
      )

    if (
      !subtaskValues.estimatedHours ||
      Number.isNaN(estimatedHours) ||
      estimatedHours <= 0
    ) {
      nextErrors.estimatedHours =
        'Indica un tiempo estimado válido.'
    }

    setSubtaskErrors(nextErrors)

    return (
      Object.keys(nextErrors)
        .length === 0
    )
  }


  /*
   * AGREGAR / GUARDAR TAREA
   */

  const handleSaveSubtask = () => {
    if (!validateSubtask()) {
      return
    }

    const subtask:
      CreateSubtaskInput = {
      name:
        subtaskValues.name.trim(),

      targetDate:
        subtaskValues.targetDate,

      estimatedHours:
        Number(
          subtaskValues.estimatedHours,
        ),

      details:
        subtaskValues.details.trim(),
    }

    if (
      editingSubtaskIndex !== null
    ) {
      setSubtasks((current) =>
        current.map(
          (
            currentSubtask,
            index,
          ) =>
            index ===
            editingSubtaskIndex
              ? subtask
              : currentSubtask,
        ),
      )
    } else {
      setSubtasks((current) => [
        ...current,
        subtask,
      ])
    }

    setEditingSubtaskIndex(null)

    setSubtaskValues(
      emptySubtaskValues,
    )

    setSubtaskErrors({})

    setIsSubtaskFormOpen(false)
  }


  /*
   * NUEVA TAREA
   */

  const handleNewSubtask = () => {
    setEditingSubtaskIndex(null)

    setSubtaskValues(
      emptySubtaskValues,
    )

    setSubtaskErrors({})

    setIsSubtaskFormOpen(true)
  }


  /*
   * EDITAR TAREA
   */

  const handleEditSubtask = (
    index: number,
  ) => {
    const subtask =
      subtasks[index]

    setEditingSubtaskIndex(index)

    setSubtaskValues({
      name: subtask.name,

      targetDate:
        subtask.targetDate,

      estimatedHours: String(
        subtask.estimatedHours,
      ),

      details:
        subtask.details,
    })

    setSubtaskErrors({})

    setIsSubtaskFormOpen(true)
  }


  /*
   * ELIMINAR TAREA
   */

  const handleDeleteSubtask = (
    indexToDelete: number,
  ) => {
    setSubtasks((current) =>
      current.filter(
        (_, index) =>
          index !== indexToDelete,
      ),
    )

    if (
      editingSubtaskIndex ===
      indexToDelete
    ) {
      handleNewSubtask()
    }
  }


  /*
   * CANCELAR EDICIÓN DE TAREA
   */

  const handleCancelSubtask = () => {
    setEditingSubtaskIndex(null)

    setSubtaskValues(
      emptySubtaskValues,
    )

    setSubtaskErrors({})

    setIsSubtaskFormOpen(false)
  }


  /*
   * CREAR EVENTO
   */

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit(
      {
        ...values,

        name:
          values.name.trim(),

        location:
          values.location.trim(),

        contact:
          values.contact.trim(),
      },

      subtasks,
    )
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >

      {/* =========================
          DATOS DEL EVENTO
      ========================== */}

      <section className="rounded-[16px] border border-[#dde2ea] bg-white p-5">

        <h2 className="text-[20px] font-semibold text-[#17212b]">
          Datos del evento
        </h2>


        {/* Nombre y tipo */}

        <div className="mt-2">
          <p className="text-[12px] font-semibold text-[#17212b]">
            ¿Qué vas a organizar?
          </p>

          <div className="mt-1 grid gap-6 md:grid-cols-2">

            <div className="space-y-1">

              <label
                htmlFor="event-name"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Nombre del evento *
              </label>

              <Input
                id="event-name"
                value={values.name}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField(
                    'name',
                    event.target.value,
                  )
                }
                aria-invalid={
                  Boolean(errors.name)
                }
                className={`h-11 rounded-[8px] ${
                  errors.name
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {errors.name && (
                <p className="text-[11px] text-[#d92d20]">
                  {errors.name}
                </p>
              )}

            </div>


            <div className="space-y-1">

              <label
                htmlFor="event-type"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Tipo de evento *
              </label>

              <Select
                value={
                  values.typeId !== null
                    ? String(
                        values.typeId,
                      )
                    : ''
                }
                disabled={
                  isSubmitting ||
                  isLoadingEventTypes
                }
                onValueChange={(value) =>
                  updateField(
                    'typeId',
                    Number(value),
                  )
                }
              >

                <SelectTrigger
                  id="event-type"
                  className={`h-11! w-full rounded-[8px] ${
                    errors.typeId
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                >
                  <SelectValue
                    placeholder={
                      isLoadingEventTypes
                        ? 'Cargando tipos...'
                        : 'Selecciona un tipo de evento'
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {eventTypes.map(
                    (eventType) => (
                      <SelectItem
                        key={
                          eventType.id
                        }
                        value={String(
                          eventType.id,
                        )}
                      >
                        {
                          eventType.name
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>

              </Select>

              {errors.typeId && (
                <p className="text-[11px] text-[#d92d20]">
                  {errors.typeId}
                </p>
              )}

              {eventTypesError && (
                <p className="text-[11px] text-[#d92d20]">
                  {eventTypesError}
                </p>
              )}

            </div>

          </div>
        </div>


        {/* Fecha y lugar */}

        <div className="mt-2">

          <p className="text-[12px] font-semibold text-[#17212b]">
            ¿Cuándo y dónde será?
          </p>

          <div className="mt-1 grid gap-6 md:grid-cols-2">

            <div className="space-y-1">

              <label
                htmlFor="event-date"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Fecha del evento *
              </label>

              <Input
                id="event-date"
                type="date"
                min={
                  minimumEventDate
                }
                value={
                  values.eventDate
                }
                disabled={
                  isSubmitting
                }
                onChange={(event) =>
                  updateField(
                    'eventDate',
                    event.target.value,
                  )
                }
                className={`h-11 rounded-[8px] ${
                  errors.eventDate
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {errors.eventDate && (
                <p className="text-[11px] text-[#d92d20]">
                  {errors.eventDate}
                </p>
              )}

            </div>


            <div className="space-y-1">

              <label
                htmlFor="event-location"
                className="text-[12px] font-medium text-[#17212b]"
              >
                Lugar *
              </label>

              <Input
                id="event-location"
                value={
                  values.location
                }
                disabled={
                  isSubmitting
                }
                onChange={(event) =>
                  updateField(
                    'location',
                    event.target.value,
                  )
                }
                className={`h-11 rounded-[8px] ${
                  errors.location
                    ? 'border-[#d92d20]'
                    : ''
                }`}
              />

              {errors.location && (
                <p className="text-[11px] text-[#d92d20]">
                  {errors.location}
                </p>
              )}

            </div>

          </div>
        </div>


        {/* Contacto */}

        <div className="mt-2">

          <p className="text-[12px] font-semibold text-[#17212b]">
            ¿A quién podemos contactar?
          </p>

          <div className="mt-1 space-y-1">

            <label
              htmlFor="event-contact"
              className="text-[12px] font-medium text-[#17212b]"
            >
              Contacto *
            </label>

            <Input
              id="event-contact"
              value={values.contact}
              disabled={isSubmitting}
              onChange={(event) =>
                updateField(
                  'contact',
                  event.target.value,
                )
              }
              className={`h-11 rounded-[8px] ${
                errors.contact
                  ? 'border-[#d92d20]'
                  : ''
              }`}
            />

            {errors.contact && (
              <p className="text-[11px] text-[#d92d20]">
                {errors.contact}
              </p>
            )}

          </div>
        </div>

      </section>


      {/* =========================
          TAREAS DEL EVENTO
      ========================== */}

      <section className="rounded-[16px] border border-[#dde2ea] bg-white p-5">

        <h2 className="text-[20px] font-semibold text-[#17212b]">
          Tareas del evento
        </h2>

        <p className="mt-1 text-[13px] text-[#667085]">
          Agrega las tareas principales ahora.
          Podrás editarlas después.
        </p>


        {/* Información */}

        <div className="mt-3 flex gap-3 rounded-[9px] border border-[#c7d2fe] bg-[#eef2ff] px-3 py-2">

          <Info
            size={20}
            className="mt-0.5 shrink-0 text-[#4f46e5]"
          />

          <div>

            <p className="text-[12px] font-semibold text-[#4f46e5]">
              Agregar tareas es opcional, pero muy recomendado.
            </p>

            <p className="mt-1 text-[11px] text-[#667085]">
              Te ayudará a organizar mejor los detalles de tu evento.
            </p>

          </div>

        </div>


        {/* Formulario de tarea */}

        {isSubtaskFormOpen && (
          <div className="mt-3 rounded-[10px] border border-[#dde2ea] bg-[#fafbfc] p-4">

            <p className="text-[13px] font-semibold text-[#17212b]">
              {editingSubtaskIndex !== null
                ? 'Editar tarea'
                : 'Agregar nueva tarea'}
            </p>


            <div className="mt-3 grid gap-4 md:grid-cols-3">

              {/* Nombre */}

              <div className="space-y-1">

                <label className="text-[12px] font-medium text-[#17212b]">
                  Nombre de la tarea *
                </label>

                <Input
                  value={
                    subtaskValues.name
                  }
                  onChange={(event) =>
                    updateSubtaskField(
                      'name',
                      event.target.value,
                    )
                  }
                  className={`h-11 rounded-[8px] ${
                    subtaskErrors.name
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {subtaskErrors.name && (
                  <p className="text-[11px] text-[#d92d20]">
                    {
                      subtaskErrors.name
                    }
                  </p>
                )}

              </div>


              {/* Fecha */}

              <div className="space-y-1">

                <label className="text-[12px] font-medium text-[#17212b]">
                  Fecha límite *
                </label>

                <Input
                  type="date"
                  min={
                    minimumEventDate
                  }
                  max={
                    values.eventDate ||
                    undefined
                  }
                  value={
                    subtaskValues.targetDate
                  }
                  onChange={(event) =>
                    updateSubtaskField(
                      'targetDate',
                      event.target.value,
                    )
                  }
                  className={`h-11 rounded-[8px] ${
                    subtaskErrors.targetDate
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {subtaskErrors.targetDate ? (
                  <p className="text-[11px] text-[#d92d20]">
                    {
                      subtaskErrors.targetDate
                    }
                  </p>
                ) : (
                  values.eventDate && (
                    <p className="text-[10px] text-[#667085]">
                      Debe completarse antes del{' '}
                      {formatTaskDate(
                        values.eventDate,
                      )}.
                    </p>
                  )
                )}

              </div>


              {/* Tiempo */}

              <div className="space-y-1">

                <label className="text-[12px] font-medium text-[#17212b]">
                  Tiempo estimado *
                </label>

                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={
                    subtaskValues.estimatedHours
                  }
                  onChange={(event) =>
                    updateSubtaskField(
                      'estimatedHours',
                      event.target.value,
                    )
                  }
                  className={`h-11 rounded-[8px] ${
                    subtaskErrors.estimatedHours
                      ? 'border-[#d92d20]'
                      : ''
                  }`}
                />

                {subtaskErrors.estimatedHours ? (
                  <p className="text-[11px] text-[#d92d20]">
                    {
                      subtaskErrors.estimatedHours
                    }
                  </p>
                ) : (
                  <p className="text-[10px] text-[#667085]">
                    Ej. 1.5 h, 30 min, 1 día, etc.
                  </p>
                )}

              </div>

            </div>


            {/* Nota + botones */}

            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end">

              <div className="flex-1 space-y-1">

                <label className="text-[12px] font-medium text-[#17212b]">
                  Nota opcional
                </label>

                <Textarea
                  value={
                    subtaskValues.details
                  }
                  onChange={(event) =>
                    updateSubtaskField(
                      'details',
                      event.target.value,
                    )
                  }
                  className="min-h-11 resize-none rounded-[8px]"
                />

              </div>


              <Button
                type="button"
                variant="outline"
                onClick={
                  handleCancelSubtask
                }
                className="h-11 rounded-[8px] px-5"
              >
                Cancelar tarea
              </Button>


              <Button
                type="button"
                onClick={
                  handleSaveSubtask
                }
                className="h-11 rounded-[8px] bg-[#4f46e5] px-5 text-white hover:bg-[#4338ca]"
              >
                {editingSubtaskIndex !== null
                  ? 'Guardar cambios'
                  : 'Agregar tarea'}
              </Button>

            </div>

          </div>
        )}


        {/* Tareas añadidas */}

        {subtasks.length > 0 && (
          <div className="mt-3">

            <p className="mb-2 text-[12px] font-semibold text-[#17212b]">
              Tareas agregadas ({subtasks.length})
            </p>

            <div className="space-y-2">

              {subtasks.map(
                (subtask, index) => (
                  <div
                    key={`${subtask.name}-${index}`}
                    className="flex min-h-9 items-center gap-3 rounded-[8px] border border-[#dde2ea] bg-white px-3 py-2"
                  >

                    <GripVertical
                      size={15}
                      className="shrink-0 text-[#98a2b3]"
                    />


                    <p className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#17212b]">
                      {subtask.name}
                    </p>


                    <div className="hidden items-center gap-1 text-[11px] text-[#667085] sm:flex">

                      <CalendarDays
                        size={15}
                      />

                      {formatTaskDate(
                        subtask.targetDate,
                      )}

                    </div>


                    <div className="hidden min-w-[70px] items-center gap-1 text-[11px] text-[#667085] sm:flex">

                      <Clock3
                        size={15}
                      />

                      {
                        subtask.estimatedHours
                      }{' '}
                      h

                    </div>


                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleEditSubtask(
                          index,
                        )
                      }
                      className="h-7 w-7 text-[#667085]"
                    >
                      <Pencil size={15} />
                    </Button>


                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDeleteSubtask(
                          index,
                        )
                      }
                      className="h-7 w-7 text-[#d92d20]"
                    >
                      <Trash2 size={15} />
                    </Button>

                  </div>
                ),
              )}

            </div>

          </div>
        )}


        {/* Botones inferiores */}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <Button
            type="button"
            variant="outline"
            onClick={
              handleNewSubtask
            }
            className="h-11 rounded-[8px] border-[#c7d2fe] text-[#4f46e5]"
          >
            + Agregar otra tarea
          </Button>


          <div className="flex flex-col gap-3 sm:flex-row">

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
              className="h-11 rounded-[8px]"
            >
              Cancelar creación
            </Button>


            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-[8px] bg-[#4f46e5] px-6 text-white hover:bg-[#4338ca]"
            >
              {isSubmitting
                ? 'Guardando...'
                : subtasks.length > 0
                  ? 'Crear evento con tareas'
                  : 'Crear evento'}
            </Button>

          </div>

        </div>

      </section>

    </form>
  )
}