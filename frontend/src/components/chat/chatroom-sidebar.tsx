import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'
import type { Chatroom } from '../../types/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'

interface ChatroomSidebarProps {
  chatrooms: Chatroom[]
  currentChatroomId?: number
  isLoading?: boolean
  onCreateChatroom?: (name: string, description?: string) => void
  isCreating?: boolean
  className?: string
}

export function ChatroomSidebar({
  chatrooms,
  currentChatroomId,
  isLoading,
  onCreateChatroom,
  isCreating,
  className,
}: ChatroomSidebarProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newChatroomName, setNewChatroomName] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatroomName.trim()) return
    
    onCreateChatroom?.(newChatroomName.trim())
    setNewChatroomName('')
    setShowCreateForm(false)
  }

  return (
    <div className={cn('flex w-60 flex-col border-r bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">Chatrooms</h2>
        {onCreateChatroom && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="border-b p-3 space-y-2">
          <Input
            value={newChatroomName}
            onChange={(e) => setNewChatroomName(e.target.value)}
            placeholder="Chatroom name"
            disabled={isCreating}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isCreating || !newChatroomName.trim()}>
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Chatroom List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : chatrooms.length > 0 ? (
            chatrooms.map((chatroom) => (
              <Link
                key={chatroom.id}
                to={`/app/chat/${chatroom.id}`}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  currentChatroomId === chatroom.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                  #
                </span>
                <span className="truncate">{chatroom.name}</span>
              </Link>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No chatrooms yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
