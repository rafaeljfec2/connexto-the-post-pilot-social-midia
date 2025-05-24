import { PendingKpiCard } from '@/components/dashboard/PendingKpiCard'
import { PendingPostsFilters } from '@/components/dashboard/PendingPostsFilters'
import { PendingPostCard } from '@/components/dashboard/PendingPostCard'
import { Clock, Send, Calendar, Edit } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'
import { useState } from 'react'
import { Post } from '@/services/posts.service'
import { EditPostModal } from '@/components/dashboard/EditPostModal'

export function PendingPosts() {
  const { data: posts = [], isLoading } = usePosts()
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const mappedPosts = posts.map(post => ({
    id: post.id,
    input: post.input,
    output: post.output,
    model: post.model,
    status: post.status === 'success' ? 'Pendente' : post.status,
    createdAt: new Date(post.createdAt).toLocaleString('pt-BR'),
    usage: post.usage,
    onEdit: () => setEditingPost(post),
  }))

  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-5xl md:px-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PendingKpiCard
          title="Pendentes"
          value={mappedPosts.filter(p => p.status === 'Pendente').length.toString()}
          icon={<Clock className="h-5 w-5" />}
        />
        <PendingKpiCard
          title="Agendados"
          value={mappedPosts.filter(p => p.status === 'Agendado').length.toString()}
          icon={<Calendar className="h-5 w-5" />}
        />
        <PendingKpiCard
          title="Prontos para publicar"
          value={mappedPosts.filter(p => p.status === 'Pendente').length.toString()}
          icon={<Send className="h-5 w-5" />}
        />
        <PendingKpiCard
          title="Editando"
          value={editingPost ? '1' : '0'}
          icon={<Edit className="h-5 w-5" />}
        />
      </div>

      {/* Filtros avançados */}
      <PendingPostsFilters />

      {/* Lista de posts pendentes/agendados */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Carregando posts...</div>
        ) : (
          mappedPosts.map(post => (
            <PendingPostCard
              key={post.id}
              input={post.input}
              output={post.output}
              model={post.model}
              status={post.status}
              createdAt={post.createdAt}
              usage={post.usage}
              onEdit={post.onEdit}
              onSchedule={() => {}}
              onPublish={() => {}}
              onDelete={() => {}}
            />
          ))
        )}
      </div>

      {/* Modal de edição */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          // onSave={...} // implementar depois
        />
      )}
    </div>
  )
}
