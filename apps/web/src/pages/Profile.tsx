import { ProfileKpiCard } from '@/components/dashboard/ProfileKpiCard'
import { ProfileFollowersChart } from '@/components/dashboard/ProfileFollowersChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'
import {
  Users,
  Send,
  BarChart3,
  ThumbsUp,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const user = {
  name: 'João Silva',
  email: 'joao@email.com',
  avatarUrl: '',
  socials: {
    linkedin: true,
    twitter: false,
    facebook: true,
    instagram: false,
  },
}

export function Profile() {
  const { user } = useAuth()

  // Dados sociais simulados (até integração real)
  const [socials, setSocials] = useState({
    linkedin: false,
    twitter: false,
    facebook: false,
    instagram: false,
  })
  const [payment, setPayment] = useState({
    card: '**** **** **** 1234',
    plan: 'Pro',
    status: 'active',
    nextBilling: '2024-07-10',
    history: [
      { date: '2024-06-10', amount: 'R$ 49,90', status: 'Pago' },
      { date: '2024-05-10', amount: 'R$ 49,90', status: 'Pago' },
    ],
  })

  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-3xl md:px-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ProfileKpiCard title="Seguidores" value="2.800" icon={<Users className="h-5 w-5" />} />
        <ProfileKpiCard title="Posts" value="320" icon={<Send className="h-5 w-5" />} />
        <ProfileKpiCard
          title="Engajamento"
          value="12.400"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <ProfileKpiCard
          title="Mais curtido"
          value="1.200"
          icon={<ThumbsUp className="h-5 w-5" />}
        />
      </div>

      {/* Gráfico de seguidores */}
      <ProfileFollowersChart />

      {/* Dados do usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.avatarUrl ?? ''} alt={user?.name ?? ''} />
            <AvatarFallback>{user?.name?.[0] ?? ''}</AvatarFallback>
          </Avatar>
          <div className="w-full flex-1 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <Input value={user?.name ?? ''} readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <Input value={user?.email ?? ''} readOnly />
            </div>
            <Button variant="outline" className="mt-2">
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conexões com redes sociais */}
      <Card>
        <CardHeader>
          <CardTitle>Conexões com Redes Sociais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Linkedin className="h-6 w-6 text-blue-700" />
            <span>LinkedIn</span>
            {socials.linkedin ? (
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="mr-1 inline h-4 w-4" />
                Conectado
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white">
                <XCircle className="mr-1 inline h-4 w-4" />
                Desconectado
              </Badge>
            )}
            <Button size="sm" variant="outline" className="ml-auto">
              {socials.linkedin ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Twitter className="h-6 w-6 text-sky-500" />
            <span>Twitter</span>
            {socials.twitter ? (
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="mr-1 inline h-4 w-4" />
                Conectado
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white">
                <XCircle className="mr-1 inline h-4 w-4" />
                Desconectado
              </Badge>
            )}
            <Button size="sm" variant="outline" className="ml-auto">
              {socials.twitter ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Facebook className="h-6 w-6 text-blue-600" />
            <span>Facebook</span>
            {socials.facebook ? (
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="mr-1 inline h-4 w-4" />
                Conectado
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white">
                <XCircle className="mr-1 inline h-4 w-4" />
                Desconectado
              </Badge>
            )}
            <Button size="sm" variant="outline" className="ml-auto">
              {socials.facebook ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Instagram className="h-6 w-6 text-pink-500" />
            <span>Instagram</span>
            {socials.instagram ? (
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="mr-1 inline h-4 w-4" />
                Conectado
              </Badge>
            ) : (
              <Badge className="bg-red-600 text-white">
                <XCircle className="mr-1 inline h-4 w-4" />
                Desconectado
              </Badge>
            )}
            <Button size="sm" variant="outline" className="ml-auto">
              {socials.instagram ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
