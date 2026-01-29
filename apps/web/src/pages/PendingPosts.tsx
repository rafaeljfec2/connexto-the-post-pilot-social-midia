import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostListItem } from '@/components/posts/PostListItem'
import { EditPostModal } from '@/components/dashboard/EditPostModal'
import { usePosts, usePublishToLinkedIn, useDeletePost } from '@/hooks/usePosts'
import { useToast } from '@/components/ui/use-toast'
import type { Post } from '@/services/posts.service'
import { Plus, Loader2, FileText, Clock, Calendar, RefreshCw, Send } from 'lucide-react'

type TabValue = 'pending' | 'scheduled' | 'published'

export function PendingPosts() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: posts, isLoading, error, refetch } = usePosts()
  const publishMutation = usePublishToLinkedIn()
  const deleteMutation = useDeletePost()
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>('pending')

  const safePosts: Post[] = Array.isArray(posts) ? posts : []

  const pendingPosts = safePosts.filter(
    p => p.status === 'success' || p.status === 'Pendente' || p.status === 'started'
  )
  const scheduledPosts = safePosts.filter(p => p.status === 'scheduled')
  const publishedPosts = safePosts.filter(p => p.status === 'published')

  const handleEdit = (post: Post) => {
    setEditingPost(post)
  }

  const handlePublish = async (post: Post) => {
    if (!post.output) {
      toast({
        title: 'Erro',
        description: 'O post não tem conteúdo para publicar.',
        variant: 'destructive',
      })
      return
    }

    try {
      await publishMutation.mutateAsync({ text: post.output })
      toast({
        title: 'Publicado!',
        description: 'Seu post foi publicado no LinkedIn com sucesso.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      toast({
        title: 'Erro ao publicar',
        description: errorMessage.includes('token')
          ? 'Reconecte sua conta do LinkedIn nas configurações.'
          : errorMessage,
        variant: 'destructive',
      })
    }
  }

  const handleSchedule = (_post: Post) => {
    toast({
      title: 'Em breve',
      description: 'Agendamento será implementado em breve.',
    })
  }

  const handleDelete = async (post: Post) => {
    try {
      await deleteMutation.mutateAsync(post.id)
      toast({
        title: 'Post excluído',
        description: 'O post foi removido com sucesso.',
      })
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o post.',
        variant: 'destructive',
      })
    }
  }

  const EmptyState = ({ message }: { readonly message: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <div className="rounded-full bg-muted p-4">
          <FileText className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-medium">Nenhum post encontrado</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button onClick={() => navigate('/app/suggestions')} className="gap-2">
          <Plus className="size-4" />
          Criar novo post
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">Gerencie seus posts gerados pela IA.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => navigate('/app/suggestions')} className="gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Novo Post</span>
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as TabValue)}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 sm:inline-flex sm:w-auto">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="size-4" />
            <span>Pendentes</span>
            {pendingPosts.length > 0 && (
              <span className="ml-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
                {pendingPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <Calendar className="size-4" />
            <span>Agendados</span>
            {scheduledPosts.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                {scheduledPosts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <Send className="size-4" />
            <span>Publicados</span>
            {publishedPosts.length > 0 && (
              <span className="ml-1 rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
                {publishedPosts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando posts...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-3 py-8">
              <p className="font-medium text-destructive">Erro ao carregar posts</p>
              <Button variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            <TabsContent value="pending" className="space-y-3">
              {pendingPosts.length === 0 ? (
                <EmptyState message="Crie um post a partir das sugestões da IA." />
              ) : (
                pendingPosts.map(post => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onEdit={() => handleEdit(post)}
                    onPublish={() => handlePublish(post)}
                    onSchedule={() => handleSchedule(post)}
                    onDelete={() => handleDelete(post)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-3">
              {scheduledPosts.length === 0 ? (
                <EmptyState message="Agende posts para publicação automática." />
              ) : (
                scheduledPosts.map(post => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onEdit={() => handleEdit(post)}
                    onPublish={() => handlePublish(post)}
                    onSchedule={() => handleSchedule(post)}
                    onDelete={() => handleDelete(post)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="published" className="space-y-3">
              {publishedPosts.length === 0 ? (
                <EmptyState message="Posts publicados aparecerão aqui." />
              ) : (
                publishedPosts.map(post => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onEdit={() => handleEdit(post)}
                    onPublish={() => handlePublish(post)}
                    onSchedule={() => handleSchedule(post)}
                    onDelete={() => handleDelete(post)}
                  />
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {editingPost && <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />}
    </div>
  )
}
