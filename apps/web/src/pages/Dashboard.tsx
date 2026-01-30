import { motion } from 'framer-motion'
import { Send, Clock, Sparkles, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EngagementLineChart } from '@/components/dashboard/EngagementLineChart'
import { FadeIn } from '@/components/ui/animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePosts } from '@/hooks/usePosts'

interface KpiData {
  readonly title: string
  readonly value: string
  readonly change?: string
  readonly changeType?: 'positive' | 'negative' | 'neutral'
  readonly icon: React.ReactNode
}

function StatCard({ title, value, change, changeType, icon }: KpiData) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="text-2xl font-bold tracking-tight"
            >
              {value}
            </motion.p>
            {change && (
              <p
                className={`text-xs ${
                  changeType === 'positive'
                    ? 'text-success'
                    : changeType === 'negative'
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                }`}
              >
                {change}
              </p>
            )}
          </div>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            className="rounded-lg bg-primary/10 p-2.5"
          >
            {icon}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

const actionButtonVariants = {
  initial: { x: 0 },
  hover: { x: 5 },
}

export function Dashboard() {
  const navigate = useNavigate()
  const { data: posts, isLoading } = usePosts()

  const safePosts = Array.isArray(posts) ? posts : []

  const pendingCount = safePosts.filter(
    p => p.status === 'success' || p.status === 'Pendente' || p.status === 'started'
  ).length

  const publishedCount = safePosts.filter(p => p.status === 'published').length

  const totalPosts = safePosts.length

  const kpis: KpiData[] = [
    {
      title: 'Total de Posts',
      value: totalPosts.toString(),
      change: totalPosts > 0 ? 'Posts gerados pela IA' : 'Nenhum post ainda',
      changeType: 'neutral',
      icon: <FileText className="size-5 text-primary" />,
    },
    {
      title: 'Posts Publicados',
      value: publishedCount.toString(),
      change: publishedCount > 0 ? 'No LinkedIn' : 'Nenhum publicado',
      changeType: publishedCount > 0 ? 'positive' : 'neutral',
      icon: <Send className="size-5 text-primary" />,
    },
    {
      title: 'Posts Pendentes',
      value: pendingCount.toString(),
      change: pendingCount > 0 ? 'Aguardando publicação' : 'Nenhum pendente',
      changeType: pendingCount > 0 ? 'neutral' : 'positive',
      icon: <Clock className="size-5 text-primary" />,
    },
  ]

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <FadeIn>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus posts e métricas.</p>
        </div>
      </FadeIn>

      <motion.div variants={containerVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            custom={index}
          >
            <StatCard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Engajamento ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="h-[300px]"
              >
                <EngagementLineChart />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div whileHover="hover" initial="initial">
                <Button
                  variant="outline"
                  className="h-auto w-full justify-between py-3 transition-colors hover:border-primary/30"
                  onClick={() => navigate('/app/suggestions')}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <Sparkles className="size-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Criar com IA</p>
                      <p className="text-xs text-muted-foreground">Gere posts automaticamente</p>
                    </div>
                  </div>
                  <motion.div variants={actionButtonVariants}>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </motion.div>
                </Button>
              </motion.div>

              <motion.div whileHover="hover" initial="initial">
                <Button
                  variant="outline"
                  className="h-auto w-full justify-between py-3 transition-colors hover:border-warning/30"
                  onClick={() => navigate('/app/pending')}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-warning/10 p-2">
                      <FileText className="size-4 text-warning" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Ver Pendentes</p>
                      <p className="text-xs text-muted-foreground">
                        {pendingCount} posts aguardando
                      </p>
                    </div>
                  </div>
                  <motion.div variants={actionButtonVariants}>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </motion.div>
                </Button>
              </motion.div>

              <motion.div whileHover="hover" initial="initial">
                <Button
                  variant="outline"
                  className="h-auto w-full justify-between py-3 transition-colors hover:border-success/30"
                  onClick={() => navigate('/app/profile')}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-success/10 p-2">
                      <CheckCircle2 className="size-4 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Conectar LinkedIn</p>
                      <p className="text-xs text-muted-foreground">Configure para publicar</p>
                    </div>
                  </div>
                  <motion.div variants={actionButtonVariants}>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </motion.div>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {totalPosts === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="rounded-full bg-primary/10 p-4"
              >
                <Sparkles className="size-8 text-primary" />
              </motion.div>
              <div className="space-y-1 text-center">
                <p className="text-lg font-medium">Comece a criar!</p>
                <p className="max-w-md text-muted-foreground">
                  Use a inteligência artificial para gerar posts incríveis para suas redes sociais.
                  Clique no botão abaixo para começar.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => navigate('/app/suggestions')} className="gap-2">
                  <Sparkles className="size-4" />
                  Criar meu primeiro post
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
