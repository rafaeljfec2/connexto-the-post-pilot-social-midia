import { api } from '@/lib/axios'

export interface PostUsage {
  completion_tokens?: number
  completion_tokens_details?: {
    accepted_prediction_tokens?: number
    audio_tokens?: number
    reasoning_tokens?: number
    rejected_prediction_tokens?: number
  }
  prompt_tokens?: number
  prompt_tokens_details?: {
    audio_tokens?: number
    cached_tokens?: number
  }
  total_tokens?: number
}

export interface Post {
  id: string
  userId: string
  input: string
  output: string
  model: string
  usage?: PostUsage | null
  status: string
  error?: string
  createdAt: string
}

export interface GeneratePostRequest {
  topic: string
}

export interface GeneratePostResponse {
  generatedText: string
  model: string
  usage?: Record<string, unknown>
  createdAt: string
  logId: string
}

export interface PublishLinkedInRequest {
  text: string
}

export interface PublishLinkedInResponse {
  status: string
  linkedinPostId: string
}

class PostsService {
  private readonly ENDPOINTS = {
    list: '/the-post-pilot/v1/posts',
    generate: '/the-post-pilot/v1/posts/generate',
    publishLinkedIn: '/the-post-pilot/v1/linkedin/publish',
  }

  async list(): Promise<Post[]> {
    try {
      const response = await api.get<Post[]>(this.ENDPOINTS.list)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error listing posts:', error)
      return []
    }
  }

  async generate(request: GeneratePostRequest): Promise<GeneratePostResponse> {
    const response = await api.post<GeneratePostResponse>(this.ENDPOINTS.generate, request)
    return response.data
  }

  async publishToLinkedIn(request: PublishLinkedInRequest): Promise<PublishLinkedInResponse> {
    const response = await api.post<PublishLinkedInResponse>(
      this.ENDPOINTS.publishLinkedIn,
      request
    )
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.ENDPOINTS.list}/${id}`)
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const response = await api.put<Post>(`${this.ENDPOINTS.list}/${id}`, data)
    return response.data
  }
}

export const postsService = new PostsService()
