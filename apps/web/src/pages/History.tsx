import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart2, Share2 } from 'lucide-react'

// Dados simulados para posts publicados
const publishedPosts = [
  {
    id: 1,
    title: 'O futuro do trabalho remoto',
    content: 'O trabalho remoto veio para ficar e está transformando a forma como as empresas operam...',
    status: 'publicado',
    publishedAt: '2024-02-19T15:30:00Z',
    metrics: {
      likes: 45,
      comments: 12,
      shares: 8,
    },
  },
  {
    id: 2,
    title: 'Dicas para networking efetivo no LinkedIn',
    content: 'O networking é uma ferramenta poderosa para o desenvolvimento profissional...',
    status: 'publicado',
    publishedAt: '2024-02-18T10:15:00Z',
    metrics: {
      likes: 78,
      comments: 23,
      shares: 15,
    },
  },
]

export function History() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Histórico de Posts</h2>
        <p className="text-muted-foreground">
          Visualize o desempenho dos seus posts publicados
        </p>
      </div>
      <div className="grid gap-6">
        {publishedPosts.map((post) => (
          <Card key={post.id} className="bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    Publicado em {new Date(post.publishedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{post.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{post.content}</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <BarChart2 className="mr-1 h-4 w-4" />
                  {post.metrics.likes} curtidas
                </div>
                <div className="flex items-center">
                  <Share2 className="mr-1 h-4 w-4" />
                  {post.metrics.shares} compartilhamentos
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Ver Métricas</Button>
              <Button variant="outline">Republicar</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 