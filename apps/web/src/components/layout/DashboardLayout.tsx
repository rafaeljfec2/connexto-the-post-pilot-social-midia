import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fixa em md+ */}
      <Sidebar />
      {/* Drawer para mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        {/* SheetTrigger visível apenas em mobile */}
        <SheetTrigger asChild>
          <button
            className="fixed top-4 left-4 z-50 md:hidden p-2 rounded hover:bg-muted focus:outline-none"
            aria-label="Abrir menu"
          >
            <svg className="h-6 w-6 text-secondary-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-card text-secondary-foreground">
          <Sidebar mobile={true} />
        </SheetContent>
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </Sheet>
    </div>
  )
} 