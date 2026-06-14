import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import FancyCarousel from 'react-fancy-circular-carousel'
import 'react-fancy-circular-carousel/FancyCarousel.css'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  Hash,
  MessageSquareText,
  Users,
  ChevronLeft,
  ChevronRight,
  Megaphone
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useHomepage } from '../../hooks/use-homepage'
import { useAuthStore } from '../../stores/auth-store'
import { resolveAssetUrl } from '../../lib/utils'
import { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from '../../components/ui/avatar'
import type { Announcement, Event, HomepageData, TeamMember } from '../../types/api'

function parseSocialLinks(raw?: string | Record<string, string>) {
  if (typeof raw === 'object' && raw !== null) return raw
  try { return JSON.parse((raw as string) || '{}') as Record<string, string> } 
  catch { return {} }
}

function socialLabel(platform: string) {
  const labels: Record<string, string> = {
    github: 'GitHub', discord: 'Discord', twitter: 'X', instagram: 'Instagram', linkedin: 'LinkedIn', website: 'Website',
  }
  return labels[platform] || platform
}

function StatCard({ icon, label, value, helper }: { icon: React.ReactNode, label: string, value: string, helper: string }) {
  return (
    <div className="bg-[#0A0A0A] p-6 rounded-none transition-colors hover:bg-[#111111] flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-black text-white rounded-full">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p>
        <p className="text-4xl font-black font-ginto-nord tracking-tight text-white">{value}</p>
        <p className="text-sm text-neutral-400">{helper}</p>
      </div>
    </div>
  )
}

function TeamGrid({ team }: { team: TeamMember[] }) {
  const featured = team.slice(0, 6)
  const [focusElement, setFocusElement] = useState(0)

  if (!featured || featured.length === 0) {
    return <div className="text-neutral-500">No team members to display.</div>
  }

  const images = featured.map(member => resolveAssetUrl(member.avatar_url))
  const activeMember = featured[focusElement] || featured[0]
  const socials = activeMember ? parseSocialLinks(activeMember.social_links) : {}

  const handlePrev = useCallback(() => {
    const btn = document.querySelectorAll('.fancy-carousel-navigation-button')[0] as HTMLButtonElement
    if (btn) btn.click()
  }, [])

  const handleNext = useCallback(() => {
    const btn = document.querySelectorAll('.fancy-carousel-navigation-button')[1] as HTMLButtonElement
    if (btn) btn.click()
  }, [])

  return (
    <div className="flex flex-col md:flex-row items-center gap-16 w-full mt-12">
      <style>{`
        .fancy-carousel-navigators {
          display: none !important;
          pointer-events: none;
        }
        .fancy-carousel-element img {
          object-fit: cover;
        }
        .central-img img {
          object-fit: cover;
        }
      `}</style>
      
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative min-h-[400px]">
        {/* Custom Navigation */}
        <button onClick={handlePrev} className="absolute left-0 z-10 p-4 bg-[#0A0A0A] text-white hover:bg-white hover:text-black transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={handleNext} className="absolute right-0 z-10 p-4 bg-[#0A0A0A] text-white hover:bg-white hover:text-black transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>

        <FancyCarousel 
          images={images}
          setFocusElement={setFocusElement}
          carouselRadius={180}
          peripheralImageRadius={40}
          centralImageRadius={70}
          focusElementStyling={{border: 'none', boxShadow: '0 0 40px rgba(255,255,255,0.1)'}}
          autoRotateTime={0}
          transitionTime={0.8}
        />
      </div>

      <div className="w-full md:w-1/2">
        {activeMember && (
          <div className="bg-[#0A0A0A] p-10 transition-all duration-300 shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6 pb-6">
                <Avatar className="size-20 rounded-none bg-black">
                  <AvatarImage src={resolveAssetUrl(activeMember.avatar_url)} alt={activeMember.name} />
                  <AvatarFallback className="rounded-none bg-black text-white">{activeMember.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-3xl font-black font-ginto-nord uppercase tracking-tight text-white">{activeMember.name}</h3>
                  <p className="mt-1 text-lg font-medium text-neutral-400">{activeMember.role}</p>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-neutral-300 whitespace-pre-wrap">
                {activeMember.bio}
              </p>
              {Object.entries(socials).length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {Object.entries(socials).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black"
                    >
                      <span>{socialLabel(platform)}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EventList({ events }: { events: Event[] }) {
  return (
    <div className="space-y-4">
      {events.slice(0, 4).map((event) => {
        const eventDate = new Date(event.date)
        return (
          <div key={event.id} className="bg-[#0A0A0A] p-6 hover:bg-[#111111] transition-colors flex flex-col md:flex-row gap-6">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center bg-black text-center">
              <span className="text-3xl font-black font-ginto-nord leading-none text-white">{format(eventDate, 'd')}</span>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                {format(eventDate, 'MMM')}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-[#111111] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                  {event.event_type}
                </span>
                <span className="bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-black">
                  {event.status}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold font-ginto-nord tracking-tight text-white">{event.title}</h3>
              <p className="mt-2 line-clamp-2 text-base leading-relaxed text-neutral-400">{event.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-neutral-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {format(eventDate, 'EEE, MMM d')}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {format(eventDate, 'h:mm a')}
                </span>
                {event.location && (
                  <span className="inline-flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
  return (
    <div className="space-y-4">
      {announcements.slice(0, 4).map((announcement) => (
        <div key={announcement.id} className="bg-[#0A0A0A] p-8 hover:bg-[#111111] transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {announcement.is_pinned && (
                  <span className="bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Pinned
                  </span>
                )}
                <span className="bg-[#111111] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                  {announcement.priority}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-ginto-nord tracking-tight text-white">
                  {announcement.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-neutral-400">
                  {announcement.content}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-neutral-500">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {announcement.author?.username || 'Club team'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function HomeShell({ data, isAuthenticated }: { data: HomepageData; isAuthenticated: boolean }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* Ultra Minimal Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-white">
              <span className="text-xl font-black text-black select-none">T</span>
            </div>
            <div>
              <p className="text-base font-extrabold font-ginto-nord uppercase tracking-tight text-white">{data.club.name}</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#team" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Team</a>
            <a href="#events" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Events</a>
            <a href="#updates" className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Updates</a>
            <Link to={isAuthenticated ? '/app/forum' : '/login'} className="text-sm font-bold uppercase tracking-widest bg-white text-black px-6 py-3 hover:bg-neutral-200 transition-colors">
              {isAuthenticated ? 'Workspace' : 'Log In'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <section className="grid gap-16 lg:grid-cols-[1fr_500px] items-center">
            <div className="max-w-3xl">
              <h1 className="text-6xl font-black font-ginto-nord uppercase tracking-tighter text-white sm:text-7xl lg:text-8xl leading-[0.9]">
                IMAGINE<br />A PLACE.
              </h1>
              <p className="mt-8 max-w-xl text-xl leading-relaxed text-neutral-400">
                {data.club.description}
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Link to={isAuthenticated ? '/app/forum' : '/login'} className="inline-flex justify-center items-center h-14 bg-white text-black px-10 font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">
                  {isAuthenticated ? 'Go to workspace' : 'Open in Browser'}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Stark Minimal Client Mockup */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0">
              <div className="w-full bg-[#0A0A0A] overflow-hidden flex flex-col h-[450px] shadow-2xl">
                {/* Top window bar */}
                <div className="h-12 bg-black flex items-center px-6 justify-between">
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 bg-neutral-700" />
                    <span className="w-2.5 h-2.5 bg-neutral-700" />
                    <span className="w-2.5 h-2.5 bg-neutral-700" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">techtalk.exe</span>
                  <div className="w-10" />
                </div>
                
                {/* Client workspace panels */}
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-40 bg-[#050505] p-4 flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-2">channels</span>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] text-white text-xs font-bold uppercase tracking-wider">
                      <span>#</span> general
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-white text-xs font-bold uppercase tracking-wider">
                      <span>#</span> showcase
                    </div>
                  </div>

                  <div className="flex-1 bg-[#0A0A0A] p-6 flex flex-col justify-end gap-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-white flex items-center justify-center text-xs font-black text-black">SYS</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-wider">System</span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1 leading-relaxed">Welcome. Start coding together.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 bg-[#111111] flex items-center justify-center text-xs font-black text-white">U</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white uppercase tracking-wider">User</span>
                        </div>
                        <p className="text-sm text-neutral-400 mt-1 leading-relaxed">Hello team. Ready to build.</p>
                      </div>
                    </div>

                    <div className="h-12 bg-black flex items-center px-4 mt-4">
                      <span className="text-xs text-neutral-600 font-bold uppercase tracking-widest">Message #general</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-32 px-6 py-20 lg:px-10">
        <section className="grid gap-1 md:grid-cols-2 xl:grid-cols-4 bg-black">
          <StatCard icon={<Users className="h-5 w-5" />} label="Active members" value={String(data.stats.total_members)} helper="Student builders" />
          <StatCard icon={<MessageSquareText className="h-5 w-5" />} label="Discussions" value={String(data.stats.total_threads)} helper="Shared knowledge" />
          <StatCard icon={<CalendarDays className="h-5 w-5" />} label="Events" value={String(data.stats.total_events)} helper="Hackathons" />
          <StatCard icon={<Hash className="h-5 w-5" />} label="Spaces" value={String(data.stats.total_chatrooms)} helper="Focused rooms" />
        </section>

        <section className="bg-[#0A0A0A] p-12 md:p-16 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Snapshot</span>
            <h2 className="text-4xl md:text-5xl font-black font-ginto-nord uppercase text-white tracking-tighter leading-none">
              Everything in one place.
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
              Directory, pinned updates, real-time events, and structured forum discussions. No borders. Pure focus.
            </p>
          </div>
          <div className="w-full md:w-96 bg-black p-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6">Core Status</h4>
            <div className="flex items-center justify-between gap-4">
              <AvatarGroup>
                {data.team.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className="size-12 bg-[#111]">
                    <AvatarImage src={resolveAssetUrl(member.avatar_url)} alt={member.name} />
                    <AvatarFallback className="bg-[#111] text-white">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="text-xs font-black text-black bg-white px-3 py-1.5 uppercase tracking-widest">
                {data.team.length} Active
              </span>
            </div>
          </div>
        </section>

        <section id="team" className="space-y-12">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Leadership</span>
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Organizers</h2>
          </div>
          <TeamGrid team={data.team} />
        </section>

        <section id="events" className="grid gap-12 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Events</span>
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Actions</h2>
          </div>
          <EventList events={data.events} />
        </section>

        <section id="updates" className="grid gap-12 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 block">Updates</span>
            <h2 className="text-5xl font-black font-ginto-nord uppercase tracking-tighter text-white">Bulletin</h2>
          </div>
          <AnnouncementList announcements={data.announcements} />
        </section>
      </main>

      <footer className="bg-[#0A0A0A] mt-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center bg-white text-black">
              <span className="text-3xl font-black select-none">T</span>
            </div>
            <div>
              <p className="text-2xl font-black font-ginto-nord uppercase tracking-tighter text-white">{data.club.name}</p>
              <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest">{data.club.tagline}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href={`mailto:${data.club.contact_email}`} className="bg-[#111111] text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 transition-colors text-center">
              Contact
            </a>
            <Link to={isAuthenticated ? '/app/chat' : '/login'} className="bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-neutral-200 transition-colors text-center">
              {isAuthenticated ? 'Open Client' : 'Join TechTalk'}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-md bg-[#0A0A0A] p-12 text-center flex flex-col items-center gap-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-800 border-t-white" />
        <div className="space-y-2">
          <h2 className="text-xl font-black font-ginto-nord tracking-tighter text-white uppercase">Loading</h2>
          <p className="text-sm text-neutral-500 uppercase tracking-widest">Pulling data</p>
        </div>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6">
      <div className="w-full max-w-lg bg-[#0A0A0A] p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#111111] text-white mb-6">
          <Megaphone className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-black font-ginto-nord tracking-tighter text-white uppercase">Unavailable</h2>
        <p className="mt-4 text-base text-neutral-500">
          The workspace data could not be loaded.
        </p>
      </div>
    </div>
  )
}

export function HomePage() {
  const { data, isLoading, error } = useHomepage()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isLoading) return <LoadingState />
  if (error || !data) return <ErrorState />

  return <HomeShell data={data} isAuthenticated={isAuthenticated} />
}
