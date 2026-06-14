import * as React from 'react'
import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuthStore } from '../../stores/auth-store'
import { api } from '../../lib/api-client'
import { cn, resolveAssetUrl } from '../../lib/utils'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, setToken } = useAuthStore() // we can also use login(user, token)
  const login = useAuthStore(state => state.login)
  const token = useAuthStore(state => state.token)
  
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)
    
    try {
      const res = await api.put<{ message: string; user: any }>('/api/me/profile', {
        name,
        bio
      })
      if (token) {
        login(res.user, token)
      }
      onClose()
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const res = await api.upload<{ message: string; url: string }>('/api/upload/avatar', file, 'avatar')
      // Update global user
      if (user && token) {
        login({ ...user, avatar: res.url }, token)
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-[#333] bg-[#0A0A0A] text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#222] px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight uppercase">Profile Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-[#aaa] hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {error}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative group cursor-pointer h-24 w-24 rounded-full overflow-hidden border-2 border-[#333] hover:border-white transition-colors"
              onClick={handleAvatarClick}
            >
              {user?.avatar ? (
                <img 
                  src={resolveAssetUrl(user.avatar)} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[#111] flex items-center justify-center text-3xl font-bold text-[#555]">
                  {user?.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
              
              <div className={cn(
                "absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity",
                isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-white mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Upload</span>
                  </>
                )}
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
            />
            <div className="text-center">
              <p className="text-sm font-semibold">{user?.username}</p>
              <p className="text-xs text-[#888]">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#888]">Display Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
                className="bg-[#111] border-[#333] focus-visible:ring-white/20 text-white placeholder:text-[#555] rounded-md h-11"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#888]">About Me</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a little bit about yourself..."
                rows={4}
                className="w-full resize-none rounded-md bg-[#111] border border-[#333] focus:outline-none focus:ring-2 focus:ring-white/20 p-3 text-sm text-white placeholder:text-[#555]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#222]">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="mr-2 text-[#aaa] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-white text-black hover:bg-gray-200 font-bold"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
