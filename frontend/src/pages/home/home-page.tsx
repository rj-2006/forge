import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Hash,
  Mail,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Avatar, AvatarGroup } from '../../components/ui/avatar'
import type { Announcement, Event, HomepageData, TeamMember } from '../../types/api'

function parseSocialLinks(raw?: string) {
  try {
    return JSON.parse(raw || '{}') as Record<string, string>
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
    <Card className="border-border/70 bg-white/80 shadow-sm shadow-black/5 backdrop-blur-sm transition-colors hover:border-border">
      <CardContent className="flex items-start gap-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 text-foreground">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{helper}</p>
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
            className="group overflow-hidden border-border/70 bg-white/85 shadow-sm shadow-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar
                  src={resolveAssetUrl(member.avatar_url)}
                  alt={member.name}
                  fallback={member.name}
                  size="lg"
                  className="ring-1 ring-border/80"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
                      <p className="mt-1 text-sm text-primary">{member.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
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
                          className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
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
            className="border-border/70 bg-white/85 shadow-sm shadow-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-border/70 bg-muted/60 text-center">
                <span className="text-2xl font-semibold leading-none text-foreground">{format(eventDate, 'd')}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {format(eventDate, 'MMM')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {event.event_type}
                  </span>
                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {event.status}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{event.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{event.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {format(eventDate, 'EEE, MMM d')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {format(eventDate, 'h:mm a')}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <Hash className="h-4 w-4" />
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
          className="border-border/70 bg-white/85 shadow-sm shadow-black/5 transition-all duration-200 hover:border-primary/20"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {announcement.is_pinned && (
                    <span className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      Pinned
                    </span>
                  )}
                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {announcement.priority}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {announcement.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {announcement.content}
                  </p>
                </div>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 text-foreground md:flex">
                <Megaphone className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {announcement.author?.username || 'Club team'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
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
  const socials = parseSocialLinks(data.club.social_links)
  const yearsActive = Math.max(1, new Date().getFullYear() - data.club.founding_year)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_22%,#f8fafc_100%)] text-foreground">
      <div className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.92))]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-white shadow-sm shadow-black/5">
                <img
                  src={resolveAssetUrl(data.club.logo_url || '/Devign logo v1 pngV.png')}
                  alt={data.club.name}
                  className="h-7 w-auto"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">{data.club.name}</p>
                <p className="text-sm text-muted-foreground">{data.club.tagline}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" asChild>
                <a href="#team">Team</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#events">Events</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="#updates">Updates</a>
              </Button>
              <Button asChild>
                <Link to={isAuthenticated ? '/app/forum' : '/login'}>
                  {isAuthenticated ? 'Open workspace' : 'Member sign in'}
                </Link>
              </Button>
            </div>
          </header>

          <section className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm shadow-black/5 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Student-led club platform for builders, designers, and organizers
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                A home for your club, not just another forum.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                {data.club.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-11 rounded-xl px-6">
                  <Link to={isAuthenticated ? '/app/forum' : '/login'}>
                    {isAuthenticated ? 'Go to forum' : 'Sign in to continue'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-11 rounded-xl px-6">
                  <a href="#events">
                    See upcoming events
                  </a>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {data.club.contact_email}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Est. {data.club.founding_year}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              <Card className="overflow-hidden border-border/70 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur-sm">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      Club snapshot
                    </span>
                    <span className="text-sm text-muted-foreground">{yearsActive} year{yearsActive > 1 ? 's' : ''} active</span>
                  </div>
                  <CardTitle className="text-2xl tracking-tight">Everything members need in one place</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    Leadership, announcements, events, and a dedicated collaboration space designed like a real product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                      <p className="text-sm text-muted-foreground">Members</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{data.stats.total_members}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
                      <p className="text-sm text-muted-foreground">Discussions</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{data.stats.total_threads}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-slate-950 p-5 text-slate-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-300">Core team</p>
                      <span className="text-sm text-slate-400">{data.team.length} active</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <AvatarGroup>
                        {data.team.slice(0, 4).map((member) => (
                          <Avatar
                            key={member.id}
                            src={resolveAssetUrl(member.avatar_url)}
                            alt={member.name}
                            fallback={member.name}
                            size="md"
                            className="ring-slate-950"
                          />
                        ))}
                      </AvatarGroup>
                      <p className="max-w-[180px] text-right text-sm text-slate-300">
                        Join structured discussions, event updates, and project collaboration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {Object.keys(socials).length > 0 && (
                <Card className="border-border/70 bg-white/80 shadow-sm shadow-black/5">
                  <CardContent className="flex flex-wrap items-center gap-2 p-4">
                    {Object.entries(socials).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                      >
                        {socialLabel(platform)}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-20 px-6 py-16 lg:px-10 lg:py-20">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Active members"
            value={String(data.stats.total_members)}
            helper="Student builders and designers in the community"
          />
          <StatCard
            icon={<MessageSquareText className="h-5 w-5" />}
            label="Forum threads"
            value={String(data.stats.total_threads)}
            helper="Shared knowledge, project updates, and async discussion"
          />
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Events hosted"
            value={String(data.stats.total_events)}
            helper="Workshops, talks, hackathons, and weekly club sessions"
          />
          <StatCard
            icon={<Hash className="h-5 w-5" />}
            label="Chat spaces"
            value={String(data.stats.total_chatrooms)}
            helper="Focused rooms for collaboration and member coordination"
          />
        </section>

        <section id="team" className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Leadership
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              The people shaping the club experience.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              A visible leadership section builds trust. It shows who runs programs, who members can reach out to, and what the club stands behind.
            </p>
          </div>
          <TeamGrid team={data.team} />
        </section>

        <section id="events" className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Events
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Program your community around real moments.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Upcoming events should be obvious and easy to scan. This section gives your club a live operational heartbeat, not just a static brochure.
            </p>
          </div>
          <EventList events={data.events} />
        </section>

        <section id="updates" className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Updates
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Keep important information visible.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Announcements need more weight than ordinary posts. Pinned updates, deadline changes, and program news belong in a dedicated lane.
            </p>
          </div>
          <AnnouncementList announcements={data.announcements} />
        </section>
      </main>

      <footer className="border-t border-border/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-white shadow-sm shadow-black/5">
              <img
                src={resolveAssetUrl(data.club.logo_url || '/Devign logo v1 pngV.png')}
                alt={data.club.name}
                className="h-7 w-auto"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-foreground">{data.club.name}</p>
              <p className="text-sm text-muted-foreground">{data.club.tagline}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" asChild className="rounded-xl">
              <a href={`mailto:${data.club.contact_email}`}>
                Contact the club
              </a>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to={isAuthenticated ? '/app/chat' : '/login'}>
                {isAuthenticated ? 'Open chatrooms' : 'Sign in'}
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
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)] px-6">
      <Card className="w-full max-w-md border-border/70 bg-white/90 shadow-lg shadow-black/5">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Loading homepage</h2>
            <p className="text-sm text-muted-foreground">
              Pulling the latest club information, events, and announcements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)] px-6">
      <Card className="w-full max-w-lg border-border/70 bg-white/90 shadow-lg shadow-black/5">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/50 text-foreground">
            <Megaphone className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Homepage unavailable</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The club data could not be loaded right now. Check the API connection or try again in a moment.
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
