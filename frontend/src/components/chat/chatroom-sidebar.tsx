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

  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatroomName.trim()) return
    
    setError(null)
    try {
      if (onCreateChatroom) {
        await onCreateChatroom(newChatroomName.trim())
      }
      setNewChatroomName('')
      setShowCreateForm(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create chatroom')
    }
  }

  return (
    <div className={cn('flex w-60 flex-col border-r border-void/50 bg-[#2f3136] text-greyple', className)}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-void/50 px-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-snow font-ginto-nord">Chatrooms</h2>
        {onCreateChatroom && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-greyple hover:text-snow hover:bg-transparent"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreate} className="border-b border-void/50 p-3 space-y-2 bg-void/25">
          {error && <div className="text-xs text-ekko-red font-semibold">{error}</div>}
          <Input
            value={newChatroomName}
            onChange={(e) => setNewChatroomName(e.target.value)}
            placeholder="new-chatroom"
            className="bg-void border-dim-grey text-snow placeholder:text-greyple h-9 text-sm focus-visible:ring-blurple"
            disabled={isCreating}
          />
          <div className="flex gap-2">
            <Button 
              type="submit" 
              size="sm" 
              className="bg-blurple hover:bg-dark-blurple text-snow rounded px-3 py-1 text-xs font-bold"
              disabled={isCreating || !newChatroomName.trim()}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-greyple hover:text-snow text-xs"
              onClick={() => {
                setShowCreateForm(false)
                setError(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Chatroom List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-dark-charcoal" />
              ))}
            </div>
          ) : chatrooms.length > 0 ? (
            chatrooms.map((chatroom) => (
              <Link
                key={chatroom.id}
                to={`/app/chat/${chatroom.id}`}
                className={cn(
                  'flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-semibold transition-colors',
                  currentChatroomId === chatroom.id
                    ? 'bg-[#35393e] text-snow'
                    : 'text-[#8e9297] hover:bg-[#35393e]/40 hover:text-[#dcddde]'
                )}
              >
                <span className="text-[#8e9297] text-lg font-normal">#</span>
                <span className="truncate">{chatroom.name}</span>
              </Link>
            ))
          ) : (
            <p className="p-4 text-center text-xs text-greyple">
              No chatrooms yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
