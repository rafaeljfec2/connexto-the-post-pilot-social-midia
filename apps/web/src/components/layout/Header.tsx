import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun, User, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'

export function Header({
  onOpenSidebar,
  SheetTrigger,
}: Readonly<{ onOpenSidebar?: () => void; SheetTrigger?: React.ElementType }>) {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    toast({
      title: 'Logout realizado com sucesso!',
      description: 'Redirecionando para a página inicial...',
    })
    navigate('/login')
  }

  return (
    <header className="fixed left-0 top-0 z-40 flex h-16 w-full items-center rounded-lg border-b bg-background bg-white px-4 text-secondary-foreground text-secondary-foreground shadow shadow dark:bg-zinc-900 md:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          {SheetTrigger ? (
            <SheetTrigger asChild>
              <button
                className="rounded p-2 hover:bg-muted focus:outline-none md:hidden"
                aria-label="Abrir menu"
                onClick={onOpenSidebar}
              >
                <svg
                  className="h-6 w-6 text-secondary-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </SheetTrigger>
          ) : (
            <button
              className="rounded p-2 hover:bg-muted focus:outline-none md:hidden"
              aria-label="Abrir menu"
              onClick={onOpenSidebar}
            >
              <svg
                className="h-6 w-6 text-secondary-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold md:text-xl">The Post Pilot</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>Claro</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>Escuro</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>Sistema</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => logout()}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
