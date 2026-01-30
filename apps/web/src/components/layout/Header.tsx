import { Moon, Sun, Bell, LogOut, ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

const routeTitles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/pending': 'Posts',
  '/app/suggestions': 'Sugestões IA',
  '/app/history': 'Publicados',
  '/app/profile': 'Perfil',
  '/app/settings': 'Configurações',
  '/app/subscription': 'Assinatura',
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  const currentTitle = routeTitles[location.pathname] ?? 'Post Pilot'

  const handleLogout = () => {
    logout()
    toast({
      title: 'Sessão encerrada',
      description: 'Até logo!',
    })
    navigate('/login')
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 pl-12 md:pl-0">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="hidden sm:inline">Post Pilot</span>
            <ChevronRight className="hidden size-4 sm:inline" />
            <span className="font-medium text-foreground">{currentTitle}</span>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-9" aria-label="Notificações">
            <Bell className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label="Alternar tema"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative ml-2 size-9 rounded-full p-0">
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-sm text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name ?? 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/app/profile')}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
