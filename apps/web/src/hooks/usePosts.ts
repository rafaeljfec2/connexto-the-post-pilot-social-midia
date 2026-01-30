import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  postsService,
  Post,
  GeneratePostRequest,
  GeneratePostResponse,
  PublishLinkedInRequest,
  PublishLinkedInResponse,
} from '@/services/posts.service'

export const POSTS_QUERY_KEY = ['posts'] as const

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: POSTS_QUERY_KEY,
    queryFn: async () => {
      const result = await postsService.list()
      return Array.isArray(result) ? result : []
    },
    retry: 2,
    staleTime: 30000,
  })
}

export function useGeneratePost() {
  const queryClient = useQueryClient()

  return useMutation<GeneratePostResponse, Error, GeneratePostRequest>({
    mutationFn: request => postsService.generate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY })
    },
  })
}

export function usePublishToLinkedIn() {
  const queryClient = useQueryClient()

  return useMutation<PublishLinkedInResponse, Error, PublishLinkedInRequest>({
    mutationFn: request => postsService.publishToLinkedIn(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: id => postsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY })
    },
  })
}

export function useDeleteLinkedInPost() {
  const queryClient = useQueryClient()

  return useMutation<{ status: string }, Error, string>({
    mutationFn: postLogId => postsService.deleteLinkedInPost(postLogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY })
    },
  })
}
