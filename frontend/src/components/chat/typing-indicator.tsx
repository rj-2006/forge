import { cn } from '../../lib/utils'

interface TypingIndicatorProps {
  users: string[]
  className?: string
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const text = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing`
    : `${users[0]} and ${users.length - 1} others are typing`

  return (
    <div className={cn('flex items-center gap-2 px-4 py-1 text-xs text-[#b9bbbe] font-ginto font-medium', className)}>
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#dcddde]/70" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#dcddde]/70" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#dcddde]/70" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}...</span>
    </div>
  )
}
