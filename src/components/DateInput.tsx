import { useId, useRef, useState, type ComponentProps } from 'react'
import { CalendarDays } from 'lucide-react'
import { Popover } from 'radix-ui'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatDateInput, parseDateInput } from '@/lib/calendar'
import { InlineDateCalendar } from '@/components/InlineDateCalendar'

export type DateInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  value: string
  onValueChange: (value: string) => void
  calendarLabel?: string
  onCalendarOpen?: () => void
  calendarExpanded?: boolean
  calendarControls?: string
}

type EditorState = {
  sourceValue: string
  draft: string
}

function normalizeDraft(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDateInput(value)

  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  return [day, month, year].filter(Boolean).join('/')
}

export function DateInput({
  value,
  onValueChange,
  calendarLabel = 'Abrir calendario',
  onCalendarOpen,
  calendarExpanded,
  calendarControls,
  className,
  disabled,
  min,
  max,
  id,
  ...props
}: DateInputProps) {
  const generatedId = useId()
  const inputId = id || generatedId
  const popoverId = calendarControls || `${inputId}-calendar-popover`
  const pickerRef = useRef<HTMLInputElement>(null)
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof onCalendarOpen === 'function'
  const isExpanded = isControlled ? calendarExpanded : internalOpen

  const [editor, setEditor] = useState<EditorState>(() => ({
    sourceValue: value,
    draft: formatDateInput(value),
  }))

  if (editor.sourceValue !== value) {
    setEditor({ sourceValue: value, draft: formatDateInput(value) })
  }

  const updateValue = (rawValue: string) => {
    const draft = normalizeDraft(rawValue)
    const parsedValue = parseDateInput(draft) ?? ''
    setEditor({ sourceValue: parsedValue, draft })
    onValueChange(parsedValue)
  }

  const handleCalendarClick = () => {
    if (isControlled) {
      onCalendarOpen()
      return
    }
    setInternalOpen((prev) => !prev)
  }

  const inputElement = (
    <div className="relative w-full">
      <Input
        {...props}
        id={id}
        type="text"
        value={editor.draft}
        min={min}
        max={max}
        disabled={disabled}
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/aaaa"
        onChange={(event) => updateValue(event.target.value)}
        className={cn('h-11 pr-11 tabular-nums', className)}
      />
      {!isControlled && (
        <input
          ref={pickerRef}
          type="date"
          aria-label={calendarLabel}
          value={/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''}
          min={min}
          max={max}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const nextValue = event.target.value
            setEditor({ sourceValue: nextValue, draft: formatDateInput(nextValue) })
            onValueChange(nextValue)
          }}
          className="hidden"
        />
      )}
      <button
        type="button"
        aria-label={calendarLabel}
        aria-haspopup="dialog"
        aria-expanded={isExpanded}
        aria-controls={popoverId}
        disabled={disabled}
        onClick={handleCalendarClick}
        className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-[#667085] hover:bg-[#f2f4f7] hover:text-[#344054] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4f46e5] disabled:pointer-events-none disabled:opacity-50"
      >
        <CalendarDays className="size-4" aria-hidden="true" />
      </button>
    </div>
  )

  if (isControlled) {
    return inputElement
  }

  return (
    <Popover.Root open={internalOpen} onOpenChange={setInternalOpen}>
      <Popover.Anchor asChild>
        {inputElement}
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          id={popoverId}
          aria-label={calendarLabel}
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={16}
          avoidCollisions
          style={{
            maxHeight: 'min(460px, var(--radix-popover-content-available-height, calc(100svh - 2rem)))',
          }}
          className="z-[70] w-[calc(100vw-2rem)] max-w-[520px] overflow-y-auto overscroll-contain rounded-2xl outline-none"
        >
          <InlineDateCalendar
            min={typeof min === 'string' ? min : undefined}
            max={typeof max === 'string' ? max : undefined}
            value={value}
            disabled={disabled}
            onValueChange={(selectedDate) => {
              updateValue(formatDateInput(selectedDate))
              setInternalOpen(false)
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
