import { api } from '../lib/api-client'
import { useAuthStore } from '../stores/auth-store'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/api'

export const authService = {
  async loginWithGoogle(credential: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/google', { credential }, false)
    
    useAuthStore.getState().login(response.user, response.token)
    
    return response
  },

  async getCurrentUser(): Promise<User> {
    const user = useAuthStore.getState().user
    if (user) return user
    throw new Error('No user session')
  },

  async checkSession(): Promise<User | null> {
    useAuthStore.getState().setLoading(true)
    try {
      const user = await api.get<User>('/api/me')
      useAuthStore.getState().setUser(user)
      return user
    } catch {
      useAuthStore.getState().logout()
      return null
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout', {}, false)
    } catch {
      // ignore
    }
    useAuthStore.getState().logout()
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/api/auth/profile', data)
    useAuthStore.getState().setUser(response)
    return response
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const response = await api.upload<{ url: string }>('/api/upload/avatar', file, 'avatar')
    return response
  },
}
