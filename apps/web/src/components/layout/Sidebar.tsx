import { FileText, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLocation, Link } from 'react-router-dom'

const navigation = [
  {
    name: 'Posts Pendentes',
    href: '/',
    icon: FileText,
  },
  {
    name: 'Histórico',
    href: '/history',
    icon: History,
  },
  {
    name: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/40 bg-background">
      <div className="flex h-14 items-center border-b border-border/40 px-4">
        <span className="font-semibold">ThePostPilot</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border/40 p-4">
        <Button className="w-full" size="sm">
          Novo Post
        </Button>
      </div>
    </div>
  )
} 