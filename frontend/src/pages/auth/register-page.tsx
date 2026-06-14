import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useRegister } from '../../hooks/use-auth'
import { AuthLayout } from '../../components/layout/app-layout'
import { FieldGroup, Field, FieldLabel, FieldError } from '../../components/ui/field'
import { Spinner } from '../../components/ui/spinner'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase, one lowercase, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const registerUser = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null)
      await registerUser.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password,
      })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md bg-dark-charcoal border-dim-grey/30 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black font-ginto-nord uppercase tracking-tight text-snow">Create an account</CardTitle>
          <CardDescription className="text-greyple text-sm font-semibold">Join the TechTalk gaming workspace!</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-ekko-red/15 border border-ekko-red/30 p-3 text-sm text-ekko-red">
                {error}
              </div>
            )}

            <FieldGroup className="gap-4">
              <Field data-invalid={!!errors.username}>
                <FieldLabel htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-fog">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="bg-void border-dim-grey text-snow focus-visible:ring-blurple placeholder:text-greyple h-10"
                  aria-invalid={!!errors.username}
                  {...register('username')}
                />
                <FieldError className="text-xs text-ekko-red font-semibold">{errors.username?.message}</FieldError>
              </Field>

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
                  placeholder="Create a password"
                  className="bg-void border-dim-grey text-snow focus-visible:ring-blurple placeholder:text-greyple h-10"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                <p className="text-[10px] text-greyple font-semibold mt-0.5">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
                <FieldError className="text-xs text-ekko-red font-semibold">{errors.password?.message}</FieldError>
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-fog">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-void border-dim-grey text-snow focus-visible:ring-blurple placeholder:text-greyple h-10"
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                <FieldError className="text-xs text-ekko-red font-semibold">{errors.confirmPassword?.message}</FieldError>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-blurple hover:bg-dark-blurple text-snow py-3 rounded-lg font-medium transition-colors gap-2" 
              disabled={registerUser.isPending}
            >
              {registerUser.isPending && <Spinner className="text-snow" />}
              Continue
            </Button>
            
            <p className="w-full text-left text-sm text-greyple">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-vivid-cerulean hover:underline font-semibold"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  )
}
