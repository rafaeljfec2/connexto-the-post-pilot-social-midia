import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FcGoogle } from 'react-icons/fc';
import { SiLinkedin } from 'react-icons/si';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = location.state?.from?.pathname || '/app';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      // TODO: Implementar chamada à API de autenticação
      localStorage.setItem('isAuthenticated', 'true');
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Redirecionando para o dashboard...',
      });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: 'Verifique suas credenciais e tente novamente.',
      });
    }
  }

  function handleSocialLogin(provider: 'google' | 'linkedin') {
    // TODO: Integrar autenticação real
    toast({
      title: `Login com ${provider === 'google' ? 'Google' : 'LinkedIn'} não implementado`,
      description: 'Integração real deve ser feita via OAuth.',
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card shadow-lg p-8 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">The Post Pilot</h1>
          <p className="text-muted-foreground">Acesse sua conta para gerenciar seus posts</p>
        </div>
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2 justify-center"
            onClick={() => handleSocialLogin('google')}
          >
            <FcGoogle className="h-5 w-5" /> Entrar com Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2 justify-center"
            onClick={() => handleSocialLogin('linkedin')}
          >
            <SiLinkedin className="h-5 w-5 text-[#0077B5]" /> Entrar com LinkedIn
          </Button>
        </div>
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou entre com email</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input placeholder="******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 