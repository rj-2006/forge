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
      <Card className="w-full max-w-md bg-dark-charcoal border-dim-grey/30 shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blurple opacity-20 blur-3xl rounded-full pointer-events-none" />
        
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <CardTitle className="text-3xl font-black font-ginto-nord tracking-tight text-snow">
            Welcome to TechTalk
          </CardTitle>
          <CardDescription className="text-greyple text-sm font-semibold">
            Join the community, connect with developers.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pb-12 flex flex-col items-center">
          {error && (
            <div className="rounded-md bg-ekko-red/15 border border-ekko-red/30 p-3 text-sm text-ekko-red w-full text-center mb-4">
              {error}
            </div>
          )}

          <div className="w-full flex justify-center hover:scale-[1.02] transition-transform">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="filled_black"
              size="large"
              shape="pill"
              text="continue_with"
              width="300"
            />
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-fog max-w-xs mx-auto">
              By continuing, you agree to TechTalk's Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
