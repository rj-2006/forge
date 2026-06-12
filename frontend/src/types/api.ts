export interface User {
  id: number
  username: string
  email: string
  avatar?: string
  created_at?: string
  updated_at?: string
}

export interface AuthTokens {
  accessToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Thread {
  id: number
  title: string
  user_id: number
  user: User
  posts: Post[]
  images: ThreadImage[]
  reactions: ThreadReaction[]
  created_at: string
  updated_at: string
}

export interface Post {
  id: number
  content: string
  thread_id: number
  user_id: number
  user: User
  created_at: string
  updated_at: string
}

export interface ThreadImage {
  id: number
  thread_id: number
  url: string
  caption?: string
}

export interface ThreadReaction {
  id: number
  thread_id: number
  user_id: number
  user: User
  emoji: string
  created_at: string
}

export interface Chatroom {
  id: number
  name: string
  description?: string
  created_by: number
  created_at: string
  active_users?: number
}

export interface ChatMessage {
  id: number
  chatroom_id: number
  user_id: number
  user: User
  content: string
  created_at: string
  reactions: MessageReaction[]
}

export interface MessageReaction {
  id: number
  message_id: number
  user_id: number
  user: User
  emoji: string
  created_at: string
}

// ── Club Homepage Types ──

export interface ClubConfig {
  id: number
  name: string
  tagline: string
  description: string
  logo_url: string
  hero_image_url: string
  social_links: string // JSON string
  founding_year: number
  contact_email: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  avatar_url: string
  social_links: string // JSON string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Event {
  id: number
  title: string
  description: string
  date: string
  end_date?: string
  location: string
  event_type: 'workshop' | 'meetup' | 'hackathon' | 'talk'
  status: 'upcoming' | 'ongoing' | 'completed'
  image_url: string
  registration_link: string
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  priority: 'normal' | 'high' | 'urgent'
  is_pinned: boolean
  author_id: number
  author: User
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface HomepageStats {
  total_members: number
  total_threads: number
  total_chatrooms: number
  total_events: number
}

export interface HomepageData {
  club: ClubConfig
  team: TeamMember[]
  events: Event[]
  announcements: Announcement[]
  stats: HomepageStats
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

