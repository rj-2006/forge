import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const avatarSizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-primary text-primary-foreground',
        avatarSizes[size],
        className,
      )}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt={alt || 'User avatar'}
          className="aspect-square h-full w-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center font-medium"
        delayMs={200}
      >
        {fallback?.charAt(0)?.toUpperCase() || '?'}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  size?: AvatarProps['size']
  className?: string
}

export function AvatarGroup({ children, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const childArray = React.Children.toArray(children)
  const visible = childArray.slice(0, max)
  const remaining = childArray.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((child, index) => (
        <div key={index} className="relative ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background',
            avatarSizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
