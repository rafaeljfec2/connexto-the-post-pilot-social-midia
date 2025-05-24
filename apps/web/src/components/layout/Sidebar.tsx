import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, FileText, Home, Settings, User, CreditCard, Menu, Lightbulb } from 'lucide-react'
import { useState } from 'react'

const routes = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/app',
  },
  {
    label: 'Posts Pendentes',
    icon: FileText,
    href: '/app/pending',
  },
  {
    label: 'Sugestões',
    icon: Lightbulb,
    href: '/app/suggestions',
  },
  {
    label: 'Histórico',
    icon: Clock,
    href: '/app/history',
  },
  {
    label: 'Assinatura',
    icon: CreditCard,
    href: '/app/subscription',
  },
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
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigation = (href: string) => {
    navigate(href)
    setIsOpen(false)
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">The Post Pilot</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-1 p-4">
          {routes.map(route => (
            <Button
              key={route.href}
              variant={location.pathname === route.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-2',
                location.pathname === route.href && 'bg-secondary'
              )}
              onClick={() => handleNavigation(route.href)}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </>
  )

  return (
    <>
      {/* Menu hambúrguer (Sheet) mobile first */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-background p-0 md:hidden">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      {/* Sidebar fixa só em desktop */}
      <aside className="hidden w-64 border-r bg-background md:block">
        <SidebarContent />
      </aside>
    </>
  )
}
