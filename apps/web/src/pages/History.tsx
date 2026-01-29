import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HistoryEngagementChart } from '@/components/dashboard/HistoryEngagementChart'
import { HistoryPostsTable } from '@/components/dashboard/HistoryPostsTable'
import { Send, TrendingUp, ThumbsUp, Download, Filter } from 'lucide-react'

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

export function History() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Publicados</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus posts publicados.</p>
        </div>
        <Button variant="outline" className="w-full gap-2 sm:w-auto">
          <Download className="size-4" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Publicado"
          value="320"
          icon={<Send className="size-5 text-primary" />}
          description="Últimos 30 dias"
        />
        <StatCard
          title="Engajamento Total"
          value="12.4K"
          icon={<TrendingUp className="size-5 text-primary" />}
          description="+8% vs. mês anterior"
        />
        <StatCard
          title="Post Mais Popular"
          value="1.2K"
          icon={<ThumbsUp className="size-5 text-primary" />}
          description="Interações"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium">Engajamento ao Longo do Tempo</CardTitle>
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
              <Select defaultValue="all">
                <SelectTrigger className="h-9 w-full sm:w-36">
                  <SelectValue placeholder="Rede Social" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
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
          <CardTitle className="text-lg font-medium">Histórico de Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryPostsTable />
        </CardContent>
      </Card>
    </div>
  )
}
