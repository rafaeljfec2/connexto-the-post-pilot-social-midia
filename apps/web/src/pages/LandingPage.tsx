import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-semibold">The Post Pilot</h1>
          <Button onClick={() => navigate('/login')}>Entrar</Button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center gap-8 py-24 text-center">
          <h2 className="text-4xl font-bold">Automatize suas redes sociais com IA</h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Crie, agende e gerencie seus posts em múltiplas redes sociais com a ajuda da
            inteligência artificial.
          </p>
          <Button size="lg" onClick={() => navigate('/login')}>
            Começar Agora
          </Button>
        </div>
      </main>
    </div>
  );
} 