import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { cn, resolveAssetUrl } from '../../lib/utils'
import type { User } from '../../types/api'

interface UserProfileModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-[#333] bg-[#111] text-white shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-4 right-4 h-8 w-8 text-[#888] hover:text-white hover:bg-[#222]"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex gap-5 items-center mb-6">
          <div className="h-20 w-20 flex-shrink-0 rounded-full bg-[#222] border-2 border-[#444] overflow-hidden">
            {user.avatar ? (
              <img 
                src={resolveAssetUrl(user.avatar)} 
                alt={user.username} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-void text-snow text-3xl font-bold uppercase">
                {user.username?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-2xl font-bold font-ginto text-snow truncate">{user.name || user.username}</h2>
            <p className="text-sm font-medium text-[#8e9297] truncate">@{user.username}</p>
            <p className="text-xs font-semibold text-[#555] mt-1">
              Member since {new Date(user.created_at || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#888] mb-2">About Me</h3>
          {user.bio ? (
            <p className="text-sm text-[#dcddde] whitespace-pre-wrap leading-relaxed">
              {user.bio}
            </p>
          ) : (
            <p className="text-sm text-[#555] italic">This user hasn't written a bio yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
