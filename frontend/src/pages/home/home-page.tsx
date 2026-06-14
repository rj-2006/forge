import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Hash,
  Megaphone,
  MessageSquareText,
  Sparkles,
  Users,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useHomepage } from '../../hooks/use-homepage'
import { useAuthStore } from '../../stores/auth-store'
import { resolveAssetUrl } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from '../../components/ui/avatar'
import type { Announcement, Event, HomepageData, TeamMember } from '../../types/api'

function parseSocialLinks(raw?: string | Record<string, string>) {
  if (typeof raw === 'object' && raw !== null) {
    return raw
  }
  try {
    return JSON.parse((raw as string) || '{}') as Record<string, string>
  } catch {
    return {}
  }
}

function socialLabel(platform: string) {
  const labels: Record<string, string> = {
    github: 'GitHub',
    discord: 'Discord',
    twitter: 'X',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    website: 'Website',
  }

  return labels[platform] || platform
}

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <Card className="border-dim-grey/30 bg-dark-charcoal/80 shadow-md backdrop-blur-sm transition-all hover:border-blurple/50">
      <CardContent className="flex items-start gap-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-dim-grey/40 bg-void text-blurple">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-fog">{label}</p>
          <p className="text-3xl font-black font-ginto-nord tracking-tight text-snow">{value}</p>
          <p className="text-sm text-greyple">{helper}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function TeamGrid({ team }: { team: TeamMember[] }) {
  const featured = team.slice(0, 6)

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {featured.map((member) => {
        const socials = parseSocialLinks(member.social_links)
        return (
          <Card
            key={member.id}
            className="group overflow-hidden border-dim-grey/30 bg-dark-charcoal/85 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blurple/40"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="size-12 ring-2 ring-blurple/30">
                  <AvatarImage src={resolveAssetUrl(member.avatar_url)} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold font-ginto-nord uppercase tracking-tight text-snow">{member.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-blurple">{member.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-fog">
                    {member.bio}
                  </p>
                  {Object.entries(socials).length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {Object.entries(socials).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-dim-grey/30 bg-void px-2.5 py-1 text-xs font-medium text-greyple transition-colors hover:border-blurple/40 hover:text-snow"
                        >
                          <span>{socialLabel(platform)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function EventList({ events }: { events: Event[] }) {
  return (
    <div className="space-y-4">
      {events.slice(0, 4).map((event) => {
        const eventDate = new Date(event.date)
        return (
          <Card
            key={event.id}
            className="border-dim-grey/30 bg-dark-charcoal/85 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blurple/40"
          >
            <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-dim-grey/30 bg-void text-center">
                <span className="text-2xl font-black font-ginto-nord leading-none text-snow">{format(eventDate, 'd')}</span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-fog">
                  {format(eventDate, 'MMM')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-blurple/30 bg-blurple/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blurple">
                    {event.event_type}
                  </span>
                  <span className="rounded-full border border-dim-grey/30 bg-void px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-spring-green">
                    {event.status}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold font-ginto-nord tracking-tight text-snow">{event.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-fog">{event.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-greyple">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-blurple" />
                    {format(eventDate, 'EEE, MMM d')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-blurple" />
                    {format(eventDate, 'h:mm a')}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <Hash className="h-4 w-4 text-blurple" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="space-y-4">
      {announcements.slice(0, 4).map((announcement) => (
        <Card
          key={announcement.id}
          className="border-dim-grey/30 bg-dark-charcoal/85 shadow-md transition-all duration-200 hover:border-blurple/40"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {announcement.is_pinned && (
                    <span className="rounded-full border border-fuchsia/30 bg-fuchsia/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-fuchsia">
                      Pinned
                    </span>
                  )}
                  <span className="rounded-full border border-dim-grey/30 bg-void px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-greyple">
                    {announcement.priority}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-ginto-nord tracking-tight text-snow">
                    {announcement.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-fog">
                    {announcement.content}
                  </p>
                </div>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-dim-grey/30 bg-void text-blurple md:flex">
                <Megaphone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-greyple">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blurple" />
                {announcement.author?.username || 'Club team'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-blurple" />
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function HomeShell({ data, isAuthenticated }: { data: HomepageData; isAuthenticated: boolean }) {
  return (
    <div className="min-h-screen bg-[#0E0F2D] text-snow">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0E0F2D]/80 backdrop-blur-md border-b border-dim-grey/20">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blurple shadow-md shadow-blurple/20">
              <span className="text-xl font-black text-snow select-none">T</span>
            </div>
            <div>
              <p className="text-sm font-extrabold font-ginto-nord uppercase tracking-tight text-snow">{data.club.name}</p>
              <p className="text-xs text-fog">{data.club.tagline}</p>
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <a href="#team" className="text-sm font-medium text-fog hover:text-snow transition-colors">Team</a>
            <a href="#events" className="text-sm font-medium text-fog hover:text-snow transition-colors">Events</a>
            <a href="#updates" className="text-sm font-medium text-fog hover:text-snow transition-colors">Updates</a>
            <Button asChild className="bg-snow text-not-quite-black hover:bg-off-white font-bold rounded-xl px-4 py-2 text-sm transition-all">
              <Link to={isAuthenticated ? '/app/forum' : '/login'}>
                {isAuthenticated ? 'Open Workspace' : 'Log In'}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-24 overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(88,101,242,0.15),transparent_40%),radial-gradient(circle_at_top_right,rgba(235,69,158,0.1),transparent_35%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <section className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1.2fr)_480px] lg:py-20 items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-dim-grey/30 bg-dark-charcoal/60 px-4.5 py-2 text-sm text-fog shadow-md backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blurple animate-pulse" />
                <span>The ultimate workspace for builders & designers</span>
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-black font-ginto-nord uppercase tracking-[-0.01em] text-snow sm:text-6xl lg:text-7xl leading-[0.95]">
                IMAGINE A PLACE...
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-fog font-ginto font-normal">
                {data.club.description}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="h-12 bg-blurple hover:bg-dark-blurple text-snow rounded-xl px-8 font-bold transition-all shadow-lg shadow-blurple/20">
                  <Link to={isAuthenticated ? '/app/forum' : '/login'}>
                    {isAuthenticated ? 'Go to workspace' : 'Open in Browser'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 border-snow text-snow hover:bg-snow hover:text-void rounded-xl px-8 font-bold transition-all">
                  <a href="#events">
                    See upcoming events
                  </a>
                </Button>
              </div>
            </div>

            {/* Simulated Client Mockup */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0">
              {/* Outer macOS style client window */}
              <div className="w-full rounded-2xl bg-void border border-dim-grey/40 shadow-2xl overflow-hidden flex flex-col h-96">
                {/* Top window bar */}
                <div className="h-10 bg-dark-charcoal border-b border-void flex items-center px-4 justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-xs font-bold text-greyple font-mono">techtalk-client.app</span>
                  <div className="w-10" />
                </div>
                
                {/* Client workspace panels */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left Mock Sidebar */}
                  <div className="w-36 bg-dark-charcoal/70 border-r border-void/50 p-2 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-greyple uppercase tracking-wider px-2 mb-1">channels</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#35393e] text-snow text-xs font-medium">
                      <span>#</span> general
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 text-greyple hover:text-snow text-xs font-medium">
                      <span>#</span> help-desk
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 text-greyple hover:text-snow text-xs font-medium">
                      <span>#</span> showcase
                    </div>
                  </div>

                  {/* Main Mock Chat Stream */}
                  <div className="flex-1 bg-not-quite-black p-4 flex flex-col justify-end gap-3 font-ginto">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-blurple flex items-center justify-center text-xs font-bold text-snow">BOT</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-snow">TechTalk Bot</span>
                          <span className="text-[9px] text-greyple">Today at 4:00 AM</span>
                        </div>
                        <p className="text-xs text-fog mt-0.5">Welcome! Start coding together, discussing ideas in the forums, and planning events.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-snow">U</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-snow">NewMember</span>
                          <span className="text-[9px] text-greyple">Today at 4:02 AM</span>
                        </div>
                        <p className="text-xs text-fog mt-0.5">Hello team! Excited to join this awesome workspace.</p>
                      </div>
                    </div>

                    <div className="h-8 rounded-lg bg-dark-charcoal border border-void/30 flex items-center px-3 mt-2">
                      <span className="text-xs text-greyple">Message #general</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative Mascot overlapping client */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tr from-fuchsia to-blurple rounded-full blur-md opacity-40 z-[-1]" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blurple/20 rounded-full blur-lg z-[-1]" />
            </div>
          </section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-24 px-6 py-16 lg:px-10 lg:py-24">
        {/* Stats Section */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Active members"
            value={String(data.stats.total_members)}
            helper="Student builders and designers"
          />
          <StatCard
            icon={<MessageSquareText className="h-5 w-5" />}
            label="Forum threads"
            value={String(data.stats.total_threads)}
            helper="Shared knowledge and updates"
          />
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Events hosted"
            value={String(data.stats.total_events)}
            helper="Hackathons and talks"
          />
          <StatCard
            icon={<Hash className="h-5 w-5" />}
            label="Chat spaces"
            value={String(data.stats.total_chatrooms)}
            helper="Focused rooms for cooperation"
          />
        </section>

        {/* Feature showcase card */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blurple to-fuchsia rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8 border border-snow/10">
          <div className="flex-1 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-snow/80 bg-snow/10 px-3 py-1 rounded-full w-max block">
              Club Snapshot
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-ginto-nord uppercase text-snow tracking-tight leading-none">
              Everything members need in one place
            </h2>
            <p className="text-snow/90 text-sm md:text-base leading-relaxed max-w-lg font-ginto">
              Leadership directory, pinned updates, real-time events tracker, and structured forum discussions to keep everything organized.
            </p>
          </div>
          <div className="w-full md:w-80 bg-void/40 backdrop-blur-md p-6 rounded-2xl border border-snow/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-fog mb-4">Core Team Status</h4>
            <div className="flex items-center justify-between gap-4">
              <AvatarGroup>
                {data.team.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    className="size-10 ring-2 ring-background ring-dark-charcoal"
                  >
                    <AvatarImage src={resolveAssetUrl(member.avatar_url)} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="text-xs font-bold text-spring-green bg-spring-green/10 px-2.5 py-1 rounded-full">
                {data.team.length} Active
              </span>
            </div>
            <p className="text-xs text-greyple mt-4">Active contributors shape daily programs and manage chat spaces.</p>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-dim-grey/30 bg-dark-charcoal px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-fog">
              Leadership
            </span>
            <h2 className="text-3xl font-extrabold font-ginto-nord uppercase tracking-tight text-snow sm:text-4xl">
              Meet the organizers
            </h2>
            <p className="text-base leading-7 text-fog font-ginto">
              Our active officers curate workshops, maintain resources, and coordinate with student groups.
            </p>
          </div>
          <TeamGrid team={data.team} />
        </section>

        {/* Events Section */}
        <section id="events" className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-dim-grey/30 bg-dark-charcoal px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-fog">
              Events
            </span>
            <h2 className="text-3xl font-extrabold font-ginto-nord uppercase tracking-tight text-snow sm:text-4xl">
              Upcoming Actions
            </h2>
            <p className="text-base leading-7 text-fog font-ginto">
              Join active workshops, tech sessions, hackathons, and weekly meetups.
            </p>
          </div>
          <EventList events={data.events} />
        </section>

        {/* Updates Section */}
        <section id="updates" className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-dim-grey/30 bg-dark-charcoal px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-fog">
              Updates
            </span>
            <h2 className="text-3xl font-extrabold font-ginto-nord uppercase tracking-tight text-snow sm:text-4xl">
              Latest Bulletin
            </h2>
            <p className="text-base leading-7 text-fog font-ginto">
              Keep track of deadline announcements, schedule updates, and notifications.
            </p>
          </div>
          <AnnouncementList announcements={data.announcements} />
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-dim-grey/20 bg-dark-charcoal/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blurple shadow-md shadow-blurple/20">
              <span className="text-2xl font-black text-snow select-none">T</span>
            </div>
            <div>
              <p className="text-base font-extrabold font-ginto-nord uppercase tracking-tight text-snow">{data.club.name}</p>
              <p className="text-sm text-fog">{data.club.tagline}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild className="border-dim-grey/40 text-snow hover:bg-void rounded-xl">
              <a href={`mailto:${data.club.contact_email}`}>
                Contact Team
              </a>
            </Button>
            <Button asChild className="bg-blurple hover:bg-dark-blurple text-snow rounded-xl">
              <Link to={isAuthenticated ? '/app/chat' : '/login'}>
                {isAuthenticated ? 'Open Client' : 'Join TechTalk'}
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0F2D] px-6">
      <Card className="w-full max-w-md border-dim-grey/30 bg-dark-charcoal text-snow shadow-xl p-2 rounded-xl">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-blurple/20 border-t-blurple" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold font-ginto-nord tracking-tight text-snow uppercase">Loading workspace</h2>
            <p className="text-sm text-fog">
              Pulling latest club information, events, and bulletins.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0F2D] px-6">
      <Card className="w-full max-w-lg border-dim-grey/30 bg-dark-charcoal text-snow shadow-xl p-2 rounded-xl">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-dim-grey/30 bg-void text-ekko-red">
            <Megaphone className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-2xl font-bold font-ginto-nord tracking-tight text-snow uppercase">Workspace Unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-fog">
            The workspace data could not be loaded. Please check the network connection and try again.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function HomePage() {
  const { data, isLoading, error } = useHomepage()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isLoading) {
    return <LoadingState />
  }

  if (error || !data) {
    return <ErrorState />
  }

  return <HomeShell data={data} isAuthenticated={isAuthenticated} />
}
