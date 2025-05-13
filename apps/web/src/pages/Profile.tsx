import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  CreditCard,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export function Profile() {
  // Simulated user data
  const [user, setUser] = useState({
    name: 'Rafael Silva',
    email: 'rafael@email.com',
    phone: '+55 11 99999-9999',
    avatar: '',
  })
  const [socials, setSocials] = useState({
    linkedin: true,
    twitter: false,
    facebook: true,
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
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      {/* User Data */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Usuário</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="w-full flex-1 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <Input value={user.name} readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">E-mail</label>
              <Input value={user.email} readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefone</label>
              <Input value={user.phone} readOnly />
            </div>
            <Button variant="outline" className="mt-2">
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Connections */}
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
