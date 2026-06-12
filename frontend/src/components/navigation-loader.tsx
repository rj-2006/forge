import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function NavigationLoader() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setIsLoading(true)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [location.pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-primary/20">
      <div className="h-full animate-pulse bg-primary" style={{ width: '30%' }} />
    </div>
  )
}
