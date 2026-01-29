import { api } from '@/lib/axios'
import { authUtils } from '@/utils/auth'

export type AuthProvider = 'local' | 'google' | 'linkedin'

export type DataSourceType = 'rss' | 'devto' | 'hackernews'

export interface DataSource {
  type: DataSourceType
  url: string
  tags?: string[]
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  provider: AuthProvider
  providerId?: string
  openAiApiKey?: string // Mascarada (ex: sk-proj****xxxx)
  openAiModel?: string
  hasLinkedinToken?: boolean
  linkedinPersonUrn?: string
  dataSources?: DataSource[]
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ConsentUrlResponse {
  url: string
}

export interface LoginCredentials {
  email: string
  password: string
}

class AuthService {
  private readonly AUTH_ENDPOINTS = {
    login: '/the-post-pilot/v1/auth/login',
    google: {
      url: '/the-post-pilot/v1/auth/google/url',
      callback: '/the-post-pilot/v1/auth/google/callback',
    },
    linkedin: {
      url: '/the-post-pilot/v1/auth/linkedin/url',
      callback: '/the-post-pilot/v1/auth/linkedin/callback',
      publishCallback: '/the-post-pilot/v1/auth/linkedin/publish-callback',
    },
    me: '/the-post-pilot/v1/me',
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(this.AUTH_ENDPOINTS.login, credentials)
    return response.data
  }

  async getGoogleConsentUrl(): Promise<string> {
    const response = await api.get<ConsentUrlResponse>(this.AUTH_ENDPOINTS.google.url)
    return response.data.url
  }

  async getLinkedInConsentUrl(): Promise<string> {
    const response = await api.get<ConsentUrlResponse>(this.AUTH_ENDPOINTS.linkedin.url)
    return response.data.url
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>(this.AUTH_ENDPOINTS.google.callback, {
      params: { code },
    })
    return response.data
  }

  async handleLinkedInCallback(code: string): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>(this.AUTH_ENDPOINTS.linkedin.callback, {
      params: { code },
    })
    return response.data
  }

  async handleLinkedInPublishCallback(code: string): Promise<{ access_token: string }> {
    const response = await api.get<{ access_token: string }>(
      this.AUTH_ENDPOINTS.linkedin.publishCallback,
      { params: { code } }
    )
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(this.AUTH_ENDPOINTS.me)
    return response.data
  }

  async updateUser(user: User): Promise<User> {
    const response = await api.put<User>(this.AUTH_ENDPOINTS.me, user)
    return response.data
  }

  async updateProfile(data: {
    openAiApiKey?: string
    openAiModel?: string
    dataSources?: DataSource[]
  }): Promise<User> {
    const response = await api.put<User>(this.AUTH_ENDPOINTS.me, data)
    return response.data
  }

  async getLinkedInPublishUrl(): Promise<string> {
    const response = await api.get<{ url: string }>('/the-post-pilot/v1/auth/linkedin/publish-url')
    return response.data.url
  }

  setToken(token: string): void {
    console.log('Armazenando token:', token ? 'Presente' : 'Ausente')
    localStorage.setItem('token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  removeToken(): void {
    console.log('Removendo token')
    localStorage.removeItem('token')
    delete api.defaults.headers.common.Authorization
  }
}

export const authService = new AuthService()

const token = authUtils.getToken()
if (token) {
  authService.setToken(token)
}
