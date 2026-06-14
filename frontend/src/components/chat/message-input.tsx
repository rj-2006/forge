import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

interface MessageInputProps {
  onSend: (content: string) => void
  onTyping?: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
  className,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || disabled) return

    onSend(content.trim())
    setContent('')
    
    if (isTypingRef.current) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      isTypingRef.current = false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    
    if (onTyping) {
      if (!isTypingRef.current) {
        isTypingRef.current = true
        onTyping()
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
      }, 2000)
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('bg-transparent px-4 pb-6 pt-1', className)}
    >
      <div className="flex items-center gap-3 rounded-lg bg-[#40444b] px-4 py-2.5">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex max-h-32 min-h-[24px] w-full resize-none bg-transparent text-sm text-snow placeholder:text-[#72767d]',
            'focus-visible:outline-none border-0 focus:ring-0 p-0',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-8 w-8 shrink-0 bg-transparent hover:bg-[#35393e] text-greyple hover:text-snow transition-colors rounded-full"
          disabled={disabled || !content.trim()}
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
              strokeWidth={2.5}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </Button>
      </div>
    </form>
  )
}
