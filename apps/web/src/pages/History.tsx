import { HistoryKpiCard } from '@/components/dashboard/HistoryKpiCard'
import { HistoryEngagementChart } from '@/components/dashboard/HistoryEngagementChart'
import { HistoryPostsTable } from '@/components/dashboard/HistoryPostsTable'
import { BarChart3, Send, Users, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function History() {
  return (
    <div className="w-full space-y-6 px-2 py-4 sm:px-4 md:mx-auto md:max-w-5xl md:px-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HistoryKpiCard title="Posts" value="320" icon={<Send className="h-5 w-5" />} />
        <HistoryKpiCard
          title="Engajamento"
          value="12.400"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <HistoryKpiCard title="Seguidores" value="2.800" icon={<Users className="h-5 w-5" />} />
        <HistoryKpiCard
          title="Mais curtido"
          value="1.200"
          icon={<ThumbsUp className="h-5 w-5" />}
        />
      </div>

      {/* Filtros mockados */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Select>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Rede Social" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full sm:w-auto">Filtrar</Button>
      </div>

      {/* Gráfico de engajamento */}
      <HistoryEngagementChart />

      {/* Tabela de posts históricos */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Histórico de Posts</h2>
          <Button variant="outline">Exportar</Button>
        </div>
        <HistoryPostsTable />
      </div>
    </div>
  )
}
