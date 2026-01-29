import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, FileText, LayoutDashboard, Settings, User, Menu, Send } from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  readonly label: string
  readonly icon: React.ElementType
  readonly href: string
}

interface NavGroup {
  readonly title: string
  readonly items: readonly NavItem[]
}

interface NavContentProps {
  readonly navigation: readonly NavGroup[]
  readonly isActive: (href: string) => boolean
  readonly onNavigate: (href: string) => void
}

const navigation: readonly NavGroup[] = [
  {
    title: 'Criar',
    items: [
      {
        label: 'Sugestões IA',
        icon: Sparkles,
        href: '/app/suggestions',
      },
    ],
  },
  {
    title: 'Gerenciar',
    items: [
      {
        label: 'Posts',
        icon: FileText,
        href: '/app/pending',
      },
      {
        label: 'Publicados',
        icon: Send,
        href: '/app/history',
      },
    ],
  },
  {
    title: 'Análise',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/app',
      },
    ],
  },
  {
    title: 'Conta',
    items: [
      {
        label: 'Perfil',
        icon: User,
        href: '/app/profile',
      },
      {
        label: 'Configurações',
        icon: Settings,
        href: '/app/settings',
      },
    ],
  },
]

function NavContent({ navigation, isActive, onNavigate }: Readonly<NavContentProps>) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Send className="size-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Post Pilot</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigation.map(group => (
            <div key={group.title}>
              <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map(item => {
                  const active = isActive(item.href)
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 font-normal',
                        active && 'bg-primary/10 font-medium text-primary hover:bg-primary/15'
                      )}
                      onClick={() => onNavigate(item.href)}
                    >
                      <item.icon
                        className={cn('size-4', active ? 'text-primary' : 'text-muted-foreground')}
                      />
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <p className="text-center text-xs text-muted-foreground">Post Pilot v1.0</p>
      </div>
    </div>
  )
}

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigation = (href: string) => {
    navigate(href)
    setIsOpen(false)
  }

  const isActive = (href: string) => {
    if (href === '/app') {
      return location.pathname === '/app'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent navigation={navigation} isActive={isActive} onNavigate={handleNavigation} />
        </SheetContent>
      </Sheet>

      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <NavContent navigation={navigation} isActive={isActive} onNavigate={handleNavigation} />
      </aside>
    </>
  )
}
