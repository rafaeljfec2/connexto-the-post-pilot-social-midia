import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Clock, FileText, Home, Settings, User, CreditCard } from 'lucide-react'

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
    label: 'Histórico',
    icon: Clock,
    href: '/app/history',
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/app/settings',
  },
  {
    label: 'Perfil',
    icon: User,
    href: '/app/profile',
  },
  {
    label: 'Assinatura',
    icon: CreditCard,
    href: '/app/subscription',
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <>
      {/* Sidebar para desktop */}
      <aside className="hidden w-64 border-r bg-background md:block">
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
                onClick={() => navigate(route.href)}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Sidebar para mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <BarChart3 className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
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
                  onClick={() => navigate(route.href)}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
