import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HistoryEngagementChart } from '@/components/dashboard/HistoryEngagementChart'
import { usePosts } from '@/hooks/usePosts'
import { Send, TrendingUp, Download, Filter, Loader2, FileText, Linkedin, Eye } from 'lucide-react'
import { useState } from 'react'
import { EditPostModal } from '@/components/dashboard/EditPostModal'
import type { Post } from '@/services/posts.service'

interface StatCardProps {
  readonly title: string
  readonly value: string
  readonly icon: React.ReactNode
  readonly description?: string
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function History() {
  const { data: posts, isLoading } = usePosts()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const safePosts = Array.isArray(posts) ? posts : []

  const publishedPosts = safePosts.filter(p => p.status === 'published')
  const allPosts = safePosts

  const totalPublished = publishedPosts.length
  const totalEngagement = publishedPosts.reduce((acc, p) => acc + (p.usage?.total_tokens ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Histórico</h1>
          <p className="text-muted-foreground">Visualize todos os posts gerados pela IA.</p>
        </div>
        <Button variant="outline" className="w-full gap-2 sm:w-auto">
          <Download className="size-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total de Posts"
          value={allPosts.length.toString()}
          icon={<FileText className="size-5 text-primary" />}
          description="Posts gerados"
        />
        <StatCard
          title="Publicados"
          value={totalPublished.toString()}
          icon={<Send className="size-5 text-primary" />}
          description="No LinkedIn"
        />
        <StatCard
          title="Tokens Utilizados"
          value={totalEngagement.toLocaleString()}
          icon={<TrendingUp className="size-5 text-primary" />}
          description="Total consumido"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium">Atividade ao Longo do Tempo</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <Select defaultValue="30d">
                <SelectTrigger className="h-9 w-full sm:w-36">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todo período</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <HistoryEngagementChart />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Todos os Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : allPosts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <FileText className="size-8 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum post encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tema</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPosts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Linkedin className="size-4 shrink-0 text-primary" />
                          <span className="truncate text-sm">{truncateText(post.input, 40)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            post.status === 'published'
                              ? 'default'
                              : post.status === 'error'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className={
                            post.status === 'published' ? 'bg-success text-success-foreground' : ''
                          }
                        >
                          {post.status === 'success'
                            ? 'Pendente'
                            : post.status === 'published'
                              ? 'Publicado'
                              : post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {post.model}
                      </TableCell>
                      <TableCell className="text-sm">{post.usage?.total_tokens ?? '-'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedPost(post)}>
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPost && <EditPostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
