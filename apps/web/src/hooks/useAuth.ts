import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  authService,
  type User,
  type AuthResponse,
  type LoginCredentials,
} from '@/services/auth.service'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Query para obter usuário atual
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Mutation para login com email/senha
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials)
      authService.setToken(response.token)
      return response.user
    },
    onSuccess: user => {
      queryClient.setQueryData(['user'], user)
      navigate('/app')
    },
  })

  // Mutation para login com Google
  const googleLogin = useMutation({
    mutationFn: async () => {
      const url = await authService.getGoogleConsentUrl()
      window.location.href = url
    },
  })

  // Mutation para login com LinkedIn
  const linkedInLogin = useMutation({
    mutationFn: async () => {
      const url = await authService.getLinkedInConsentUrl()
      window.location.href = url
    },
  })

  // Mutation para callback do Google
  const handleGoogleCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.handleGoogleCallback(code)
      authService.setToken(response.token)
      return response.user
    },
    onSuccess: user => {
      queryClient.setQueryData(['user'], user)
      navigate('/app')
    },
  })

  // Mutation para callback do LinkedIn
  const handleLinkedInCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.handleLinkedInCallback(code)
      authService.setToken(response.token)
      return response.user
    },
    onSuccess: user => {
      queryClient.setQueryData(['user'], user)
      navigate('/app')
    },
  })

  // Mutation para callback de publicação do LinkedIn
  const handleLinkedInPublishCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.handleLinkedInPublishCallback(code)
      // Atualiza o usuário com o novo token do LinkedIn
      const updatedUser = await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: authService.getCurrentUser,
      })
      if (updatedUser) {
        queryClient.setQueryData(['user'], {
          ...updatedUser,
          linkedinToken: response.access_token,
        })
      }
      return response
    },
  })

  // Função de logout
  const logout = () => {
    authService.removeToken()
    queryClient.clear()
    navigate('/login')
  }

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    login: login.mutate,
    isLoggingIn: login.isPending,
    googleLogin: googleLogin.mutate,
    linkedInLogin: linkedInLogin.mutate,
    handleGoogleCallback: handleGoogleCallback.mutate,
    handleLinkedInCallback: handleLinkedInCallback.mutate,
    handleLinkedInPublishCallback: handleLinkedInPublishCallback.mutate,
    logout,
  }
}
