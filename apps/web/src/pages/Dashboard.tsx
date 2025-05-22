import { Send, BarChart3, Users, Clock } from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { EngagementLineChart } from '@/components/dashboard/EngagementLineChart'
import { PostsByNetworkBarChart } from '@/components/dashboard/PostsByNetworkBarChart'
import { RecentPostsTable } from '@/components/dashboard/RecentPostsTable'
import { Button } from '@/components/ui/button'

export function Dashboard() {
  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-5xl md:px-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard title="Total de Posts" value="120" icon={<Send className="h-5 w-5" />} />
        <KpiCard title="Engajamento Total" value="8.500" icon={<BarChart3 className="h-5 w-5" />} />
        <KpiCard title="Seguidores" value="2.300" icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Posts Pendentes" value="5" icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <EngagementLineChart />
        <PostsByNetworkBarChart />
      </div>

      {/* Lista de posts recentes */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Posts Recentes</h2>
          <Button variant="outline">Ver todos</Button>
        </div>
        <RecentPostsTable />
      </div>
    </div>
  )
}
