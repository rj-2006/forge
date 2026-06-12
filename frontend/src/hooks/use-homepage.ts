import { useQuery } from '@tanstack/react-query'
import { homepageService } from '../services/homepage-service'

export function useHomepage() {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: () => homepageService.getHomepageData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  })
}
