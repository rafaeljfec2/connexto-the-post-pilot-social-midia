import { create } from 'zustand'
import { User } from '@/services/auth.service'
import { authUtils } from '@/utils/auth'

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: authUtils.getUser(),
  token: authUtils.getToken(),
  setUser: user => set({ user }),
  setToken: token => set({ token }),
  clearAuth: () => set({ user: null, token: null }),
}))
