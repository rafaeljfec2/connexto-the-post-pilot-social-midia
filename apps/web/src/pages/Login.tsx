import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { SiLinkedin } from 'react-icons/si'
import { useQueryClient } from '@tanstack/react-query'
import { authUtils } from '@/utils/auth'
import { useAuthStore } from '@/stores/auth'
import { clearUserData } from '@/utils/clearUserData'
import { authService } from '@/services/auth.service'
import { Checkbox } from '@/components/ui/checkbox'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>
type AuthProvider = 'google' | 'linkedin'

export function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const setToken = useAuthStore(state => state.setToken)
  const setUser = useAuthStore(state => state.setUser)
  const {
    login,
    isLoggingIn,
    googleLogin,
    linkedInLogin,
    handleGoogleCallback,
    handleLinkedInCallback,
    user,
    isAuthenticated,
    isLoadingUser,
  } = useAuth()

  const [isSocialLoading, setIsSocialLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  })

  // Foco automático no primeiro campo
  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const handleAuthError = (error: unknown, provider?: AuthProvider) => {
    console.error('Erro na autenticação:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Não foi possível autenticar. Tente novamente.'

    toast({
      title: 'Erro ao autenticar',
      description: provider ? `Erro ao autenticar com ${provider}: ${errorMessage}` : errorMessage,
      variant: 'destructive',
    })

    navigate('/login', { replace: true })
  }

  const handleTokenAuth = async (token: string) => {
    try {
      clearUserData(queryClient)
      authUtils.setToken(token)
      setToken(token)
      authService.setToken(token)

      const userData = await authService.getCurrentUser()
      setUser(userData)
      authUtils.setUser(userData)
      queryClient.setQueryData(['user'], userData)

      navigate('/app', { replace: true })
    } catch (error) {
      handleAuthError(error)
    } finally {
      setIsSocialLoading(false)
    }
  }

  const handleProviderCallback = async (code: string, provider: AuthProvider) => {
    try {
      if (provider === 'google') {
        await handleGoogleCallback(code)
      } else if (provider === 'linkedin') {
        await handleLinkedInCallback(code)
      } else {
        throw new Error('Provider inválido')
      }
    } catch (error) {
      handleAuthError(error, provider)
    } finally {
      setIsSocialLoading(false)
    }
  }

  useEffect(() => {
    const token = searchParams.get('token')
    const provider = searchParams.get('provider') as AuthProvider | null

    if (token && provider) {
      setIsSocialLoading(true)
      handleTokenAuth(token)
      return
    }

    const code = searchParams.get('code')
    if (code && provider) {
      setIsSocialLoading(true)
      handleProviderCallback(code, provider)
    }
  }, [searchParams, handleGoogleCallback, handleLinkedInCallback, queryClient, setToken, setUser])

  useEffect(() => {
    if (isSocialLoading && isAuthenticated && !isLoadingUser && user) {
      navigate('/app')
      setIsSocialLoading(false)
    }
  }, [isSocialLoading, isAuthenticated, isLoadingUser, user, navigate])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Redirecionando para o dashboard...',
      })
    } catch (error) {
      handleAuthError(error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-4 shadow-lg sm:p-6 md:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold md:text-3xl">The Post Pilot</h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Gerencie e automatize seus posts em redes sociais com inteligência artificial
          </p>
        </div>

        {isSocialLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Aguarde, autenticando...</span>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => googleLogin()}
                disabled={isLoggingIn}
              >
                <FcGoogle className="h-5 w-5" /> Entrar com Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => linkedInLogin()}
                disabled={isLoggingIn}
              >
                <SiLinkedin className="h-5 w-5 text-[#0077B5]" /> Entrar com LinkedIn
              </Button>
            </div>

            <div className="my-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou entre com email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rememberMe" {...register('rememberMe')} />
                  <Label htmlFor="rememberMe" className="text-sm font-normal">
                    Manter conectado
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Criar conta
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
