import { api } from '@/lib/axios'

export interface Article {
  title: string
  url: string
  source: string
  publishedAt: string
  summary?: string
  tags?: string[]
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

  // TODO: Implementar quando os endpoints estiverem disponíveis no backend
  async getTimeRecommendations(): Promise<TimeRecommendation[]> {
    return [
      { time: '09:00', engagement: 80 },
      { time: '12:00', engagement: 90 },
      { time: '15:00', engagement: 85 },
      { time: '18:00', engagement: 95 },
    ]
  }

  async getTrends(): Promise<Trend[]> {
    return [
      { topic: 'Inteligência Artificial', engagement: 85 },
      { topic: 'Desenvolvimento Web', engagement: 75 },
      { topic: 'Cloud Computing', engagement: 80 },
      { topic: 'DevOps', engagement: 70 },
    ]
  }
}

export const suggestionsService = new SuggestionsService()
