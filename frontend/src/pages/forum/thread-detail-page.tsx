import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useThread, useCreatePost, useAddReaction, useRemoveReaction } from '../../hooks/use-threads'
import { useAuthStore } from '../../stores/auth-store'
import { PageContainer, PageContent } from '../../components/layout/page-container'
import { Button } from '../../components/ui/button'
import { ErrorBoundary } from '../../components/error-boundary'
import { formatDistanceToNow } from 'date-fns'
import { cn, resolveAssetUrl } from '../../lib/utils'
import { ReactionButton } from '../../components/forum/reaction-button'
import { ThreadDetailSkeleton } from '../../components/forum/thread-skeleton'
import { EmptyState } from '../../components/layout/protected-route'
import React from 'react'

export function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const threadId = Number(id)
  const [newPost, setNewPost] = useState('')
  
  const { data: thread, isLoading, error } = useThread(threadId)
  const createPost = useCreatePost(threadId)
  const addReaction = useAddReaction(threadId)
  const removeReaction = useRemoveReaction(threadId)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userId = useAuthStore((state) => state.user?.id)

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() || !isAuthenticated) return
    
    await createPost.mutateAsync(newPost)
    setNewPost('')
  }

  const handleAddReaction = async (emoji: string) => {
    if (!isAuthenticated) return
    await addReaction.mutateAsync(emoji)
  }

  const handleRemoveReaction = async (emoji: string) => {
    if (!isAuthenticated) return
    await removeReaction.mutateAsync(emoji)
  }

  // FIXED: Logic to process reactions from the backend correctly
  const reactions = useMemo(() => {
    if (!thread?.reactions) return []
    
    return thread.reactions.reduce((acc, reaction) => {
      const existing = acc.find((r) => r.emoji === reaction.emoji)
      
      // Check both reaction.user_id and reaction.user?.id to be safe
      const hasUserReacted = userId && (reaction.user_id === userId || reaction.user?.id === userId)

      if (existing) {
        existing.count++
        if (hasUserReacted) {
          existing.hasReacted = true
        }
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          hasReacted: !!hasUserReacted,
        })
      }
      return acc
    }, [] as { emoji: string; count: number; hasReacted: boolean }[])
  }, [thread?.reactions, userId])

  if (isLoading) {
    return (
      <PageContainer className="bg-not-quite-black flex-1 overflow-auto">
        <PageContent>
          <ThreadDetailSkeleton />
        </PageContent>
      </PageContainer>
    )
  }

  if (error || !thread) {
    return (
      <PageContainer className="bg-not-quite-black flex-1 overflow-auto">
        <PageContent>
          <EmptyState
            title="Thread not found"
            description="This thread may have been deleted or doesn't exist"
          />
        </PageContent>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="bg-not-quite-black flex-1 overflow-auto p-0">
      <PageContent className="px-6 py-8">
        <ErrorBoundary>
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 text-[#8e9297] hover:text-snow hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to forum
          </Button>

          <article className="rounded-xl border border-dim-grey/30 bg-dark-charcoal p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blurple text-snow text-base font-bold select-none shadow-sm">
                {thread.user?.username?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <Link
                  to={`/user/${thread.user?.username}`}
                  className="font-bold text-snow hover:underline"
                >
                  {thread.user?.username}
                </Link>
                <p className="text-xs font-semibold text-greyple">
                  {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-black font-ginto-nord uppercase tracking-tight text-snow mb-4">{thread.title}</h1>

            {thread.images && thread.images.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {thread.images.map((image, index) => (
                  <img
                    key={image.id || index}
                    src={resolveAssetUrl(image.url)}
                    alt={image.caption || ''}
                    className={cn(
                      'rounded-md object-cover bg-void border border-dim-grey/20',
                      thread.images!.length === 1 ? 'max-h-96 w-full' : 'h-48 w-full'
                    )}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-dim-grey/30">
              <ReactionButton
                reactions={reactions}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </article>

          <div className="space-y-4">
            <h2 className="text-lg font-bold font-ginto text-snow">
              {thread.posts?.length || 0} {thread.posts?.length === 1 ? 'Reply' : 'Replies'}
            </h2>

            {isAuthenticated ? (
              <form onSubmit={handleSubmitPost} className="rounded-xl border border-dim-grey/30 bg-dark-charcoal p-4 space-y-3">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Write a reply..."
                  className={cn(
                    'flex w-full rounded-md border border-dim-grey bg-void px-3 py-2 text-sm text-snow placeholder:text-greyple',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blurple focus:border-blurple',
                    'min-h-[100px]'
                  )}
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-blurple hover:bg-dark-blurple text-snow font-bold text-sm px-4 py-2 rounded shadow-sm transition-colors"
                    disabled={!newPost.trim() || createPost.isPending}
                  >
                    Send Reply
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl border border-dim-grey/30 bg-dark-charcoal p-5 text-center text-sm text-greyple font-medium">
                <p>
                  You must <Link to="/login" className="text-vivid-cerulean hover:underline font-bold">sign in</Link> to post a reply.
                </p>
              </div>
            )}

            {thread.posts && thread.posts.length > 0 ? (
              <div className="space-y-3">
                {thread.posts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-dim-grey/30 bg-dark-charcoal/80 p-4 transition-all hover:bg-dark-charcoal">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blurple text-snow font-bold text-xs select-none">
                        {post.user?.username?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <Link
                          to={`/user/${post.user?.username}`}
                          className="font-bold text-snow hover:underline text-sm"
                        >
                          {post.user?.username}
                        </Link>
                        <p className="text-[10px] font-semibold text-greyple">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-fog whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-center text-greyple font-semibold py-8 text-sm">
                No replies yet. Be the first to respond!
              </p>
            )}
          </div>
        </div>
        </ErrorBoundary>
      </PageContent>
    </PageContainer>
  )
}
