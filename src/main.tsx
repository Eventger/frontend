import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'

import './index.css'
import App from './app/App.tsx'

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPublishableKey) {
  throw new Error(
    'VITE_CLERK_PUBLISHABLE_KEY is not configured',
  )
}

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={clerkPublishableKey}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)