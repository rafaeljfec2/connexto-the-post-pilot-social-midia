import { cn } from '@/lib/utils'
import { History, Settings, Timer } from 'lucide-react'
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
    name: 'Configurações',
    href: '/app/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  return (
    <div className="flex w-64 flex-col border-r">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">Menu</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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