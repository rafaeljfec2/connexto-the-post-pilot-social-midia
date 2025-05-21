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
  useAuthStore.getState().setUser(null)
  useAuthStore.getState().setToken(null)
  authUtils.removeToken()
  delete api.defaults.headers.common['Authorization']
  queryClient.clear()
}
