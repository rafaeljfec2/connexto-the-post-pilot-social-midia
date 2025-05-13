import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  code?: number;
  message?: string;
}

export function ErrorPage({ code = 404, message = 'Página não encontrada' }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">{code}</h1>
      <p className="text-lg text-muted-foreground">{message}</p>
      <Button onClick={() => navigate(-1)}>Voltar</Button>
    </div>
  );
} 