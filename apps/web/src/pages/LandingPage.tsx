import { motion } from 'framer-motion'
import { Send, Sparkles, Clock, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Sparkles,
      title: 'IA Integrada',
      description: 'Gere conteúdo automaticamente com inteligência artificial.',
    },
    {
      icon: Clock,
      title: 'Agendamento',
      description: 'Agende posts para publicação nos melhores horários.',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Acompanhe métricas e engajamento em tempo real.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Send className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Post Pilot</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => navigate('/login')}>Entrar</Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 py-20 text-center md:py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm"
          >
            <Sparkles className="mr-2 size-4 animate-pulse text-primary" />
            Powered by AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Automatize suas <span className="text-primary">redes sociais</span> com IA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl text-lg text-muted-foreground"
          >
            Crie, agende e gerencie seus posts em múltiplas redes sociais com a ajuda da
            inteligência artificial. Economize tempo e aumente seu engajamento.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
                <Send className="size-4" />
                Começar Agora
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Saiba Mais
              </Button>
            </motion.div>
          </motion.div>
        </section>

        <section className="border-t bg-muted/50">
          <div className="container py-16 md:py-24">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  whileHover={{
                    y: -8,
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
                  }}
                  className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center transition-colors hover:border-primary/30"
                >
                  <motion.div
                    className="rounded-full bg-primary/10 p-3"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <feature.icon className="size-6 text-primary" />
                  </motion.div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t py-6"
      >
        <div className="container text-center text-sm text-muted-foreground">
          © 2026{' '}
          <a
            href="https://www.connexto.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary transition-colors hover:text-primary/80"
          >
            Created by Connexto Tecnologia
          </a>
          {'. '}Todos os direitos reservados.
        </div>
      </motion.footer>
    </div>
  )
}
