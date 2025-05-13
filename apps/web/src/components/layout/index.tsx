import { Outlet, useNavigation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { PageLoader } from '../ui/PageLoader'

export function Layout() {
  const navigation = useNavigation()
  return (
    <div className="relative h-screen w-full">
      <Header />
      <div className="flex h-full pt-16">
        <Sidebar />
        <main className="w-full flex-1 overflow-y-auto p-6 md:ml-64">
          {navigation.state === 'loading' && <PageLoader />}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
