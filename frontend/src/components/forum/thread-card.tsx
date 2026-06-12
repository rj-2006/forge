import * as React from 'react'
import { Link } from 'react-router-dom'
import { cn, resolveAssetUrl } from '../../lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { Thread } from '../../types/api'
import { ReactionButton } from './reaction-button'

interface ThreadCardProps {
  thread: Thread
  onAddReaction: (emoji: string) => void
  onRemoveReaction: (emoji: string) => void
  isAuthenticated: boolean
  currentUserId?: number
  className?: string
}

export function ThreadCard({
  thread,
  onAddReaction,
  onRemoveReaction,
  isAuthenticated,
  currentUserId,
  className,
}: ThreadCardProps) {
  const reactions = React.useMemo(() => {
    const reactionMap = new Map<string, { emoji: string; count: number; hasReacted: boolean }>()
    
    thread.reactions?.forEach((reaction) => {
      const existing = reactionMap.get(reaction.emoji)
      if (existing) {
        existing.count++
        if (reaction.user_id === currentUserId) {
          existing.hasReacted = true
        }
      } else {
        reactionMap.set(reaction.emoji, {
          emoji: reaction.emoji,
          count: 1,
          hasReacted: reaction.user_id === currentUserId,
        })
      }
    })
    
    return Array.from(reactionMap.values())
  }, [currentUserId, thread.reactions])

  const postCount = thread.posts?.length || 0
  const imageCount = thread.images?.length || 0

  return (
    <article
      className={cn(
        'rounded-lg border bg-card p-4 transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex gap-3">
        {/* Vote/Avatar column */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
            {thread.user?.username?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to={`/user/${thread.user?.username}`}
              className="font-medium text-foreground hover:underline"
            >
              {thread.user?.username}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
          </div>

          {/* Title */}
          <Link to={`/app/forum/threads/${thread.id}`}>
            <h2 className="mt-1 text-lg font-semibold hover:text-primary transition-colors">
              {thread.title}
            </h2>
          </Link>

          {/* Preview content */}
          {thread.posts && thread.posts[0] && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {thread.posts[0].content}
            </p>
          )}

          {/* Images */}
          {imageCount > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {thread.images?.slice(0, 4).map((image, index) => (
                <div
                  key={image.id || index}
                  className={cn(
                    'relative overflow-hidden rounded-md bg-muted',
                    imageCount === 1 ? 'h-48 w-full max-w-md' : 'h-20 w-20 flex-shrink-0'
                  )}
                >
                  <img
                    src={resolveAssetUrl(image.url)}
                    alt={image.caption || ''}
                    className="h-full w-full object-cover"
                  />
                  {index === 3 && imageCount > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-medium">
                      +{imageCount - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center gap-4">
            <ReactionButton
              reactions={reactions}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
              isAuthenticated={isAuthenticated}
            />

            <Link
              to={`/app/forum/threads/${thread.id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{postCount} {postCount === 1 ? 'reply' : 'replies'}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
