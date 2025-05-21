import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { authService, User, type LoginCredentials } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'
import { authUtils } from '@/utils/auth'
import { clearUserData } from '@/utils/clearUserData'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user, setUser, setToken } = useAuthStore()

  // Verificar token existente
  const token = authUtils.getToken()
  if (token) {
    authService.setToken(token)
  }

  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => {
      return authService.getCurrentUser()
    },
    enabled: !!token,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
  })

  // Sincronizar Zustand com resultado do useQuery
  useEffect(() => {
    if (isLoadingUser) return

    if (userData) {
      setUser(userData)
      setToken(token ?? '')
      authUtils.setUser(userData)
    } else if (!isLoadingUser && !userData && token) {
      // Se não há dados do usuário mas existe token, limpar tudo
      clearUserData(queryClient)
    }
  }, [userData, isLoadingUser, setUser, setToken, queryClient, token])

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      clearUserData(queryClient)
      const response = await authService.login(credentials)

      // Persistir dados
      authService.setToken(response.token)
      setToken(response.token)
      setUser(response.user)
      authUtils.setToken(response.token)
      authUtils.setUser(response.user)
      queryClient.setQueryData(['user'], response.user)

      return response.user
    },
    onSuccess: () => {
      navigate('/app')
    },
  })

  const googleLogin = useMutation({
    mutationFn: async () => {
      clearUserData(queryClient)
      const url = await authService.getGoogleConsentUrl()
      window.location.href = url
    },
  })

  const linkedInLogin = useMutation({
    mutationFn: async () => {
      clearUserData(queryClient)
      const url = await authService.getLinkedInConsentUrl()
      window.location.href = url
    },
  })

  const handleGoogleCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.handleGoogleCallback(code)

      // Persistir dados
      authService.setToken(response.token)
      setToken(response.token)
      setUser(response.user)
      authUtils.setToken(response.token)
      authUtils.setUser(response.user)
      queryClient.setQueryData(['user'], response.user)

      return response.user
    },
    onSuccess: () => {
      navigate('/app')
    },
  })

  const handleLinkedInCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.handleLinkedInCallback(code)

      // Persistir dados
      authService.setToken(response.token)
      setToken(response.token)
      setUser(response.user)
      authUtils.setToken(response.token)
      authUtils.setUser(response.user)
      queryClient.setQueryData(['user'], response.user)

      return response.user
    },
    onSuccess: () => {
      navigate('/app')
    },
  })

  const handleLinkedInPublishCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.handleLinkedInPublishCallback(code)
      const updatedUser = await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: authService.getCurrentUser,
      })
      if (updatedUser) {
        setUser({ ...updatedUser, linkedinAccessToken: response.access_token })
        authUtils.setUser({ ...updatedUser, linkedinAccessToken: response.access_token })
        queryClient.setQueryData(['user'], {
          ...updatedUser,
          linkedinAccessToken: response.access_token,
        })
      }
      return response
    },
  })

  const logout = () => {
    clearUserData(queryClient)
    navigate('/login')
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoadingUser,
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
