import { useQuery } from '@tanstack/react-query'
import { suggestionsService, Article } from '@/services/suggestions.service'

export interface SuggestionsFilters {
  q?: string
  from?: string
  to?: string
  tags?: string[]
  limit?: number
}

export function useSuggestions(filters: SuggestionsFilters) {
  return useQuery<Article[]>({
    queryKey: ['suggestions', filters],
    queryFn: () => suggestionsService.getArticleSuggestions(filters),
  })
}
