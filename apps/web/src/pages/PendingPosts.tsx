import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2, FileText, Clock, Calendar, RefreshCw, Send } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Post } from '@/services/posts.service'
import { EditPostModal } from '@/components/dashboard/EditPostModal'
import { PostListItem } from '@/components/posts/PostListItem'
import { FadeIn } from '@/components/ui/animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { usePosts, usePublishToLinkedIn, useDeletePost } from '@/hooks/usePosts'
import { translateError } from '@/utils/errorMessages'

type TabValue = 'pending' | 'scheduled' | 'published'

interface EmptyStateProps {
  readonly message: string
  readonly onCreatePost: () => void
}

function EmptyState({ message, onCreatePost }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="rounded-full bg-muted p-4"
          >
            <FileText className="size-8 text-muted-foreground" />
          </motion.div>
          <div className="space-y-1 text-center">
            <p className="font-medium">Nenhum post encontrado</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={onCreatePost} className="gap-2">
              <Plus className="size-4" />
              Criar novo post
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
}

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
      const { title, description } = translateError(err)
      toast({
        title,
        description,
        variant: 'destructive',
      })
    }
  }

  const handleSchedule = () => {
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

  const handleCreatePost = () => navigate('/app/suggestions')

  const renderPostList = (postsList: Post[]) => (
    <AnimatePresence mode="popLayout">
      {postsList.length === 0 ? (
        <EmptyState
          message="Crie um post a partir das sugestões da IA."
          onCreatePost={handleCreatePost}
        />
      ) : (
        <motion.div
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {postsList.map(post => (
            <motion.div
              key={post.id}
              variants={listItemVariants}
              layout
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <PostListItem
                post={post}
                onEdit={() => handleEdit(post)}
                onPublish={() => handlePublish(post)}
                onSchedule={() => handleSchedule()}
                onDelete={() => handleDelete(post)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
            <p className="text-muted-foreground">Gerencie seus posts gerados pela IA.</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
              <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => navigate('/app/suggestions')} className="gap-2">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Novo Post</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </FadeIn>

      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as TabValue)}
        className="space-y-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TabsList className="grid w-full grid-cols-3 sm:inline-flex sm:w-auto">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="size-4" />
              <span>Pendentes</span>
              {pendingPosts.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning"
                >
                  {pendingPosts.length}
                </motion.span>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar className="size-4" />
              <span>Agendados</span>
              {scheduledPosts.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary"
                >
                  {scheduledPosts.length}
                </motion.span>
              )}
            </TabsTrigger>
            <TabsTrigger value="published" className="gap-2">
              <Send className="size-4" />
              <span>Publicados</span>
              {publishedPosts.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 rounded-full bg-success/20 px-2 py-0.5 text-xs text-success"
                >
                  {publishedPosts.length}
                </motion.span>
              )}
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando posts...</p>
            </div>
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="flex flex-col items-center gap-3 py-8">
                <p className="font-medium text-destructive">Erro ao carregar posts</p>
                <Button variant="outline" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isLoading && !error && (
          <>
            <TabsContent value="pending" className="space-y-3">
              {renderPostList(pendingPosts)}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-3">
              {scheduledPosts.length === 0 ? (
                <EmptyState
                  message="Agende posts para publicação automática."
                  onCreatePost={handleCreatePost}
                />
              ) : (
                renderPostList(scheduledPosts)
              )}
            </TabsContent>

            <TabsContent value="published" className="space-y-3">
              {publishedPosts.length === 0 ? (
                <EmptyState
                  message="Posts publicados aparecerão aqui."
                  onCreatePost={handleCreatePost}
                />
              ) : (
                renderPostList(publishedPosts)
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {editingPost && <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />}
    </motion.div>
  )
}
