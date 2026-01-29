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
import { Loader2, Eye, EyeOff, Send } from 'lucide-react'
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

  useEffect(() => {
    setFocus('email')
  }, [setFocus])

  const handleAuthError = (error: unknown, provider?: AuthProvider) => {
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
    <div className="flex min-h-screen">
      <div className="hidden items-center justify-center bg-primary p-12 lg:flex lg:w-1/2">
        <div className="max-w-md text-primary-foreground">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary-foreground/20">
              <Send className="size-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Post Pilot</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold">
            Automatize seus posts com Inteligência Artificial
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Crie, agende e publique conteúdo para suas redes sociais de forma inteligente e
            eficiente.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 md:px-8 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <Send className="size-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Post Pilot</span>
          </div>

          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">Entre na sua conta para continuar</p>
          </div>

          {isSocialLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 size-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Aguarde, autenticando...</span>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full gap-2"
                  onClick={() => googleLogin()}
                  disabled={isLoggingIn}
                >
                  <FcGoogle className="size-5" />
                  Continuar com Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full gap-2"
                  onClick={() => linkedInLogin()}
                  disabled={isLoggingIn}
                >
                  <SiLinkedin className="size-5 text-[#0077B5]" />
                  Continuar com LinkedIn
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
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
                    className="h-11"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="h-11 pr-10"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
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

                <Button type="submit" className="h-11 w-full" disabled={isLoggingIn}>
                  {isLoggingIn && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Entrar
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  Criar conta
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
