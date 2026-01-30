import { createContext, useContext, ReactNode, useMemo } from 'react'
import type { User } from '@/services/auth.service'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoadingUser: boolean
  googleLogin: () => void
  linkedInLogin: () => void
  handleGoogleCallback: (code: string) => void
  handleLinkedInCallback: (code: string) => void
  handleLinkedInPublishCallback: (code: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const auth = useAuth()
  const zustandUser = useAuthStore(state => state.user)

  const contextValue = useMemo(
    () => ({
      ...auth,
      user: zustandUser,
      isAuthenticated: !!zustandUser,
      isLoadingUser: auth.isLoadingUser,
    }),
    [auth, zustandUser]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
