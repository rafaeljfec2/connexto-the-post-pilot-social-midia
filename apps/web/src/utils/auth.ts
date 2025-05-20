const TOKEN_KEY = '@Auth:token'
const REFRESH_TOKEN_KEY = '@Auth:refreshToken'
const USER_KEY = '@Auth:user'

function getStorage(persistent: boolean) {
  return persistent ? localStorage : sessionStorage
}

export const authUtils = {
  setToken(token: string, persistent = false): void {
    getStorage(persistent).setItem(TOKEN_KEY, token)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  },

  setRefreshToken(refreshToken: string, persistent = false): void {
    getStorage(persistent).setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  setUser(user: any, persistent = false): void {
    getStorage(persistent).setItem(USER_KEY, JSON.stringify(user))
  },

  getUser(): any | null {
    const user = localStorage.getItem(USER_KEY)
    if (!user) {
      return sessionStorage.getItem(USER_KEY)
    }
    return user ? JSON.parse(user) : null
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
