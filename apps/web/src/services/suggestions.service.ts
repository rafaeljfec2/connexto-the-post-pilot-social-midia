import { api } from '@/lib/axios'

export interface Article {
  title: string
  url: string
  source: string
  publishedAt: string
  summary: string
  tags: string[]
}

export interface GeneratePostRequest {
  topic: string
  tone?: string
  length?: 'short' | 'medium' | 'long'
  includeHashtags?: boolean
}

export interface GeneratePostResponse {
  content: string
  hashtags: string[]
  suggestedTime?: string
}

export interface TimeRecommendation {
  time: string
  engagement: number
}

export interface Trend {
  topic: string
  engagement: number
}

class SuggestionsService {
  private readonly SUGGESTIONS_ENDPOINTS = {
    articles: '/the-post-pilot/v1/articles/suggestions',
    generate: '/the-post-pilot/v1/posts/generate',
    timeRecommendations: '/the-post-pilot/v1/analytics/time-recommendations',
    trends: '/the-post-pilot/v1/analytics/trends',
  }

  async getArticleSuggestions(params?: {
    q?: string
    from?: string
    to?: string
    tags?: string[]
    limit?: number
  }): Promise<Article[]> {
    const response = await api.get<Article[]>(this.SUGGESTIONS_ENDPOINTS.articles, { params })
    return response.data
  }

  async generatePost(request: GeneratePostRequest): Promise<GeneratePostResponse> {
    const response = await api.post<GeneratePostResponse>(
      this.SUGGESTIONS_ENDPOINTS.generate,
      request
    )
    return response.data
  }

  async getTimeRecommendations(): Promise<TimeRecommendation[]> {
    try {
      const response = await api.get<TimeRecommendation[]>(
        this.SUGGESTIONS_ENDPOINTS.timeRecommendations
      )
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao buscar horários recomendados:', error.message)
      }
      // Fallback para dados mockados enquanto o endpoint não está disponível
      return [
        { time: '09:00', engagement: 80 },
        { time: '12:00', engagement: 90 },
        { time: '15:00', engagement: 85 },
        { time: '18:00', engagement: 95 },
      ]
    }
  }

  async getTrends(): Promise<Trend[]> {
    try {
      const response = await api.get<Trend[]>(this.SUGGESTIONS_ENDPOINTS.trends)
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao buscar tendências:', error.message)
      }
      // Fallback para dados mockados enquanto o endpoint não está disponível
      return [
        { topic: 'Inteligência Artificial', engagement: 85 },
        { topic: 'Desenvolvimento Web', engagement: 75 },
        { topic: 'Cloud Computing', engagement: 80 },
        { topic: 'DevOps', engagement: 70 },
      ]
    }
  }
}

export const suggestionsService = new SuggestionsService()
