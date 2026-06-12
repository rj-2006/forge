import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5070"

export function resolveAssetUrl(url?: string | null) {
  if (!url) {
    return ""
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`
}
