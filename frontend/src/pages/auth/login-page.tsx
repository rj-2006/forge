import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useLogin } from '../../hooks/use-auth'
import { AuthLayout } from '../../components/layout/app-layout'
import { FieldGroup, Field, FieldLabel, FieldError } from '../../components/ui/field'
import { Spinner } from '../../components/ui/spinner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const login = useLogin()

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login.mutateAsync(data)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid credentials')
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md bg-dark-charcoal border-dim-grey/30 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black font-ginto-nord uppercase tracking-tight text-snow">Welcome back!</CardTitle>
          <CardDescription className="text-greyple text-sm font-semibold">We're so excited to see you again!</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            {error && (
              <div className="rounded-md bg-ekko-red/15 border border-ekko-red/30 p-3 text-sm text-ekko-red">
                {error}
              </div>
            )}

            <FieldGroup className="gap-5">
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-fog">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="bg-void border-dim-grey text-snow focus-visible:ring-blurple placeholder:text-greyple h-10"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                <FieldError className="text-xs text-ekko-red font-semibold">{errors.email?.message}</FieldError>
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-fog">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-void border-dim-grey text-snow focus-visible:ring-blurple placeholder:text-greyple h-10"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                <FieldError className="text-xs text-ekko-red font-semibold">{errors.password?.message}</FieldError>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-blurple hover:bg-dark-blurple text-snow py-3 rounded-lg font-medium transition-colors gap-2" 
              disabled={login.isPending}
            >
              {login.isPending && <Spinner className="text-snow" />}
              Log In
            </Button>
            
            <p className="w-full text-left text-sm text-greyple">
              Need an account?{' '}
              <Link 
                to="/register" 
                className="text-vivid-cerulean hover:underline font-semibold"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  )
}
