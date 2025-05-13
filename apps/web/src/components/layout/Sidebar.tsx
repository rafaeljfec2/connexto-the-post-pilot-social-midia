import { cn } from '@/lib/utils'
import { History, Settings, Timer, User, CreditCard } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  {
    name: 'Posts Pendentes',
    href: '/app/pending',
    icon: Timer,
  },
  {
    name: 'Histórico',
    href: '/app/history',
    icon: History,
  },
  {
    name: 'Assinatura',
    href: '/app/subscription',
    icon: CreditCard,
  },
  {
    name: 'Perfil',
    href: '/app/profile',
    icon: User,
  },
  {
    name: 'Configurações',
    href: '/app/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  if (mobile) {
    return (
      <div className="flex w-64 flex-col bg-card text-secondary-foreground">
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map(item => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-secondary-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    )
  }
  // Desktop: fixed sidebar below header
  return (
    <aside className="fixed left-0 top-16 z-30 mt-4 hidden h-[calc(100vh-4rem)] w-64 flex-col bg-card text-secondary-foreground md:flex">
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map(item => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-secondary-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
