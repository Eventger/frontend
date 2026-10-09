'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Toaster as Sonner,
  type ToasterProps,
} from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[#027a48]" />
        ),
        info: (
          <InfoIcon className="size-4 text-[#4f46e5]" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-[#b54708]" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-[#b42318]" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          '--normal-bg': '#ffffff',
          '--normal-text': '#17212b',
          '--normal-border': '#dde2ea',
          '--border-radius': '10px',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'cn-toast !rounded-lg !border-border-subtle !bg-white !text-[#17212b] !shadow-[0_10px_28px_rgba(23,33,43,0.10)]',
          title:
            '!text-[13px] !font-semibold',
          description:
            '!text-[12px] !leading-[18px] !text-[#667085]',
          actionButton:
            '!h-9 !rounded-[8px] !bg-[#4f46e5] !px-3 !text-white',
          cancelButton:
            '!h-9 !rounded-[8px] !border !border-border-subtle !bg-white !px-3 !text-[#17212b]',
          success:
            '!border-[#abefc6]',
          error:
            '!border-[#fecdca]',
          warning:
            '!border-[#fedf89]',
          info:
            '!border-[#c7d2fe]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
