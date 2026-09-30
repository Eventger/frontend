import type {
  MouseEvent,
  ReactNode,
} from 'react'

import { Link } from 'react-router'

type AuthRouteLinkProps = {
  children: ReactNode
  className?: string
  direction: 'forward' | 'backward'
  to: '/' | '/crear-cuenta'
}

export function AuthRouteLink({
  children,
  className,
  direction,
  to,
}: AuthRouteLinkProps) {
  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    const isPrimaryNavigation =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey

    if (isPrimaryNavigation) {
      document.documentElement.dataset.authDirection =
        direction
    }
  }

  return (
    <Link
      to={to}
      viewTransition
      onClick={handleClick}
      className={className}
    >
      {children}
    </Link>
  )
}
