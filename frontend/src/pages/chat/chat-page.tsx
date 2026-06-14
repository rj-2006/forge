import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useChatrooms, useChatHistory, useCreateChatroom } from '../../hooks/use-chat'
import { useChatWebSocket } from '../../hooks/use-websocket'
import { useAuthStore } from '../../stores/auth-store'
import { PageContainer } from '../../components/layout/page-container'
import { ErrorBoundary } from '../../components/error-boundary'
import { ChatroomSidebar } from '../../components/chat/chatroom-sidebar'
import { MessageList } from '../../components/chat/message-list'
import { MessageInput } from '../../components/chat/message-input'
import { TypingIndicator } from '../../components/chat/typing-indicator'
import { cn } from '../../lib/utils'
import type { ChatMessage } from '../../types/api'

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const chatroomId = id ? Number(id) : undefined
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const typingTimeoutsRef = useRef<Record<string, number>>({})

  const { data: chatrooms, isLoading: chatroomsLoading } = useChatrooms()
  const { data: history, isLoading: historyLoading } = useChatHistory(chatroomId || 0)
  const createChatroom = useCreateChatroom()

  const userId = useAuthStore((state) => state.user?.id)

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
  }, [])

  const handleTypingUser = useCallback((typingUserId: number, username: string) => {
    // see your own typing indicator for testing:
    if (typingUserId === userId) {
      return
    }

    setTypingUsers((prev) => (prev.includes(username) ? prev : [...prev, username]))

    const existingTimeout = typingTimeoutsRef.current[username]
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    typingTimeoutsRef.current[username] = window.setTimeout(() => {
      setTypingUsers((prev) => prev.filter((user) => user !== username))
      delete typingTimeoutsRef.current[username]
    }, 2500)
  }, [userId])

  const handleUserLeft = useCallback((_leftUserId: number) => {
    setTypingUsers([])
    Object.values(typingTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId))
    typingTimeoutsRef.current = {}
  }, [])

  const { isConnected, sendMessage, sendTyping } = useChatWebSocket({
    chatroomId: chatroomId ?? 0,
    onMessage: handleNewMessage,
    onTyping: handleTypingUser,
    onUserLeft: handleUserLeft,
  })

  useEffect(() => {
    if (history && Array.isArray(history)) {
      setMessages(history)
    }
  }, [history])

  useEffect(() => {
    return () => {
      Object.values(typingTimeoutsRef.current).forEach((timeoutId) => clearTimeout(timeoutId))
      setTypingUsers([])
    }
  }, [])

  const handleSendMessage = (content: string) => {
    if (!isConnected) {
      console.warn('WebSocket not connected')
      return
    }
    sendMessage(content)
  }

  const handleTyping = () => {
    if (!isConnected) return
    sendTyping()
  }

  const handleCreateChatroom = (name: string, description?: string) => {
    createChatroom.mutate({ name, description })
  }

  const currentChatroom = chatrooms?.find((c) => c.id === chatroomId)

  return (
    <PageContainer className="flex flex-row min-h-0 overflow-hidden bg-[#36393f] p-0">
      <ChatroomSidebar
        chatrooms={chatrooms || []}
        currentChatroomId={chatroomId}
        isLoading={chatroomsLoading}
        onCreateChatroom={handleCreateChatroom}
        isCreating={createChatroom.isPending}
        className={chatroomId ? 'hidden md:flex w-full md:w-60' : 'flex w-full md:w-60'}
      />

      <div className={cn("min-h-0 flex-1 flex-col bg-[#36393f]", !chatroomId ? 'hidden md:flex' : 'flex')}>
        <ErrorBoundary>
          {chatroomId ? (
            <>
              {/* Chat Header */}
              <div className="flex h-14 items-center gap-2 border-b border-void/50 px-4 bg-[#36393f]">
                <Link to="/app/chat" className="md:hidden mr-2 p-1 -ml-2 text-greyple hover:text-snow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
                <span className="text-[#8e9297] text-xl font-normal select-none">
                  #
                </span>
                <h2 className="text-base font-bold text-snow font-ginto">{currentChatroom?.name || 'chat'}</h2>
                {currentChatroom?.description && (
                  <>
                    <span className="text-dim-grey">•</span>
                    <span className="text-xs text-greyple font-medium">{currentChatroom.description}</span>
                  </>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <span className={cn(
                    'h-2 w-2 rounded-full',
                    isConnected ? 'bg-spring-green' : 'bg-dim-grey'
                  )} />
                  <span className="text-xs text-greyple font-semibold">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Messages */}
              {historyLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-greyple text-sm font-semibold animate-pulse">Loading chat log...</div>
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  currentUserId={userId}
                  className="min-h-0 flex-1"
                />
              )}

              {/* Typing Indicator */}
              <TypingIndicator users={typingUsers} />

              {/* Input */}
              <MessageInput
                onSend={handleSendMessage}
                onTyping={handleTyping}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-[#36393f]">
              <div className="text-center space-y-2 max-w-sm px-6">
                <div className="w-16 h-16 rounded-full bg-void flex items-center justify-center text-3xl font-black text-snow mx-auto mb-4">#</div>
                <h3 className="text-xl font-extrabold font-ginto-nord text-snow uppercase">Welcome to Chat!</h3>
                <p className="text-sm text-greyple font-medium">Select one of the channels from the sidebar or create a new one to start talking with members.</p>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </PageContainer>
  )
}
