import * as React from 'react'
import { Bell, Menu } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../stores/auth-store'
import { Sidebar } from './sidebar'
import { TopNavbar } from './top-navbar'

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ForumIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.993 1.993 0 01-1-1.75V5.25A1.993 1.993 0 019 4H5a2 2 0 00-2 2v6a2 2 0 001 2h2v4l.5-.5z" />
  </svg>
)

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const defaultNavSections = [
  {
    title: 'Workspace',
    items: [
      { label: 'Home', href: '/', icon: <HomeIcon /> },
      { label: 'Forum', href: '/app/forum', icon: <ForumIcon /> },
      { label: 'Chat', href: '/app/chat', icon: <ChatIcon /> },
    ],
  },
]

export function AppLayout({ children, className }: { children?: React.ReactNode; className?: string }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const navigate = useNavigate()
  
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={cn('flex h-screen w-full bg-background', className)}>
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          navSections={defaultNavSections}
        />
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              navSections={defaultNavSections}
              onCollapsedChange={() => {}}
              className="h-full"
            />
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar>
          <Button
            onClick={() => setMobileMenuOpen(true)}
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <TopNavbar.Brand className="min-w-0">
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold tracking-tight">TechTalk Workspace</p>
              <p className="truncate text-xs text-muted-foreground">Forum, chat, and projects in one place</p>
            </div>
          </TopNavbar.Brand>

          <TopNavbar.Search placeholder="Search discussions" className="ml-auto" />

          <TopNavbar.Content>
            <TopNavbar.Action label="Notifications">
              <Bell className="h-4 w-4" />
            </TopNavbar.Action>
            <TopNavbar.User 
              name={user?.username || "User"} 
              email={user?.email}
              avatar={user?.avatar}
              onClick={handleLogout}
            />
          </TopNavbar.Content>
        </TopNavbar>

        <div className="flex flex-1 overflow-hidden">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  )
}

export function AuthLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center",
        "bg-[#0E0F2D] bg-[radial-gradient(circle_at_top,rgba(88,101,242,0.15),transparent_45%)] p-4",
        className
      )}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blurple shadow-md shadow-blurple/20">
            <span className="text-2xl font-black text-snow select-none">T</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight font-ginto-nord text-snow uppercase">TechTalk</span>
        </div>
        {children}
      </div>
    </div>
  )
}
