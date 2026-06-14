import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useGoogleLogin } from '../../hooks/use-auth'
import { AuthLayout } from '../../components/layout/app-layout'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const login = useGoogleLogin()

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setError(null)
      if (credentialResponse.credential) {
        await login.mutateAsync(credentialResponse.credential)
        navigate(from, { replace: true })
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to authenticate with Google')
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-xl border-muted/50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome to Forge
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm font-medium">
            Join the community, connect with developers.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-12 flex flex-col items-center">
          {error && (
            <div className="rounded-md bg-destructive/15 border border-destructive/30 p-3 text-sm text-destructive w-full text-center mb-4">
              {error}
            </div>
          )}

          <div className="w-full flex justify-center hover:scale-[1.02] transition-transform">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width="300"
            />
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              By continuing, you agree to Forge's Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
