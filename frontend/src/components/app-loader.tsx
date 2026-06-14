import { useEffect, useState } from 'react'
import App from '../App'
import { useAuthStore } from '../stores/auth-store'
import { authService } from '../services/auth-service'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading Forge...</p>
      </div>
    </div>
  )
}

export function AppLoader() {
  const isLoading = useAuthStore((state) => state.isLoading)
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    authService.checkSession()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const timer = window.setTimeout(() => setShowLoading(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (showLoading && isLoading) {
    return <LoadingScreen />
  }

  return <App />
}
