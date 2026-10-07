import { useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent } from 'react'
import { MapPin } from 'lucide-react'
import { Popover } from 'radix-ui'
import { Input } from '@/components/ui/input'
import { searchAddresses, type AddressSuggestion } from '../services/address.service'

type Props = Pick<ComponentProps<typeof Input>, 'id' | 'disabled' | 'className' | 'aria-invalid' | 'aria-describedby'> & {
  value: string
  onChange: (address: string) => void
}

type SearchResult = { key: string; suggestions: AddressSuggestion[]; failed: boolean }

export function EventLocationInput({ value, onChange, className, disabled, ...inputProps }: Props) {
  const listId = useId()
  const input = useRef<HTMLInputElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const query = value.trim()
  const key = query
  const showMenu = open && !disabled && query.length >= 3
  const suggestions = result?.key === key ? result.suggestions : []
  const loading = showMenu && result?.key !== key
  const failed = result?.key === key && result.failed

  useEffect(() => {
    if (!showMenu || result?.key === key) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const suggestions = await searchAddresses(query, { signal: controller.signal })
        if (!controller.signal.aborted) setResult({ key, suggestions, failed: false })
      } catch {
        if (!controller.signal.aborted) setResult({ key, suggestions: [], failed: true })
      }
    }, 500)
    return () => { clearTimeout(timer); controller.abort() }
  }, [key, query, showMenu, result?.key])

  function choose(place: AddressSuggestion) {
    input.current?.focus()
    onChange(place.address)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') { setOpen(false); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (suggestions.length) {
        const nextIndex = event.key === 'ArrowDown'
          ? (activeIndex + 1) % suggestions.length
          : (activeIndex <= 0 ? suggestions.length : activeIndex) - 1
        setActiveIndex(nextIndex)
        document.getElementById(`${listId}-${nextIndex}`)?.scrollIntoView({ block: 'nearest' })
      }
    }
    if (event.key === 'Enter' && showMenu && suggestions[activeIndex]) {
      event.preventDefault()
      choose(suggestions[activeIndex])
    }
    if (event.key === 'Tab') setOpen(false)
  }

  return (
    <div onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget) && !menu.current?.contains(event.relatedTarget)) setOpen(false)
    }}>
      <Popover.Root open={showMenu} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <div ref={anchor}>
            <Input
              {...inputProps}
              ref={input}
              value={value}
              disabled={disabled}
              maxLength={255}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showMenu}
              aria-controls={showMenu ? listId : undefined}
              aria-activedescendant={showMenu && suggestions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
              placeholder="Busca un lugar o una dirección"
              onFocus={() => setOpen(true)}
              onChange={event => { onChange(event.target.value); setOpen(true); setActiveIndex(-1) }}
              onKeyDown={handleKeyDown}
              className={className}
            />
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content ref={menu} role="presentation" align="start" sideOffset={4} collisionPadding={8}
            onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()}
            onInteractOutside={event => { if (event.target instanceof Node && anchor.current?.contains(event.target)) event.preventDefault() }}
            className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[10px] border border-[#dde2ea] bg-white shadow-lg">
            <ul id={listId} role="listbox" aria-label="Direcciones sugeridas" aria-busy={loading} className="max-h-[min(280px,40svh,calc(var(--radix-popover-content-available-height)-44px))] overflow-y-auto overscroll-contain py-1">
              {suggestions.map((place, index) => (
                <li key={place.id} role="presentation">
                  <button type="button" id={`${listId}-${index}`} role="option" tabIndex={-1} aria-selected={index === activeIndex}
                    onPointerMove={() => setActiveIndex(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(place)}
                    className={`flex min-h-11 w-full cursor-pointer items-start gap-3 px-3 py-3 text-left ${index === activeIndex ? 'bg-[#eef2ff]' : 'hover:bg-[#f7f8fc]'}`}>
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#667085]" />
                    <span className="min-w-0 break-words">
                      <span className="block text-[13px] font-medium leading-5 text-[#17212b]">{place.title}</span>
                      {place.description && <span className="block text-xs leading-[18px] text-[#667085]">{place.description}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {loading && <p role="status" className="px-3 pb-3 text-xs text-[#667085]">Buscando direcciones…</p>}
            {failed && <p role="status" className="px-3 pb-3 text-xs text-[#667085]">No pudimos buscar direcciones. Puedes escribir el lugar completo.</p>}
            {!loading && !failed && !suggestions.length && <p role="status" className="px-3 pb-3 text-xs text-[#667085]">No encontramos resultados. Prueba con la ciudad o la dirección completa.</p>}
            <p className="border-t border-[#dde2ea] px-3 py-2 text-[11px] text-[#667085]">Datos de <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a></p>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
