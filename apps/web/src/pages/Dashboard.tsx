import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send } from 'lucide-react'

// Dados simulados para posts pendentes
const pendingPosts = [
  {
    id: 1,
    title: 'Como a IA está transformando o marketing digital',
    content: 'A inteligência artificial está revolucionando a forma como as empresas se conectam com seus clientes...',
    status: 'pendente',
    createdAt: '2024-02-20T10:00:00Z',
  },
  {
    id: 2,
    title: '5 tendências de conteúdo para LinkedIn em 2024',
    content: 'O LinkedIn continua sendo uma plataforma poderosa para networking profissional...',
    status: 'pendente',
    createdAt: '2024-02-20T09:30:00Z',
  },
]

export function Dashboard() {
  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Posts Pendentes</h2>
        <p className="text-muted-foreground">
          Gerencie seus posts pendentes e agende publicações
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {pendingPosts.map((post) => (
          <Card key={post.id} className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    Criado em {new Date(post.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{post.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{post.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Editar</Button>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 