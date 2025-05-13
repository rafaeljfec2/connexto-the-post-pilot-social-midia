import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/ThemeProvider'
import { Moon, Sun, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'

export function Header({ onOpenSidebar, SheetTrigger }: { onOpenSidebar?: () => void, SheetTrigger?: React.ElementType }) {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    toast({
      title: 'Logout realizado com sucesso!',
      description: 'Redirecionando para a página inicial...',
    })
    navigate('/login')
  }

  return (
    <header className="border-b border-border bg-card text-secondary-foreground">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          {SheetTrigger ? (
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 rounded hover:bg-muted focus:outline-none"
                aria-label="Abrir menu"
                onClick={onOpenSidebar}
              >
                <svg className="h-6 w-6 text-secondary-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </SheetTrigger>
          ) : (
            <button
              className="md:hidden p-2 rounded hover:bg-muted focus:outline-none"
              aria-label="Abrir menu"
              onClick={onOpenSidebar}
            >
              <svg className="h-6 w-6 text-secondary-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="text-lg md:text-xl font-semibold">The Post Pilot</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 