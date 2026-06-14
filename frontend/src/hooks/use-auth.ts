import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth-service'
import { queryKeys } from '../lib/query-provider'
import { useAuthStore } from '../stores/auth-store'
import type { LoginRequest, RegisterRequest } from '../types/api'

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30,
    retry: false,
    throwOnError: false,
  })
}

export function useGoogleLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credential: string) => authService.loginWithGoogle(credential),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.user(), data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => Promise.resolve(authService.logout()),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Parameters<typeof authService.updateProfile>[0]) =>
      authService.updateProfile(data),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.user(), user)
    },
  })
}
