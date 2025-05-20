import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { authService, User, type LoginCredentials } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'
import { authUtils } from '@/utils/auth'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user, setUser, setToken } = useAuthStore()

  const token = authUtils.getToken()
  const { data: userData, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['user'],
    queryFn: () => {
      console.log('Buscando /me')
      return authService.getCurrentUser()
    },
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  // Sincronizar Zustand com resultado do useQuery
  useEffect(() => {
    if (isLoadingUser) return // Não limpe o Zustand enquanto está carregando
    if (userData) {
      setUser(userData)
      setToken(authUtils.getToken() ?? '')
    } else {
      setUser(null)
      setToken(null)
    }
  }, [userData, isLoadingUser, setUser, setToken])

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials)
      authService.setToken(response.token)
      setToken(response.token)
      setUser(response.user)
      authUtils.setToken(response.token)
      authUtils.setUser(response.user)
      queryClient.setQueryData(['user'], response.user)
      return response.user
    },
    onSuccess: async () => {
      // Invalida e refaz a query do usuário para garantir que /me seja chamado
      await queryClient.invalidateQueries({ queryKey: ['user'] })
      await queryClient.refetchQueries({ queryKey: ['user'] })
      navigate('/app')
    },
  })

  const googleLogin = useMutation({
    mutationFn: async () => {
      const url = await authService.getGoogleConsentUrl()
      window.location.href = url
    },
  })

  const linkedInLogin = useMutation({
    mutationFn: async () => {
      const url = await authService.getLinkedInConsentUrl()
      window.location.href = url
    },
  })

  const handleGoogleCallback = useMutation({
    mutationFn: async (code: string) => {
      const response = await authService.handleGoogleCallback(code)
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
    authService.removeToken()
    authUtils.clearAuth()
    setUser(null)
    setToken(null)
    queryClient.cancelQueries({ queryKey: ['user'] })
    queryClient.removeQueries({ queryKey: ['user'] })
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
