import * as React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { cn, resolveAssetUrl } from '../../lib/utils'
import type { ChatMessage } from '../../types/api'
import { UserProfileModal } from '../profile/user-profile-modal'
import { useAuthStore } from '../../stores/auth-store'

interface MessageItemProps {
  message: ChatMessage
  isOwn?: boolean
  showAvatar?: boolean
  showUsername?: boolean
  className?: string
}

export function MessageItem({
  message,
  showAvatar = true,
  showUsername = true,
  className,
}: MessageItemProps) {
  const [profileOpen, setProfileOpen] = React.useState(false)
  const currentUser = useAuthStore(state => state.user)
  
  // If it's our message, use the latest global avatar/user info so it stays perfectly synced
  const isActuallyOwn = currentUser?.id === message.user_id
  const displayUser = isActuallyOwn && currentUser ? currentUser : message.user
  const username = displayUser?.username || 'Unknown'
  const initial = username.charAt(0).toUpperCase()

  return (
    <>
      <div
        className={cn(
          'group flex gap-4 px-4 py-1.5 hover:bg-[#32353b]/40 transition-colors',
          className
        )}
      >
        <div className="flex-shrink-0 w-10 flex justify-center">
          {showAvatar ? (
            <button 
              onClick={() => setProfileOpen(true)}
              className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-blurple text-snow text-base font-bold select-none shadow-sm hover:ring-2 hover:ring-white/50 transition-all cursor-pointer"
            >
              {displayUser?.avatar ? (
                <img src={resolveAssetUrl(displayUser.avatar)} alt={username} className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {showUsername && (
            <div className="flex items-baseline gap-2 mb-0.5">
              <button
                onClick={() => setProfileOpen(true)}
                className="text-sm font-bold text-snow hover:underline font-ginto cursor-pointer"
              >
                {username}
              </button>
              <span className="text-[10px] font-semibold text-[#8e9297]">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
            </div>
          )}
          
          <p className="text-sm text-[#dcddde] whitespace-pre-wrap leading-relaxed font-ginto">
            {message.content}
          </p>
        </div>
      </div>

      <UserProfileModal 
        user={displayUser} 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
      />
    </>
  )
}
