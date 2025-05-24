import { api } from '@/lib/axios'

export interface Post {
  id: string
  userId: string
  input: string
  output: string
  model: string
  usage: Record<string, unknown>
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
      return response.data
    } catch (error) {
      console.error('Error listing posts:', error)
      throw error
    }
  }

  async update(id: string, post: Post): Promise<Post> {
    const response = await api.put<Post>(this.POSTS_ENDPOINTS.update.replace('{id}', id), post)
    return response.data
  }
}

export const postsService = new PostsService()
