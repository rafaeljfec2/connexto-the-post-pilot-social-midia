import { useAuthStore } from '@/stores/auth'
import { authUtils } from './auth'
import { api } from '@/lib/axios'
import { QueryClient } from '@tanstack/react-query'

/**
 * Limpa todos os dados do usuário atual, incluindo:
 * - Estado do Zustand
 * - Token no localStorage
 * - Header de autorização do Axios
 * - Cache do React Query
 */
export const clearUserData = (queryClient: QueryClient) => {
  // Limpa o estado do Zustand
  useAuthStore.getState().setUser(null)
  useAuthStore.getState().setToken(null)

  // Remove o token do localStorage
  authUtils.removeToken()

  // Remove o header de autorização do Axios
  delete api.defaults.headers.common['Authorization']

  // Limpa todo o cache do React Query
  queryClient.clear()
}
