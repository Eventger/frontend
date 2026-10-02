import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SettingsCardProps = {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  tone?: 'neutral' | 'brand' | 'success' | 'danger'
  icon?: ReactNode
  compact?: boolean
  headerIcon?: ReactNode
  action?: ReactNode
}

export function SettingsCard({ title, description, children, className, tone = 'neutral', icon, compact = false, headerIcon, action }: SettingsCardProps) {
  return (
    <section className={cn(
      'min-w-0 rounded-[14px] border p-5 sm:p-6',
      {
        neutral: 'border-[#dde2ea] bg-white',
        brand: 'border-[#4f46e5] bg-[#eef2ff]',
        success: 'border-[#abefc6] bg-[#ecfdf3]',
        danger: 'border-[#fecdca] bg-[#fef3f2]',
      }[tone],
      className,
    )}>
      {icon && <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white text-[#4f46e5]">{icon}</div>}
      <div className="flex flex-wrap items-center gap-4">
        {headerIcon && <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tone === 'danger' ? 'bg-white text-[#b42318]' : 'bg-[#eef2ff] text-[#4f46e5]')}>{headerIcon}</span>}
        <div className="min-w-0 flex-1">
          <h2 className={cn(
        'font-semibold tracking-[-0.015em] text-[#17212b]',
        compact ? 'text-sm leading-5' : 'text-lg leading-6 sm:text-xl',
        tone === 'danger' && 'text-[#b42318]',
          )}>{title}</h2>
          {description && <p className={cn('mt-2 text-[#667085]', compact ? 'text-xs leading-[18px]' : 'text-[13px] leading-5')}>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
