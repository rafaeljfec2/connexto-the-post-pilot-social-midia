import { createBrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorPage } from '@/components/error/ErrorPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout';
import { PendingPosts } from '@/pages/PendingPosts';
import { History } from '@/pages/History';
import { Settings } from '@/pages/Settings';
import { Login } from '@/pages/Login';
import { LandingPage } from '@/pages/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/app',
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'pending',
        element: <PendingPosts />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage code={404} />,
  },
]); 