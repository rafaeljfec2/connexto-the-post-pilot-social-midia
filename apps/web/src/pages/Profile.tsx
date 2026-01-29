import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { CheckCircle2, XCircle, User, Mail, Edit2, ExternalLink } from 'lucide-react'
import { FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from 'react-icons/fa6'
import { useAuth } from '@/hooks/useAuth'

interface SocialConnection {
  readonly name: string
  readonly icon: React.ReactNode
  readonly connected: boolean
  readonly color: string
}

export function Profile() {
  const { user } = useAuth()

  const [socials] = useState<SocialConnection[]>([
    {
      name: 'LinkedIn',
      icon: <FaLinkedin className="size-5" />,
      connected: true,
      color: 'text-[#0A66C2]',
    },
    {
      name: 'X',
      icon: <FaXTwitter className="size-5" />,
      connected: false,
      color: 'text-foreground',
    },
    {
      name: 'Facebook',
      icon: <FaFacebook className="size-5" />,
      connected: false,
      color: 'text-[#1877F2]',
    },
    {
      name: 'Instagram',
      icon: <FaInstagram className="size-5" />,
      connected: false,
      color: 'text-[#E4405F]',
    },
  ])

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
                key={social.name}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={social.color}>{social.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{social.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {social.connected ? 'Conta conectada' : 'Não conectado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {social.connected ? (
                    <Badge variant="outline" className="gap-1 border-success text-success">
                      <CheckCircle2 className="size-3" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 border-muted-foreground text-muted-foreground"
                    >
                      <XCircle className="size-3" />
                      Desconectado
                    </Badge>
                  )}
                  <Button variant={social.connected ? 'ghost' : 'outline'} size="sm">
                    {social.connected ? 'Desconectar' : 'Conectar'}
                  </Button>
                </div>
              </div>
            ))}

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
