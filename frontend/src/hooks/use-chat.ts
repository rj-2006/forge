import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-provider'
import type { Chatroom, ChatMessage } from '../types/api'

export function useChatrooms() {
  return useQuery({
    queryKey: queryKeys.chatrooms.list(),
    queryFn: () => api.get<Chatroom[]>('/api/chatrooms'),
  })
}

export function useChatHistory(chatroomId: number, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.chatrooms.messages(chatroomId),
    queryFn: () => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', String(params.page))
      if (params?.limit) searchParams.set('limit', String(params.limit))
      const query = searchParams.toString()
      return api.get<ChatMessage[]>(`/api/chatrooms/${chatroomId}/history${query ? `?${query}` : ''}`)
    },
    enabled: !!chatroomId,
    // Chat history is inherently volatile — messages arrive via WebSocket
    // between visits. Always refetch when entering a room, but keep the
    // cache briefly so old messages display instantly while fresh data loads.
    staleTime: 0,
    gcTime: 1000 * 30,
  })
}

export function useCreateChatroom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post<Chatroom>('/api/chatrooms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatrooms.lists() })
    },
  })
}
