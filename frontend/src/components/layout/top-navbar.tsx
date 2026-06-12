import * as React from 'react'
import { Bell, LogOut, Search } from 'lucide-react'
import { Avatar } from '../ui/avatar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { cn, resolveAssetUrl } from '../../lib/utils'

interface TopNavbarProps {
  className?: string
  children?: React.ReactNode
}

export function TopNavbar({ className, children }: TopNavbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6',
        className,
      )}
    >
      {children}
    </header>
  )
}

interface TopNavbarBrandProps {
  className?: string
  children?: React.ReactNode
}

export function TopNavbarBrand({ className, children }: TopNavbarBrandProps) {
  return <div className={cn('flex items-center gap-2', className)}>{children}</div>
}

interface TopNavbarContentProps {
  className?: string
  children?: React.ReactNode
}

export function TopNavbarContent({ className, children }: TopNavbarContentProps) {
  return <div className={cn('flex flex-1 items-center justify-end gap-2', className)}>{children}</div>
}

interface TopNavbarSearchProps {
  className?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export function TopNavbarSearch({
  className,
  placeholder = 'Search...',
  value,
  onChange,
}: TopNavbarSearchProps) {
  return (
    <div className={cn('relative hidden w-full max-w-sm lg:block', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-10 border-border/70 bg-muted/40 pl-9 shadow-none"
      />
    </div>
  )
}

interface TopNavbarActionProps {
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  label?: string
}

export function TopNavbarAction({
  className,
  children,
  onClick,
  label,
}: TopNavbarActionProps) {
  return (
    <Button
      onClick={onClick}
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-9 w-9 text-muted-foreground', className)}
      aria-label={label}
    >
      {children}
    </Button>
  )
}

interface TopNavbarUserProps {
  className?: string
  name?: string
  email?: string
  avatar?: string
  onClick?: () => void
}

export function TopNavbarUser({
  className,
  name,
  email,
  avatar,
  onClick,
}: TopNavbarUserProps) {
  return (
    <Button
      onClick={onClick}
      type="button"
      variant="ghost"
      className={cn('h-auto gap-3 rounded-xl px-2 py-2', className)}
      aria-label={onClick ? `User menu: ${name}` : undefined}
    >
      <Avatar
        src={resolveAssetUrl(avatar)}
        alt={name || 'User avatar'}
        fallback={name}
        size="sm"
      />
      <div className="hidden min-w-0 flex-col items-start text-left text-sm lg:flex">
        <span className="font-medium">{name}</span>
        {email && (
          <span className="text-xs text-muted-foreground">{email}</span>
        )}
      </div>
      {onClick ? <LogOut className="hidden h-4 w-4 text-muted-foreground lg:block" /> : null}
    </Button>
  )
}

TopNavbar.Brand = TopNavbarBrand
TopNavbar.Content = TopNavbarContent
TopNavbar.Search = TopNavbarSearch
TopNavbar.Action = TopNavbarAction
TopNavbar.User = TopNavbarUser

export function TopNavbarNotifications({ className }: { className?: string }) {
  return (
    <TopNavbarAction className={className} label="Notifications">
      <Bell className="h-4 w-4" />
    </TopNavbarAction>
  )
}
