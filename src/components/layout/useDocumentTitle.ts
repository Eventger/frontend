import { useEffect } from 'react'

/**
 * Sets document.title dynamically and restores previous title on unmount.
 * Automatically appends ' · Eventger' if not already present.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return
    const formatted = title.includes('Eventger') ? title : `${title} · Eventger`
    const previous = document.title
    document.title = formatted
    return () => {
      document.title = previous
    }
  }, [title])
}
