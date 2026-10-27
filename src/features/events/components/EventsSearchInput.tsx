import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Loader2, Search, X } from 'lucide-react'

type EventsSearchInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  debounceMs?: number
  isLoading?: boolean
}

export function EventsSearchInput({
  value,
  onChange,
  disabled = false,
  debounceMs = 300,
  isLoading = false,
}: EventsSearchInputProps) {
  const [prevValue, setPrevValue] = useState(value)
  const [internalValue, setInternalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  if (value !== prevValue) {
    setPrevValue(value)
    setInternalValue(value)
  }

  const triggerChange = (val: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onChangeRef.current(val)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value
    setInternalValue(nextVal)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      onChangeRef.current(nextVal)
    }, debounceMs)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      triggerChange(internalValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClear()
    }
  }

  const handleClear = () => {
    setInternalValue('')
    triggerChange('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <div>
      <label
        htmlFor="events-search-input"
        className="type-label block font-semibold text-[#17212b]"
      >
        Buscar por nombre
      </label>
      <div className="relative mt-2">
        {isLoading ? (
          <Loader2
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[#4f46e5]"
            aria-hidden="true"
          />
        ) : (
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98a2b3]"
            aria-hidden="true"
          />
        )}
        <input
          id="events-search-input"
          ref={inputRef}
          type="search"
          role="searchbox"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Buscar por nombre de evento..."
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-border-subtle bg-white pl-9 pr-9 text-sm text-[#17212b] placeholder:text-[#98a2b3] focus-visible:border-[#4f46e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f46e5] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:appearance-none [&::-webkit-search-results-decoration]:hidden [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#98a2b3] transition-colors hover:text-[#17212b] focus-visible:outline-2 focus-visible:outline-[#4f46e5] disabled:opacity-40"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
