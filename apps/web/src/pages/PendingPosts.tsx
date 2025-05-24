import { PendingKpiCard } from '@/components/dashboard/PendingKpiCard'
import { PendingPostsFilters } from '@/components/dashboard/PendingPostsFilters'
import { PendingPostCard } from '@/components/dashboard/PendingPostCard'
import { Clock, Send, Calendar, Edit } from 'lucide-react'
import { usePosts } from '@/hooks/usePosts'

export function PendingPosts() {
  const { data: posts = [], isLoading } = usePosts()

  // Exemplo de mapeamento para o componente visual
  const mappedPosts = posts.map(post => ({
    id: post.id,
    content: post.input,
    status: post.status === 'success' ? 'Pendente' : post.status, // ajuste conforme regra de negócio
    createdAt: new Date(post.createdAt).toLocaleString('pt-BR'),
    scheduledFor: undefined, // ajuste se houver campo futuro
    socialMedias: [], // ajuste se houver integração futura
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
        <PendingKpiCard title="Editando" value="1" icon={<Edit className="h-5 w-5" />} />
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
              content={post.content}
              status={post.status}
              createdAt={post.createdAt}
              scheduledFor={post.scheduledFor}
              socialMedias={post.socialMedias}
              onEdit={() => {}}
              onSchedule={() => {}}
              onPublish={() => {}}
              onDelete={() => {}}
            />
          ))
        )}
      </div>
    </div>
  )
}
