import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'

import './index.css'
import App from './app/App.tsx'
import { ConfigurationError } from './components/ConfigurationError.tsx'

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const apiUrl = import.meta.env.VITE_API_URL
const missingVariables = [
  !apiUrl && 'VITE_API_URL',
  !clerkPublishableKey &&
    'VITE_CLERK_PUBLISHABLE_KEY',
].filter(
  (variable): variable is string =>
    Boolean(variable),
)

const root = createRoot(
  document.getElementById('root')!,
)

if (
  missingVariables.length > 0 ||
  !clerkPublishableKey
) {
  root.render(
    <StrictMode>
      <ConfigurationError
        missingVariables={
          missingVariables
        }
      />
    </StrictMode>,
  )
} else {
  root.render(
    <StrictMode>
      <ClerkProvider
        publishableKey={
          clerkPublishableKey
        }
      >
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
}
