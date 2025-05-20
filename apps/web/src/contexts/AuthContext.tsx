import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/services/auth.service'

interface AuthContextType {
  user: User | null
  isLoadingUser: boolean
  isAuthenticated: boolean
  googleLogin: () => void
  linkedInLogin: () => void
  handleGoogleCallback: (code: string) => void
  handleLinkedInCallback: (code: string) => void
  handleLinkedInPublishCallback: (code: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
