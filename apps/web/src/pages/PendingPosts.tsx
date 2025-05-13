import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, Filter, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Post, PostStatus, SocialMedia } from '@/types/post'

// Dados mockados para exemplo
const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Novo artigo sobre marketing digital: Como aumentar seu alcance orgânico em 2024',
    socialMedias: ['linkedin', 'twitter'],
    status: 'pending',
    createdAt: new Date('2024-03-15T10:00:00'),
    updatedAt: new Date('2024-03-15T10:00:00'),
    aiSuggestions: [
      {
        content: 'Dicas práticas para aumentar seu alcance orgânico em 2024',
        score: 0.95,
      },
    ],
  },
  {
    id: '2',
    content: 'Lançamento do nosso novo produto! Confira as principais funcionalidades.',
    socialMedias: ['linkedin', 'facebook', 'instagram'],
    status: 'scheduled',
    scheduledFor: new Date('2024-03-20T15:00:00'),
    createdAt: new Date('2024-03-14T15:30:00'),
    updatedAt: new Date('2024-03-14T15:30:00'),
  },
]

const statusColors: Record<PostStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  scheduled: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  published: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  failed: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
}

const statusLabels: Record<PostStatus, string> = {
  pending: 'Pendente',
  scheduled: 'Agendado',
  published: 'Publicado',
  failed: 'Falhou',
}

const socialMediaIcons: Record<SocialMedia, string> = {
  linkedin: 'in',
  twitter: '𝕏',
  instagram: '📸',
  facebook: 'f',
}

export function PendingPosts() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all')
  const [socialMediaFilter, setSocialMediaFilter] = useState<SocialMedia | 'all'>('all')

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    const matchesSocialMedia =
      socialMediaFilter === 'all' || post.socialMedias.includes(socialMediaFilter)
    return matchesSearch && matchesStatus && matchesSocialMedia
  })

  return (
    <div className="container mx-auto space-y-6 px-2 sm:px-4 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Posts Pendentes</h1>
          <p className="text-muted-foreground">
            Gerencie e agende seus posts para as redes sociais
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      <div className="flex w-full flex-col rounded-lg border bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar posts..."
              className="pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={value => setStatusFilter(value as PostStatus | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="published">Publicado</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={socialMediaFilter}
            onValueChange={value => setSocialMediaFilter(value as SocialMedia | 'all')}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Rede Social" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as redes</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map(post => (
          <Card key={post.id} className="flex flex-col bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-2">{post.content}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(post.createdAt, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className={statusColors[post.status]}>
                  {statusLabels[post.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-2">
                {post.socialMedias.map(social => (
                  <Badge key={social} variant="outline">
                    {socialMediaIcons[social]}
                  </Badge>
                ))}
              </div>
              {post.scheduledFor && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Agendado para{' '}
                  {format(post.scheduledFor, "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </div>
              )}
              {post.aiSuggestions && post.aiSuggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Sugestões da IA:</p>
                  <div className="space-y-2">
                    {post.aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="rounded-lg bg-muted p-2 text-sm">
                        {suggestion.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Editar
              </Button>
              <Button variant="outline" className="flex-1">
                Agendar
              </Button>
              <Button variant="destructive" className="flex-1">
                Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
