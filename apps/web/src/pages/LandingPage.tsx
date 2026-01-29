import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Send, Sparkles, Clock, BarChart3 } from 'lucide-react'

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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Send className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Post Pilot</span>
          </div>
          <Button onClick={() => navigate('/login')}>Entrar</Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 py-20 text-center md:py-32">
          <div className="inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Sparkles className="mr-2 size-4 text-primary" />
            Powered by AI
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Automatize suas <span className="text-primary">redes sociais</span> com IA
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Crie, agende e gerencie seus posts em múltiplas redes sociais com a ajuda da
            inteligência artificial. Economize tempo e aumente seu engajamento.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              <Send className="size-4" />
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Saiba Mais
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/50">
          <div className="container py-16 md:py-24">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(feature => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center"
                >
                  <div className="rounded-full bg-primary/10 p-3">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2024 Post Pilot. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
