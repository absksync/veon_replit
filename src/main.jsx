import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

// Import your Publishable Key (optional for demo mode)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn('⚠️ Clerk key not found - running in demo mode without authentication')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        afterSignOutUrl="/"
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: '#FFB000',
            colorBackground: '#000000',
            colorInputBackground: '#0A0A0A',
            colorInputText: '#FFB000',
            colorText: '#FFB000',
            colorTextSecondary: '#666666',
            colorDanger: '#ff4444',
            borderRadius: '24px',
          },
          elements: {
            card: 'bg-black border-2 border-veon-orange shadow-lg shadow-veon-orange/20 rounded-3xl overflow-hidden',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-400',
            formButtonPrimary: 'bg-veon-orange text-black hover:bg-amber-500 font-semibold',
            formFieldInput: 'bg-gray-900 border-gray-800 text-veon-orange focus:border-veon-orange',
            footerActionLink: 'text-veon-orange hover:text-amber-500',
            socialButtonsBlockButton: 'border-gray-800 text-white hover:bg-gray-900',
            formFieldLabel: 'text-gray-300',
            identityPreviewEditButton: 'text-veon-orange',
            userButtonPopoverCard: 'bg-black border-2 border-veon-orange rounded-2xl',
            userButtonPopoverActionButton: 'text-white hover:bg-veon-orange hover:text-black transition-colors',
            userButtonPopoverActionButtonText: 'text-white',
            userButtonPopoverActionButtonIcon: 'text-white',
          },
        }}
      >
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
)
