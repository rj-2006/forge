import { api } from '../lib/api-client'
import type { Thread, Post, ThreadReaction, ChatMessage, Chatroom } from '../types/api'

export const threadService = {
  async getThreads(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<Thread[]> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    
    const query = searchParams.toString()
    return api.get<Thread[]>(`/api/threads${query ? `?${query}` : ''}`)
  },

  async getThread(id: number): Promise<Thread> {
    return api.get(`/api/threads/${id}`)
  },

  async createThread(data: {
    title: string
    content?: string
    images?: File[]
  }): Promise<Thread> {
    const uploadedImages = data.images?.length
      ? await Promise.all(
          data.images.map(async (image) => {
            const response = await api.upload<{ url: string }>('/api/upload/image', image, 'image')
            return { url: response.url }
          })
        )
      : []

    return api.post<Thread>('/api/threads', {
      title: data.title,
      content: data.content || '',
      images: uploadedImages,
    })
  },

  async deleteThread(id: number): Promise<void> {
    return api.delete(`/api/threads/${id}`)
  },

  async createPost(threadId: number, content: string): Promise<Post> {
    return api.post<Post>(`/api/threads/${threadId}/posts`, { content })
  },

  async addReaction(threadId: number, emoji: string): Promise<ThreadReaction> {
    const response = await api.post<{ message: string; reaction: ThreadReaction }>(`/api/threads/${threadId}/reactions`, { emoji })
    return response.reaction
  },

  async removeReaction(threadId: number, emoji: string): Promise<void> {
    return api.delete(`/api/threads/${threadId}/reactions/${encodeURIComponent(emoji)}`)
  },

  async getReactions(threadId: number): Promise<{
    reactions: ThreadReaction[]
    emoji_counts: Record<string, number>
    emoji_users: Record<string, string[]>
  }> {
    return api.get(`/api/threads/${threadId}/reactions`)
  },
}

export const chatService = {
  async getChatrooms(): Promise<Chatroom[]> {
    return api.get('/api/chatrooms')
  },

  async getChatHistory(chatroomId: number, params?: {
    page?: number
    limit?: number
  }): Promise<ChatMessage[]> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    
    const query = searchParams.toString()
    return api.get(`/api/chatrooms/${chatroomId}/history${query ? `?${query}` : ''}`)
  },

  async createChatroom(data: {
    name: string
    description?: string
  }): Promise<Chatroom> {
    return api.post('/api/chatrooms', data)
  },
}
