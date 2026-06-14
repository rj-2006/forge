import { useState } from 'react'
import { useThreads, useCreateThread, useAddReaction, useRemoveReaction } from '../../hooks/use-threads'
import { useAuthStore } from '../../stores/auth-store'
import { PageContainer, PageHeader, PageTitle, PageDescription, PageActions } from '../../components/layout/page-container'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ThreadCard } from '../../components/forum/thread-card'
import { ThreadListSkeleton } from '../../components/forum/thread-skeleton'
import { CreateThreadModal } from '../../components/forum/create-thread-modal'
import { EmptyState } from '../../components/layout/protected-route'

export function ThreadListPage() {
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  
  const { data, isLoading, error } = useThreads({ search })
  const createThread = useCreateThread()
  const addReaction = useAddReaction()
  const removeReaction = useRemoveReaction()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentUserId = useAuthStore((state) => state.user?.id)

  const handleCreateThread = async (data: { title: string; content?: string; images?: File[] }) => {
    try {
      setCreateError(null)
      await createThread.mutateAsync(data)
      setShowCreateModal(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create thread')
    }
  }

  const handleAddReaction = (threadId: number) => async (emoji: string) => {
    if (!isAuthenticated) return
    await addReaction.mutateAsync({ threadId, emoji })
  }

  const handleRemoveReaction = (threadId: number) => async (emoji: string) => {
    if (!isAuthenticated) return
    await removeReaction.mutateAsync({ threadId, emoji })
  }

  return (
    <PageContainer className="bg-not-quite-black flex-1 overflow-hidden p-0">
      <PageHeader className="flex-row items-center justify-between border-b border-void/50 bg-[#36393f] py-3 px-6">
        <div>
          <PageTitle className="font-ginto-nord uppercase font-black text-xl tracking-tight text-snow">Forum</PageTitle>
          <PageDescription className="text-xs text-greyple font-semibold">Discuss tech projects and collaborate with others</PageDescription>
        </div>
        <PageActions>
          {isAuthenticated && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blurple hover:bg-dark-blurple text-snow rounded px-4 py-2 font-bold text-sm shadow-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Thread
            </Button>
          )}
        </PageActions>
      </PageHeader>

      <div className="flex-1 overflow-auto px-6 py-5">
        {/* Search */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search threads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md bg-void border-dim-grey text-snow placeholder:text-greyple focus-visible:ring-blurple h-10"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <ThreadListSkeleton />
        ) : error ? (
          <EmptyState
            title="Failed to load threads"
            description="Something went wrong. Please try again."
          />
        ) : data && data.length > 0 ? (
          <div className="space-y-4 max-w-5xl">
            {data.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onAddReaction={handleAddReaction(thread.id)}
                onRemoveReaction={handleRemoveReaction(thread.id)}
                isAuthenticated={isAuthenticated}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : search ? (
          <EmptyState
            title="No threads found"
            description="Try a different search term"
          />
        ) : (
          <EmptyState
            title="No threads yet"
            description="Be the first to start a discussion"
            action={
              isAuthenticated ? (
                <Button onClick={() => setShowCreateModal(true)} className="bg-blurple hover:bg-dark-blurple text-snow rounded px-4 py-2 font-bold text-sm shadow-sm transition-colors">
                  Create Thread
                </Button>
              ) : undefined
            }
          />
        )}
      </div>

      <CreateThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateThread}
        isLoading={createThread.isPending}
        error={createError}
      />
    </PageContainer>
  )
}
