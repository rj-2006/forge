import * as React from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}

interface NavSection {
  title?: string
  items: NavItem[]
}

interface SidebarProps {
  navSections: NavSection[]
  className?: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

interface SidebarItemProps {
  item: NavItem
  collapsed?: boolean
  active?: boolean
}

function SidebarItem({ item, collapsed, active }: SidebarItemProps) {
  return (
    <Link
      to={item.href}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-foreground ring-1 ring-primary/15'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        collapsed && 'justify-center px-2',
      )}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center',
          active ? 'text-primary' : 'text-current',
        )}
        aria-hidden="true"
      >
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground" aria-label={`${item.badge} notifications`}>
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

export function Sidebar({
  navSections,
  className,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border/70 bg-card/70 backdrop-blur transition-all duration-200 h-full',
        collapsed ? 'w-[80px]' : 'w-[280px]',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-border/70 px-4',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
          T
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">TechTalk</p>
            <p className="text-xs text-muted-foreground">Club workspace</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-6">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title || sectionIndex}>
              {section.title && !collapsed && (
                <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {section.title}
                </h3>
              )}
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    active={location.pathname === item.href}
                  />
                ))}
              </div>
              {sectionIndex < navSections.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      {onCollapsedChange && (
        <div className="border-t p-3">
          <Button
            onClick={() => onCollapsedChange(!collapsed)}
            type="button"
            variant="ghost"
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground',
              collapsed && 'justify-center px-2',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180',
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </Button>
        </div>
      )}
    </aside>
  )
}
