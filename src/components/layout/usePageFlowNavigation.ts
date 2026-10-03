import { useLayoutEffect, useRef } from 'react'

export function usePageFlowNavigation(view: string) {
  const contentRef = useRef<HTMLDivElement>(null)
  const previousView = useRef(view)

  useLayoutEffect(() => {
    if (previousView.current === view) return
    previousView.current = view

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const heading = contentRef.current?.querySelector('h1')
    const focusTarget = heading ?? document.getElementById('main-content')
    focusTarget?.focus({ preventScroll: true })
  }, [view])

  return contentRef
}
