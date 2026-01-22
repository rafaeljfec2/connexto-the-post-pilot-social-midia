import { api } from '@/lib/axios'

export interface Post {
  id: string
  userId: string
  input: string
  output: string
  model: string
  usage?: {
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
  } | null
  status: string
  error?: string
  createdAt: string
}

class PostsService {
  private readonly POSTS_ENDPOINTS = {
    list: '/the-post-pilot/v1/posts',
    update: '/the-post-pilot/v1/posts/{id}',
  }

  async list(): Promise<Post[]> {
    try {
      const response = await api.get<Post[]>(this.POSTS_ENDPOINTS.list)
      // Garantir que sempre retornamos um array, mesmo se a API retornar null
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error listing posts:', error)
      // Retornar array vazio em caso de erro ao invés de lançar exceção
      return []
    }
  }

  async update(id: string, post: Post): Promise<Post> {
    const response = await api.put<Post>(this.POSTS_ENDPOINTS.update.replace('{id}', id), post)
    return response.data
  }
}

export const postsService = new PostsService()
