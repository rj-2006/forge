import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from './components/theme-provider'
import { AppLoader } from './components/app-loader'
import { ToastProvider } from './lib/toast'
import { queryClient } from './lib/query-provider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider
            defaultTheme="system"
            storageKey="techtalk-theme"
          >
            <ToastProvider>
              <AppLoader />
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
