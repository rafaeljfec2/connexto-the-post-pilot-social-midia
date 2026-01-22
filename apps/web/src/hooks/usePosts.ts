import { useQuery } from '@tanstack/react-query'
import { postsService, Post } from '@/services/posts.service'

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: ['posts', 'pending'],
    queryFn: async () => {
      const result = await postsService.list()
      // Garantir que sempre retornamos um array
      return Array.isArray(result) ? result : []
    },
    // Retry em caso de erro
    retry: 1,
    // Valor padrão para evitar null/undefined
    initialData: [],
  })
}
