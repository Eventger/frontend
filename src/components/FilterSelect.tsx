import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type FilterSelectProps = {
  id: string
  value: string
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
  disabled?: boolean
  describedBy?: string
  className?: string
}

export function FilterSelect({
  id,
  value,
  options,
  onValueChange,
  disabled,
  describedBy,
  className,
}: FilterSelectProps) {
  const selectedLabel = options.find(option => option.value === value)?.label

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        title={selectedLabel}
        aria-describedby={describedBy}
        className={`h-11! w-full min-w-0 rounded-[8px] border-[#dde2ea] bg-white px-[13px] text-[13px] text-[#17212b] hover:border-[#c7d2fe] focus-visible:border-[#4f46e5] focus-visible:ring-[#4f46e5]/20 [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:flex-1 ${className ?? ''}`}
      >
        <SelectValue>
          <span className="block min-w-0 truncate text-left">
            {selectedLabel}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="max-h-[min(22rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] min-w-0 translate-y-0! rounded-[8px] border border-[#dde2ea] bg-white text-[#17212b] shadow-md ring-0 motion-reduce:animate-none!"
      >
        <SelectGroup>
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-11 py-2 pl-3 text-[13px] focus:bg-[#eef2ff] focus:text-[#3730a3] focus:**:text-[#3730a3]! data-[state=checked]:bg-[#eef2ff] data-[state=checked]:text-[#3730a3] [&>span:last-child]:min-w-0"
            >
              <span className="line-clamp-2 min-w-0 break-words whitespace-normal text-left">
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
