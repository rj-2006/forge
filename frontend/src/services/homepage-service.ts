import type { HomepageData } from '../types/api'

export const homepageService = {
  async getHomepageData(): Promise<HomepageData> {
  const BASE_URL = import.meta.env.VITE_API_URL || ''
    // Public endpoint — no auth required
    const response = await fetch(`${BASE_URL}/api/homepage`)
    if (!response.ok) {
      throw new Error('Failed to fetch homepage data')
    }
    return response.json()
  },
}
