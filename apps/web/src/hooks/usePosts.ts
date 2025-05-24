import { useQuery } from '@tanstack/react-query'
import { postsService, Post } from '@/services/posts.service'

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: ['posts', 'pending'],
    queryFn: () => postsService.list(),
  })
}
