import { useLayoutEffect, useRef, type RefObject } from 'react'
import { useLocation, useNavigationType } from 'react-router'

export function useDeferredScrollRestoration(contentRef: RefObject<HTMLElement | null>) {
  const { key } = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const target = positions.current.get(key)
    let pending = navigationType === 'POP' && target !== undefined
    const savedPositions = positions.current
    const content = contentRef.current
    const recordPosition = () => {
      if (!pending) savedPositions.set(key, window.scrollY)
    }
    const observer = new MutationObserver(() => restorePosition())
    const restorePosition = () => {
      if (!pending || content?.querySelector('[aria-busy="true"], [role="status"][aria-label^="Cargando"]')) return
      pending = false
      observer.disconnect()
      window.scrollTo({ top: target, left: 0, behavior: 'instant' })
      recordPosition()
    }
    const cancelRestoration = () => {
      pending = false
      observer.disconnect()
      recordPosition()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) cancelRestoration()
    }

    window.addEventListener('scroll', recordPosition, { passive: true })
    window.addEventListener('wheel', cancelRestoration, { passive: true })
    window.addEventListener('touchmove', cancelRestoration, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    if (pending && content) observer.observe(content, { subtree: true, childList: true, attributes: true })
    restorePosition()
    recordPosition()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', recordPosition)
      window.removeEventListener('wheel', cancelRestoration)
      window.removeEventListener('touchmove', cancelRestoration)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, navigationType, contentRef])
}
