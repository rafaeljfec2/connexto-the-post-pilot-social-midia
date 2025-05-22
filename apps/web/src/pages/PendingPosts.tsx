import { PendingKpiCard } from '@/components/dashboard/PendingKpiCard'
import { PendingPostsFilters } from '@/components/dashboard/PendingPostsFilters'
import { PendingPostCard } from '@/components/dashboard/PendingPostCard'
import { Clock, Send, Calendar, Edit } from 'lucide-react'

const mockPosts = [
  {
    id: '1',
    content: 'Novo artigo sobre marketing digital: Como aumentar seu alcance orgânico em 2024',
    socialMedias: ['linkedin', 'twitter'],
    status: 'Pendente',
    createdAt: '15/03/2024 10:00',
  },
  {
    id: '2',
    content: 'Lançamento do nosso novo produto! Confira as principais funcionalidades.',
    socialMedias: ['linkedin', 'facebook', 'instagram'],
    status: 'Agendado',
    createdAt: '14/03/2024 15:30',
    scheduledFor: '20/03/2024 15:00',
  },
]

export function PendingPosts() {
  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-5xl md:px-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <PendingKpiCard
          title="Pendentes"
          value={mockPosts.filter(p => p.status === 'Pendente').length.toString()}
          icon={<Clock className="h-5 w-5" />}
        />
        <PendingKpiCard
          title="Agendados"
          value={mockPosts.filter(p => p.status === 'Agendado').length.toString()}
          icon={<Calendar className="h-5 w-5" />}
        />
        <PendingKpiCard
          title="Prontos para publicar"
          value={mockPosts.filter(p => p.status === 'Pendente').length.toString()}
          icon={<Send className="h-5 w-5" />}
        />
        <PendingKpiCard title="Editando" value="1" icon={<Edit className="h-5 w-5" />} />
      </div>

      {/* Filtros avançados */}
      <PendingPostsFilters />

      {/* Lista de posts pendentes/agendados */}
      <div className="space-y-4">
        {mockPosts.map(post => (
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
        ))}
      </div>
    </div>
  )
}
