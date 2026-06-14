import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../../lib/utils'
import type { ChatMessage } from '../../types/api'

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
  return (
    <div
      className={cn(
        'group flex gap-4 px-4 py-1.5 hover:bg-[#32353b]/40 transition-colors',
        className
      )}
    >
      <div className="flex-shrink-0 w-10 flex justify-center">
        {showAvatar ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blurple text-snow text-base font-bold select-none shadow-sm">
            {message.user?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        ) : (
          <div className="w-10" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        {showUsername && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <Link
              to={`/user/${message.user?.username}`}
              className="text-sm font-bold text-snow hover:underline font-ginto"
            >
              {message.user?.username}
            </Link>
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
  )
}
