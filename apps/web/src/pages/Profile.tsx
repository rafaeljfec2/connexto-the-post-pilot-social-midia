import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle, User, Mail, Edit2, ExternalLink, Loader2 } from 'lucide-react'
import { FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from 'react-icons/fa6'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/auth.service'
import { useToast } from '@/components/ui/use-toast'

interface SocialConnection {
  readonly id: string
  readonly name: string
  readonly icon: React.ReactNode
  readonly connected: boolean
  readonly color: string
  readonly available: boolean
}

export function Profile() {
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const isLinkedInConnected = Boolean(user?.hasLinkedinToken)

  useEffect(() => {
    const linkedinStatus = searchParams.get('linkedin')
    const reason = searchParams.get('reason')

    if (linkedinStatus === 'connected') {
      refreshUser()
      toast({
        title: 'LinkedIn conectado!',
        description: 'Agora você pode publicar posts diretamente no LinkedIn.',
      })
      setSearchParams({})
    } else if (linkedinStatus === 'error') {
      const errorMessages: Record<string, string> = {
        missing_code: 'Código de autorização não encontrado.',
        invalid_state: 'Estado de autenticação inválido.',
        user_not_found: 'Usuário não encontrado.',
        token_exchange_failed: 'Falha ao trocar código por token.',
        empty_token: 'Token de acesso vazio.',
        urn_fetch_failed: 'Falha ao obter dados do perfil.',
        save_failed: 'Falha ao salvar token.',
      }
      toast({
        title: 'Erro ao conectar LinkedIn',
        description: errorMessages[reason ?? ''] ?? 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
      setSearchParams({})
    }
  }, [searchParams, setSearchParams, toast, refreshUser])

  const socials: SocialConnection[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <FaLinkedin className="size-5" />,
      connected: isLinkedInConnected,
      color: 'text-[#0A66C2]',
      available: true,
    },
    {
      id: 'twitter',
      name: 'X',
      icon: <FaXTwitter className="size-5" />,
      connected: false,
      color: 'text-foreground',
      available: false,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <FaFacebook className="size-5" />,
      connected: false,
      color: 'text-[#1877F2]',
      available: false,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <FaInstagram className="size-5" />,
      connected: false,
      color: 'text-[#E4405F]',
      available: false,
    },
  ]

  const handleConnect = async (socialId: string) => {
    if (socialId === 'linkedin') {
      try {
        setConnectingId(socialId)
        const url = await authService.getLinkedInPublishUrl()
        window.location.href = url
      } catch {
        toast({
          title: 'Erro ao conectar',
          description: 'Não foi possível obter a URL de autorização do LinkedIn.',
          variant: 'destructive',
        })
        setConnectingId(null)
      }
    } else {
      toast({
        title: 'Em breve',
        description: `Integração com ${socialId} será implementada em breve.`,
      })
    }
  }

  const [disconnectingId, setDisconnectingId] = useState<string | null>(null)

  const handleDisconnect = async (socialId: string) => {
    if (socialId === 'linkedin') {
      try {
        setDisconnectingId(socialId)
        await authService.disconnectLinkedIn()
        await refreshUser()
        toast({
          title: 'LinkedIn desconectado',
          description: 'Sua conta do LinkedIn foi desconectada com sucesso.',
        })
      } catch {
        toast({
          title: 'Erro ao desconectar',
          description: 'Não foi possível desconectar o LinkedIn.',
          variant: 'destructive',
        })
      } finally {
        setDisconnectingId(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e conexões.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <Avatar className="size-20">
                <AvatarImage src={user?.avatarUrl ?? ''} alt={user?.name ?? ''} />
                <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold">{user?.name ?? 'Usuário'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
                <Button variant="outline" size="sm" className="mt-3 gap-2">
                  <Edit2 className="size-3.5" />
                  Alterar foto
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <User className="size-4 text-muted-foreground" />
                  Nome completo
                </label>
                <Input value={user?.name ?? ''} readOnly />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="size-4 text-muted-foreground" />
                  E-mail
                </label>
                <Input value={user?.email ?? ''} readOnly />
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2">
              <Edit2 className="size-4" />
              Editar Perfil
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Redes Sociais Conectadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {socials.map(social => (
              <div
                key={social.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={social.available ? social.color : 'text-muted-foreground'}>
                    {social.icon}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${!social.available ? 'text-muted-foreground' : ''}`}
                    >
                      {social.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {social.connected
                        ? 'Conta conectada'
                        : social.available
                          ? 'Não conectado'
                          : 'Integração em breve'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {social.connected ? (
                    <>
                      <Badge variant="outline" className="gap-1 border-success text-success">
                        <CheckCircle2 className="size-3" />
                        Conectado
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(social.id)}
                        disabled={disconnectingId === social.id}
                      >
                        {disconnectingId === social.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          'Desconectar'
                        )}
                      </Button>
                    </>
                  ) : social.available ? (
                    <>
                      <Badge
                        variant="outline"
                        className="gap-1 border-muted-foreground text-muted-foreground"
                      >
                        <XCircle className="size-3" />
                        Desconectado
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect(social.id)}
                        disabled={connectingId === social.id}
                      >
                        {connectingId === social.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          'Conectar'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-primary/50 text-primary">
                      Em breve
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {!isLinkedInConnected && (
              <div className="mt-4 rounded-lg border border-warning/20 bg-warning/5 p-3">
                <p className="text-sm text-warning">
                  Conecte seu LinkedIn para publicar posts diretamente da plataforma.
                </p>
              </div>
            )}

            <div className="pt-3">
              <Button variant="link" className="h-auto gap-1 p-0 text-sm">
                Saiba mais sobre integrações
                <ExternalLink className="size-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
