import type { User } from '@/services/auth.service'

const TOKEN_KEY = '@Auth:token'
const REFRESH_TOKEN_KEY = '@Auth:refreshToken'
const USER_KEY = '@Auth:user'

export const authUtils = {
  setTokenToLocal(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  setTokenToSession(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token)
  },

  setToken(token: string): void {
    this.setTokenToSession(token)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  },

  setRefreshTokenToLocal(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  setRefreshTokenToSession(refreshToken: string): void {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  setRefreshToken(refreshToken: string): void {
    this.setRefreshTokenToSession(refreshToken)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  setUserToLocal(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  setUserToSession(user: User): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  setUser(user: User): void {
    this.setUserToSession(user)
  },

  getUser(): User | null {
    const localUser = localStorage.getItem(USER_KEY)
    const sessionUser = sessionStorage.getItem(USER_KEY)
    const userStr = localUser ?? sessionUser

    return userStr ? JSON.parse(userStr) : null
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(USER_KEY)
  },

  clearAuth(): void {
    this.removeToken()
    this.removeRefreshToken()
    this.removeUser()
  },
}
