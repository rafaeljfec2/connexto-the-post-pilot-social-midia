import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="relative h-screen w-full">
      <Header />
      <div className="flex h-full pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 w-full md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 